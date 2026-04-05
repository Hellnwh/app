import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, FileText, MessageSquare, Download, CheckCircle, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 noise-bg">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-slate-900" />
            <span className="text-lg font-semibold text-slate-900">Contract Simplifier AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              data-testid="login-button"
              onClick={() => navigate('/auth')}
              className="text-slate-700 hover:text-slate-900"
            >
              Sign In
            </Button>
            <Button
              data-testid="get-started-button"
              onClick={() => navigate('/auth')}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">AI-Powered Legal Analysis</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight font-semibold text-slate-900 mb-6">
              Understand Legal Contracts in Minutes
            </h1>
            
            <p className="text-base leading-relaxed text-slate-600 mb-8">
              Upload any legal document and get instant, AI-powered analysis. Identify risks, extract key terms, and understand complex clauses in plain language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                data-testid="hero-get-started"
                onClick={() => navigate('/auth')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base"
              >
                Start Analyzing Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="border-slate-300 text-slate-900 hover:bg-slate-100 px-8 py-6 text-base"
              >
                See How It Works
              </Button>
            </div>
            
            <div className="mt-8 flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/1908d32d-b7af-4a6e-be04-cfc90d18439e/images/d6bf64aae63a3ca9ea5eaf31dc5a1e841dabd4548104099a2c5c34f8a162bbed.png"
              alt="Contract Analysis"
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-slate-900 mb-4">
              Everything You Need to Understand Contracts
            </h2>
            <p className="text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Powerful AI features designed for individuals, freelancers, and small businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-slate-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Smart Document Upload</h3>
              <p className="text-base leading-relaxed text-slate-600">
                Support for PDF, DOCX, and text files. Drag & drop or paste your contract text directly.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-red-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Risk Detection</h3>
              <p className="text-base leading-relaxed text-slate-600">
                Automatically identifies and highlights risky clauses with severity ratings and explanations.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-emerald-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Simple Explanations</h3>
              <p className="text-base leading-relaxed text-slate-600">
                Complex legal language translated into simple, easy-to-understand explanations.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-amber-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Q&A Chat <span className="premium-badge">PRO</span></h3>
              <p className="text-base leading-relaxed text-slate-600">
                Ask questions about your contract and get instant answers based on the document.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-slate-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">PDF Reports</h3>
              <p className="text-base leading-relaxed text-slate-600">
                Download professional PDF reports with summaries, risks, and key terms.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded-md hover:border-slate-300">
              <div className="bg-slate-50 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Save Contracts <span className="premium-badge">PRO</span></h3>
              <p className="text-base leading-relaxed text-slate-600">
                Keep a history of all analyzed contracts in your personal dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 border border-slate-200 rounded-md">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Free Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-slate-900">₹0</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <span className="text-slate-700">1 document per day</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <span className="text-slate-700">Risk analysis</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <span className="text-slate-700">PDF reports</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <span className="text-slate-700">Key terms extraction</span>
                </li>
              </ul>
              <Button
                data-testid="free-plan-button"
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full border-slate-300 text-slate-900 hover:bg-slate-100"
              >
                Get Started Free
              </Button>
            </div>

            <div className="bg-slate-900 p-8 border border-slate-900 rounded-md relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
                  POPULAR
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-white">₹499</span>
                <span className="text-slate-300">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-100">Unlimited documents</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-100">Full risk analysis</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-100">AI Q&A chat</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-100">Save & manage contracts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-100">Priority support</span>
                </li>
              </ul>
              <Button
                data-testid="premium-plan-button"
                onClick={() => navigate('/auth')}
                className="w-full bg-white text-slate-900 hover:bg-slate-100"
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to Simplify Your Contracts?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join thousands of users who trust Contract Simplifier AI for legal document analysis.
          </p>
          <Button
            size="lg"
            data-testid="cta-get-started"
            onClick={() => navigate('/auth')}
            className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-base"
          >
            Get Started for Free
          </Button>
          <p className="mt-4 text-sm text-slate-400">
            No credit card required • Start analyzing in seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-slate-600">
            <p className="mb-2">⚠️ <strong>Disclaimer:</strong> This tool provides AI-generated summaries and is NOT legal advice. AI can make mistakes.</p>
            <p>© 2026 Contract Simplifier AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;