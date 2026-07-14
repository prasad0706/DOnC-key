import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, ArrowRightIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import Aurora from '../components/Aurora';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Aurora Animated Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40 dark:opacity-40">
        <Aurora
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      {/* Background Spotlight Glows */}
      <div className="glow-spotlight glow-blue w-[500px] h-[500px] top-[-10%] left-[-10%]" />
      <div className="glow-spotlight glow-purple w-[600px] h-[600px] bottom-[-20%] right-[-10%]" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-6 py-6 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">DOnC-key</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-semibold">
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <Link to="/login" className="btn-secondary py-2 px-5">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-slate-950 dark:text-white">
              Transform Documents into <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                Actionable Data APIs
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              DOnC-key is the document intelligence platform built for developers. Extract structured JSON, query docs via AI, and query via document-scoped APIs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="btn-primary px-8 py-3.5 rounded-full flex items-center gap-2"
              >
                Get Started Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="btn-secondary px-8 py-3.5 rounded-full"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Interactive Feature Showcase */}
          <div className="mt-12 relative max-w-4xl mx-auto">
            <div className="card-premium-no-hover p-6 md:p-8 backdrop-blur-md bg-white/70 dark:bg-[#0f172a]/70">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
                    Developer First
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">API-Ready Extraction</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Upload documents or send them directly to our APIs. We use Gemini model intelligence to process text, layouts, images, and tables into structured JSON schemas automatically.
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">GET</span>
                    <span>/api/v1/documents/:id/data</span>
                  </div>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-xs p-5 bg-slate-900 dark:bg-[#090d16] rounded-2xl border border-slate-800 shadow-2xl font-mono text-xs text-blue-400 overflow-hidden">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <span className="text-[10px] text-slate-500">gemini-structured-output</span>
                    </div>
                    <pre className="text-slate-300 overflow-x-auto whitespace-pre">
{`{
  "document": "Q4_Report.pdf",
  "data": {
    "summary": "Revenue grew by 14%...",
    "sentiment": "Positive",
    "entities": ["DOnC-key Corp"],
    "keyPoints": [
      "Record quarterly earnings",
      "API usage hit 10M requests"
    ]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-100/20 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-4">
              Everything You Need For Document AI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              We focus on speed, structure, and simplicity so you can integrate document insight features in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white ">Dynamic AI Sandbox</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Test API requests directly from the browser inside our integrated sandbox playground. Inspect extraction payloads in real-time.
              </p>
            </div>

            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Document-Scoped Keys</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Generate highly granular API keys mapped directly to individual documents. Revoke them anytime to secure access profiles.
              </p>
            </div>

            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Natural Chat Sandbox</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Ask natural language questions about your invoices, reports, or research documents, and let our document chat assistant handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 text-center relative">
        <div className="glow-spotlight glow-purple w-[400px] h-[400px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-950 dark:text-white">Ready to Unlock Document Insights?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">
            Sign in to start structuring documents and deploying them as custom API endpoints today.
          </p>
          <Link
            to="/login"
            className="btn-primary px-8 py-3.5 rounded-full inline-flex items-center gap-2"
          >
            Create Your Account
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
