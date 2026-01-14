import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-6 py-8 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              DocIntel
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
          </nav>
          <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Transform Documents into <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Actionable Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Our AI-powered document intelligence platform extracts, analyzes, and transforms complex documents into structured data with unprecedented accuracy and speed.
            </p>
            
            {/* Unique Get Started Button */}
            <div className="relative inline-block group">
              <Link 
                to="/login" 
                className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center">
                  <span className="mr-3">Begin Your Journey</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 hover:animate-pulse"></div>
              </Link>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
            </div>
          </div>

          {/* Hero Image/Visualization */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto border border-gray-100">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-time Document Processing</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Extract text from complex layouts</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Identify key entities and relationships</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Convert to structured JSON data</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-4 shadow-inner">
                      <div className="space-y-2">
                        <div className="h-3 bg-blue-300 rounded w-4/5"></div>
                        <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-3 bg-blue-300 rounded w-5/6"></div>
                        <div className="h-3 bg-blue-200 rounded w-2/3"></div>
                        <div className="h-3 bg-blue-300 rounded w-4/5"></div>
                        <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-3 bg-blue-300 rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center animate-pulse">
                      <ArrowRightIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Document Intelligence Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Smart Extraction",
                description: "AI-powered text and data extraction from complex documents with layout preservation.",
                icon: (
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                )
              },
              {
                title: "Real-time Processing",
                description: "Process documents instantly with our optimized pipeline architecture.",
                icon: (
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )
              },
              {
                title: "Structured Output",
                description: "Convert unstructured data into clean, structured JSON for easy integration.",
                icon: (
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Document Workflow?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who are already leveraging AI-powered document intelligence.
          </p>
          <div className="relative inline-block group">
            <Link 
              to="/login" 
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center">
                <span className="mr-3">Get Started Now</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 hover:animate-pulse"></div>
            </Link>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
