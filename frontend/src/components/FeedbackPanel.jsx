import { useState } from 'react'
import Editor, { DiffEditor } from '@monaco-editor/react'

// ─── Language → file extension map ───────────────────────────────────────────
const LANG_EXT = {
  javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
  c: 'c', cpp: 'cpp', csharp: 'cs', go: 'go', rust: 'rs',
  html: 'html', css: 'css', json: 'json', plaintext: 'txt',
}

function langToExt(lang) {
  return LANG_EXT[lang?.toLowerCase()] ?? 'txt'
}

function BulletList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <p className="text-sm italic text-gray-400 dark:text-mist/50">{emptyMessage}</p>
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm text-gray-700 dark:text-mist">
          <span className="mt-0.5 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function formatIssue(issue) {
  return `[${issue.severity}] ${issue.title} — ${issue.explanation} Fix: ${issue.fix}`
}

function formatSuggestion(suggestion) {
  return `${suggestion.title} — ${suggestion.description}`
}

function SectionHeading({ label, count }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-mist/70">{label}</h3>
      {count > 0 && (
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-slate/60 dark:text-mist/80">
          {count}
        </span>
      )}
    </div>
  )
}

function IconButton({ onClick, title, children, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition',
        active
          ? 'bg-aqua/20 text-aqua'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate/40 dark:text-mist/70 dark:hover:bg-slate/60',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ImprovedCode({ code, language, originalCode, isDark }) {
  const [copied, setCopied] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const monacoTheme = isDark ? 'vs-dark' : 'light'

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    if (!code) return
    const ext = langToExt(language)
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `improved-code.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!code) {
    return <p className="text-sm italic text-gray-400 dark:text-mist/50">Not applicable.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <IconButton onClick={handleCopy} title="Copy improved code" active={copied}>
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="8" height="9" rx="1" />
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v9a1 1 0 001 1h2" />
              </svg>
              Copy
            </>
          )}
        </IconButton>

        <IconButton onClick={handleDownload} title={`Download as .${langToExt(language)}`}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v8m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" />
          </svg>
          Download .{langToExt(language)}
        </IconButton>

        {originalCode && (
          <IconButton
            onClick={() => setShowDiff((v) => !v)}
            title="Toggle before/after diff view"
            active={showDiff}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 3H2v10h3M11 3h3v10h-3M8 2v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showDiff ? 'Hide Diff' : 'Compare'}
          </IconButton>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate/80">
        {showDiff && originalCode ? (
          <DiffEditor
            height="320px"
            language={language}
            original={originalCode}
            modified={code}
            theme={monacoTheme}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 10, bottom: 10 },
              renderSideBySide: true,
            }}
          />
        ) : (
          <Editor
            height="260px"
            language={language}
            value={code}
            theme={monacoTheme}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 10, bottom: 10 },
              scrollbar: { vertical: 'auto', horizontal: 'auto' },
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function FeedbackPanel({ review, error, isLoading, language, originalCode, isDark = true }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-aqua">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-aqua border-t-transparent" />
        Analyzing code...
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </p>
    )
  }

  if (!review) {
    return (
      <p className="text-sm text-gray-400 dark:text-mist/60">
        Click Submit for Review to send the current code to the backend API.
      </p>
    )
  }

  const issues = review.issues || []
  const suggestions = review.suggestions || []
  const improvedCode = review.improvedCode || null
  const resolvedLang = review.improvedLanguage || language

  return (
    <div className="max-h-[52rem] overflow-y-auto space-y-5 pr-1">
      {issues.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
          <SectionHeading label="Issues" count={issues.length} />
          <BulletList items={issues.map(formatIssue)} emptyMessage="No issues detected." />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-400/20 dark:bg-yellow-400/5">
          <SectionHeading label="Suggestions" count={suggestions.length} />
          <BulletList items={suggestions.map(formatSuggestion)} emptyMessage="No suggestions." />
        </div>
      )}

      <div>
        <SectionHeading label="Improved Code" count={0} />
        <ImprovedCode
          code={improvedCode}
          language={resolvedLang}
          originalCode={originalCode}
          isDark={isDark}
        />
      </div>
    </div>
  )
}
