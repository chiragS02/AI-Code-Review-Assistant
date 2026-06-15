const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const env = require("../config/env");
const logger = require("../utils/logger");

if (env.geminiAllowInsecureTls) {
  // Development-only escape hatch for environments with untrusted corporate proxies/certs.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  logger.warn("GEMINI_ALLOW_INSECURE_TLS=true enabled. TLS certificate verification is disabled.");
}

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

function createHttpError(statusCode, message, cause) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (cause) {
    error.cause = cause;
  }
  return error;
}

function mapGeminiError(statusCode, upstreamMessage) {
  if (statusCode === 401) {
    return createHttpError(
      401,
      "Gemini API key is invalid or missing. Update GEMINI_API_KEY in backend/.env.",
    );
  }

  if (statusCode === 403) {
    return createHttpError(
      403,
      "Gemini request forbidden. Verify API key permissions and project configuration.",
    );
  }

  if (statusCode === 404) {
    return createHttpError(
      400,
      `Gemini model '${env.geminiModel}' was not found or is unavailable for this key.`,
    );
  }

  if (statusCode === 429) {
    return createHttpError(
      429,
      "Gemini quota/rate limit exceeded. Check billing/usage, then retry.",
    );
  }

  if (statusCode >= 500 && statusCode < 600) {
    return createHttpError(502, `Gemini upstream error: ${upstreamMessage}`);
  }

  return createHttpError(statusCode || 500, `Gemini request failed: ${upstreamMessage}`);
}

function inferGeminiStatus(error) {
  const directStatus = Number(error?.statusCode || error?.status);
  if (Number.isInteger(directStatus) && directStatus > 0) {
    return directStatus;
  }

  const message = String(error?.message || "");
  const match = message.match(/\b(\d{3})\b/);
  if (match) {
    return Number(match[1]);
  }

  return 502;
}

function isTlsCertificateError(error) {
  const message = String(error?.message || "");
  const causeMessage = String(error?.cause?.message || "");
  const combined = `${message} ${causeMessage}`.toLowerCase();

  return (
    combined.includes("unable to get local issuer certificate") ||
    combined.includes("self signed certificate") ||
    combined.includes("certificate")
  );
}

function extractGeminiText(response) {
  const candidateParts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(candidateParts)) {
    const combined = candidateParts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("\n")
      .trim();

    if (combined) {
      return combined;
    }
  }

  if (typeof response?.text === "function") {
    const value = response.text();
    return typeof value === "string" ? value.trim() : "";
  }

  if (typeof response?.text === "string") {
    return response.text.trim();
  }

  return "";
}

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    issues: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          severity: {
            type: "STRING",
            enum: ["BUG", "SECURITY", "PERFORMANCE", "STYLE"],
          },
          title: { type: "STRING" },
          explanation: { type: "STRING" },
          fix: { type: "STRING" },
        },
        required: ["severity", "title", "explanation", "fix"],
      },
    },
    suggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
        },
        required: ["title", "description"],
      },
    },
    improvedCode: {
      type: "STRING",
      nullable: true,
    },
    improvedLanguage: {
      type: "STRING",
      nullable: true,
    },
  },
  required: ["issues", "suggestions", "improvedCode", "improvedLanguage"],
};

async function requestGeminiJson({ systemPrompt, userPrompt }) {
  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
      },
    });

    const normalized = extractGeminiText(response);

    if (!normalized) {
      throw createHttpError(502, "Gemini returned an empty response.");
    }

    return normalized;
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    if (isTlsCertificateError(error)) {
      throw createHttpError(
        502,
        "TLS certificate trust failed when calling Gemini. Configure trusted CA certificates, or set GEMINI_ALLOW_INSECURE_TLS=true for local development only.",
        error,
      );
    }

    const statusCode = inferGeminiStatus(error);
    const upstreamMessage = error?.message || "Gemini request failed.";
    throw mapGeminiError(statusCode, upstreamMessage);
  }
}

const reviewResponseSchema = z.object({
  issues: z
    .array(
      z.object({
        severity: z.enum(["BUG", "SECURITY", "PERFORMANCE", "STYLE"]),
        title: z.string().min(1),
        explanation: z.string().min(1),
        fix: z.string().min(1),
      }),
    )
    .default([]),
  suggestions: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .default([]),
  improvedCode: z.string().nullable().default(null),
  improvedLanguage: z.string().nullable().default(null),
});

function extractJsonObject(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model returned non-JSON review output.");
  }

  return trimmed.slice(start, end + 1);
}

async function generateStructuredCodeReview({ language, code, context }) {
  const normalizedLanguage = language.trim() || "plaintext";

  const systemPrompt = [
    "You are a principal software engineer with 15+ years of experience across multiple programming languages.",
    "Explain problems clearly, prefer optimized solutions, follow clean-code principles, and avoid unnecessary verbosity.",
    "Return valid JSON only with no markdown fences, prose, or leading/trailing commentary.",
    `Apply ${normalizedLanguage}-specific conventions, standard library idioms, and ecosystem best practices.`,
  ].join(" ");

  const userPrompt = [
    `Language: ${normalizedLanguage}`,
    context ? `Context: ${context}` : "Context: N/A",
    "Return JSON with exactly this shape:",
    JSON.stringify(
      {
        issues: [
          {
            severity: "BUG",
            title: "string",
            explanation: "string",
            fix: "string",
          },
        ],
        suggestions: [
          {
            title: "string",
            description: "string",
          },
        ],
        improvedCode: "string or null",
        improvedLanguage: normalizedLanguage,
      },
      null,
      2,
    ),
    "Rules:",
    "- Explain each issue with what is wrong, why it matters, and how to fix it.",
    "- Prioritize correctness, security, performance, maintainability, and scalability.",
    "- Keep the response concise and useful.",
    "- If no improved rewrite is needed, set improvedCode to null.",
    "Code:",
    code,
  ].join("\n\n");

  let outputText;
  try {
    outputText = await requestGeminiJson({
      systemPrompt,
      userPrompt,
    });
  } catch (error) {
    logger.error(
      "Gemini request failed",
      error?.statusCode || error?.status || "",
      error?.message || "",
    );
    throw error;
  }

  try {
    const parsed = JSON.parse(extractJsonObject(outputText));
    const review = reviewResponseSchema.parse(parsed);
    return {
      ...review,
      improvedLanguage: review.improvedLanguage || normalizedLanguage,
    };
  } catch (error) {
    logger.error("Failed to parse structured review response", error.message);
    return {
      issues: [],
      suggestions: [
        {
          title: "Model output parsing failed",
          description: "The model returned an unexpected format. Try reviewing again or reduce prompt complexity.",
        },
      ],
      improvedCode: null,
      improvedLanguage: normalizedLanguage,
    };
  }
}

module.exports = {
  generateStructuredCodeReview,
};
