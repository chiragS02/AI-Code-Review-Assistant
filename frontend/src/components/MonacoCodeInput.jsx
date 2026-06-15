import Editor from '@monaco-editor/react'

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
]

function MonacoCodeInput({ language, onLanguageChange, code, onCodeChange, isDark = true }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="language" className="mb-1 block text-sm font-medium text-gray-700 dark:text-mist">
          Language
        </label>
        <select
          id="language"
          name="language"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-aqua dark:border-slate/80 dark:bg-ink/70 dark:text-white"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="code-editor" className="mb-1 block text-sm font-medium text-gray-700 dark:text-mist">
          Code
        </label>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate/80">
          <Editor
            height="420px"
            language={language}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MonacoCodeInput
