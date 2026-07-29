import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, ArrowRightIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import Aurora from '../components/Aurora';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('json');

  const codeExamples = {
    json: `{
  "document": "Invoice_2026_04471.pdf",
  "data": {
    "invoice_number": "INV-2026-04471",
    "vendor": "Acme Logistics Inc.",
    "amount_due": "$14,250.00",
    "due_date": "2026-08-15"
  }
}`,
    curl: `curl -X POST https://api.donckey.io/v1/documents/extract \\
  -H "Authorization: Bearer doc_live_8f3a..." \\
  -F "file=@invoice.pdf"`,
    js: `import { Donckey } from '@donckey/sdk';

const client = new Donckey({ apiKey: process.env.DONCKEY_API_KEY });
const result = await client.documents.extract({ file: './invoice.pdf' });
console.log(result.data.invoice_number);`
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--ink)] bg-[var(--canvas)] transition-colors duration-200">
      {/* Aurora Animated Background with Ink Desk Stops */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
        <Aurora
          colorStops={["#0F6E67", "#C98A2C", "#0F6E67"]}
          blend={0.5}
          amplitude={0.8}
          speed={0.5}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-6 py-6 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="border-2 border-[var(--accent-teal)] p-1.5 rounded-md flex items-center justify-center bg-transparent">
              <DocumentTextIcon className="h-6 w-6 text-[var(--accent-teal)]" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-[var(--ink)]">DOnC-key</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-semibold">
            <a href="#features" className="text-[var(--ink-muted)] hover:text-[var(--accent-teal)] transition-colors">Features</a>
            <a href="#code" className="text-[var(--ink-muted)] hover:text-[var(--accent-teal)] transition-colors">API Sandbox</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-all duration-200 shadow-sm"
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
            <h1 className="text-5xl lg:text-7xl font-display font-semibold mb-6 leading-tight tracking-tight text-[var(--ink)]">
              Turn Unstructured Paper into <br />
              <span className="text-[var(--accent-teal)] underline decoration-dotted decoration-[var(--border)]">
                Structured Record Data
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--ink-muted)] mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              DOnC-key is the document registry & intelligence engine for modern software. Stamp status onto documents, extract typed fields, and query structured records.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="btn-primary px-8 py-3.5 flex items-center gap-2"
              >
                Start Extracting Data
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="btn-secondary px-8 py-3.5"
              >
                The Intake Desk Spec
              </a>
            </div>
          </div>

          {/* Interactive Feature Showcase with Code Tab Switcher */}
          <div id="code" className="mt-12 relative max-w-4xl mx-auto">
            <div className="card p-6 md:p-8 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--accent-teal)] border border-[var(--accent-teal)] px-2.5 py-0.5 rounded-full">
                    DOC.API
                  </span>
                  <h3 className="text-2xl font-display font-semibold text-[var(--ink)]">API-Ready Document Intake</h3>
                  <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
                    Upload document files or dispatch payloads directly via REST endpoints. Gemini models analyze layouts, images, and tabular text to generate typed JSON schemas automatically.
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-muted)]">
                    <span className="px-2 py-0.5 bg-[var(--surface-sunken)] border border-[var(--border)] rounded text-[var(--accent-teal)] font-bold">POST</span>
                    <span>/api/v1/documents/extract</span>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  {/* Folder Tab Switcher */}
                  <div className="flex border-b border-[var(--border)] mb-0 space-x-1">
                    {['json', 'curl', 'js'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`folder-tab ${activeTab === tab ? 'active' : ''}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[var(--surface-sunken)] border border-t-0 border-[var(--border)] rounded-b-md font-mono text-xs text-[var(--ink)] overflow-x-auto">
                    <pre className="whitespace-pre">
                      {codeExamples[activeTab]}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-[var(--border)] bg-[var(--surface-sunken)] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-[var(--ink)] mb-4">
              Built for Archive Accuracy & Developer Speed
            </h2>
            <p className="text-[var(--ink-muted)] font-medium">
              Every document is treated as a record file with ink status stamps, dot-leader structured fields, and document-scoped API keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="card p-6">
              <span className="font-mono text-xs text-[var(--accent-teal)] font-semibold block mb-2">DOC.OCR</span>
              <h3 className="text-lg font-bold mb-2 text-[var(--ink)]">Multi-Format Vision OCR</h3>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
                Extract layout, text, tables, and handwritten signatures with multi-modal Gemini Vision processing.
              </p>
            </div>

            <div className="card p-6">
              <span className="font-mono text-xs text-[var(--accent-ochre)] font-semibold block mb-2">DOC.REASON</span>
              <h3 className="text-lg font-bold mb-2 text-[var(--ink)]">Custom JSON Schemas</h3>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
                Design custom extraction schemas. Forces deterministic typed responses directly into your system.
              </p>
            </div>

            <div className="card p-6">
              <span className="font-mono text-xs text-[var(--accent-teal)] font-semibold block mb-2">DOC.HOOK</span>
              <h3 className="text-lg font-bold mb-2 text-[var(--ink)]">Automated Webhooks</h3>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
                Receive instant webhook callbacks when files transition to READY or FAILED status stamps.
              </p>
            </div>

            <div className="card p-6">
              <span className="font-mono text-xs text-[var(--accent-graphite)] font-semibold block mb-2">DOC.API</span>
              <h3 className="text-lg font-bold mb-2 text-[var(--ink)]">Document-Scoped Keys</h3>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">
                Generate timing-safe, document-scoped API tokens for zero-trust integration across microservices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 text-center relative bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6 text-[var(--ink)]">Ready to Intake Your Documents?</h2>
          <p className="text-[var(--ink-muted)] mb-8 max-w-md mx-auto font-medium">
            Sign in to start converting physical and digital paper into structured data ledgers today.
          </p>
          <Link
            to="/login"
            className="btn-primary px-8 py-3.5 inline-flex items-center gap-2"
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
