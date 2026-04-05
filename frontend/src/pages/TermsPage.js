import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-slate-900" />
            <h1 className="text-lg font-semibold text-slate-900">Contract Simplifier AI</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-semibold text-slate-900 mb-8">Terms & Conditions</h1>
        
        <div className="bg-white p-8 rounded-md border border-slate-200 space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By using Contract Simplifier AI ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. NOT Legal Advice</h2>
            <p className="leading-relaxed mb-3">
              <strong>IMPORTANT: This tool does NOT provide legal advice.</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service provides AI-generated summaries and analysis for informational purposes only</li>
              <li>The Service does NOT replace professional legal counsel</li>
              <li>You should NOT rely solely on this tool for legal decisions</li>
              <li>Always consult a qualified lawyer for legal advice specific to your situation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. User Responsibility</h2>
            <p className="leading-relaxed mb-3">
              You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All decisions made based on information provided by the Service</li>
              <li>Verifying the accuracy of AI-generated analysis</li>
              <li>Seeking professional legal advice when needed</li>
              <li>Understanding that AI analysis may contain errors or omissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. AI Limitations</h2>
            <p className="leading-relaxed mb-3">
              The Service uses artificial intelligence which:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>May produce inaccurate or incomplete analysis</li>
              <li>May misinterpret legal language or context</li>
              <li>Cannot guarantee error-free results</li>
              <li>Should be used as a preliminary tool only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">5. No Warranties</h2>
            <p className="leading-relaxed">
              The Service is provided "AS IS" without warranties of any kind, either express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Results will be accurate, complete, or reliable</li>
              <li>Any errors will be corrected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, Contract Simplifier AI and its operators shall NOT be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Use or inability to use the Service</li>
              <li>Reliance on AI-generated analysis</li>
              <li>Errors, omissions, or inaccuracies in the analysis</li>
              <li>Decisions made based on the Service output</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">7. Usage Limits</h2>
            <p className="leading-relaxed">
              Free users are limited to 3 contract analyses. Usage is tracked via browser local storage. Premium subscriptions may offer unlimited usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">8. Modifications</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">9. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">10. Contact</h2>
            <p className="leading-relaxed">
              For questions about these Terms, please contact us through our website.
            </p>
          </section>

          <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-md mt-8">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              ⚠️ Critical Reminder
            </h3>
            <p className="text-amber-800">
              This tool provides AI-generated summaries and does NOT replace a lawyer. Always seek professional legal counsel for important contracts and legal decisions.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 mb-4">Last updated: January 2026</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            I Understand - Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;