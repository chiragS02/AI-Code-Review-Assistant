import { Suspense, lazy, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useLiveReview } from './hooks/useLiveReview'

const FeedbackPanel = lazy(() => import('./components/FeedbackPanel'))
const MonacoCodeInput = lazy(() => import('./components/MonacoCodeInput'))

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-slate/70 dark:bg-slate/30 dark:shadow-black/20 dark:backdrop-blur">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500 dark:text-mist/80">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}

function App() {
  const [language, setLanguage] = useState('javascript')
  const [context, setContext] = useState('')
  const [code, setCode] = useState('')
  const { isDark, toggle } = useTheme()
  const { review, meta, isLoading, error, submitNow } = useLiveReview({ language, context, code })

  const onSubmit = async (event) => {
    event.preventDefault()
    await submitNow()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-[radial-gradient(circle_at_top,#1d3557_0%,#0b1220_55%,#070c16_100%)] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">AI Code Review Assistant</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Ship cleaner code with focused AI reviews</h1>
            <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-mist/80 sm:text-base">
              Paste code, submit for analysis, and get concise feedback with issues, suggestions, and improved code.
            </p>
            {meta?.cached ? (
              <p className="mt-2 text-xs font-medium text-aqua">Showing cached review for identical input.</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="mt-1 shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition hover:bg-gray-100 dark:border-slate/70 dark:bg-slate/30 dark:text-mist/80 dark:hover:bg-slate/50"
          >
            {isDark ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard
            title="Code Input"
            subtitle="Choose a language, edit code in Monaco, then click Submit for Review to call the API."
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="context" className="mb-1 block text-sm font-medium text-gray-700 dark:text-mist">
                  Context (optional)
                </label>
                <textarea
                  id="context"
                  name="context"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  placeholder="Any constraints, style guide, or focus areas"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-aqua dark:border-slate/80 dark:bg-ink/70 dark:text-white"
                />
              </div>

              <Suspense fallback={<div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500 dark:border-slate/80 dark:bg-ink/50 dark:text-mist/70">Loading editor...</div>}>
                <MonacoCodeInput
                  language={language}
                  onLanguageChange={setLanguage}
                  code={code}
                  onCodeChange={setCode}
                  isDark={isDark}
                />
              </Suspense>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg bg-aqua px-4 py-2 text-sm font-semibold text-ink transition hover:bg-aqua/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Reviewing...' : 'Submit for Review'}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="AI Feedback"
            subtitle="Structured review output returned only after an explicit submit."
          >
            <Suspense fallback={<div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500 dark:border-slate/80 dark:bg-ink/50 dark:text-mist/70">Loading feedback view...</div>}>
              <FeedbackPanel
                review={review}
                error={error}
                isLoading={isLoading}
                language={language}
                originalCode={code}
                isDark={isDark}
              />
            </Suspense>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

export default App
