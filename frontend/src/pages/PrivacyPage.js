import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
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
        <h1 className="text-4xl font-semibold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white p-8 rounded-md border border-slate-200 space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed mb-3">
              When you use Contract Simplifier AI, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract Text:</strong> The text you paste for analysis</li>
              <li><strong>Usage Data:</strong> Number of analyses performed (stored in your browser)</li>
              <li><strong>Technical Data:</strong> Browser type, device information, IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">
              Your contract text is used ONLY to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generate AI-powered analysis</li>
              <li>Provide you with simplified contract summaries</li>
              <li>Improve our service quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. No Permanent Storage</h2>
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-md">
              <p className="leading-relaxed text-emerald-900">
                <strong>✓ Your contract text is NOT permanently stored.</strong>
              </p>
              <p className="leading-relaxed text-emerald-800 mt-2">
                Contract text is processed temporarily for analysis and then discarded. We do not save your contracts to our servers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. Data Processing</h2>
            <p className="leading-relaxed mb-3">
              Your contract text is:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sent to our AI provider (OpenAI) for analysis</li>
              <li>Processed according to OpenAI's privacy policy</li>
              <li>Not used to train AI models (per OpenAI API terms)</li>
              <li>Deleted after analysis is complete</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">5. No Sharing of Data</h2>
            <p className="leading-relaxed">
              We do NOT:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Sell your data to third parties</li>
              <li>Share your contract text with anyone except our AI provider</li>
              <li>Use your contracts for marketing purposes</li>
              <li>Store your contracts beyond the analysis session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">6. Browser Local Storage</h2>
            <p className="leading-relaxed">
              We use your browser's local storage to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Track your usage count (free limit: 3 analyses)</li>
              <li>This data stays on YOUR device only</li>
              <li>You can clear this by clearing your browser data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">7. Third-Party Services</h2>
            <p className="leading-relaxed mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>OpenAI:</strong> AI analysis processing (see OpenAI Privacy Policy)</li>
              <li><strong>Analytics:</strong> We may use analytics to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">8. Security</h2>
            <p className="leading-relaxed">
              We implement appropriate security measures to protect your data during transmission and processing. However, no internet transmission is 100% secure. Use the Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">9. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Know what data we collect</li>
              <li>Clear your browser data at any time</li>
              <li>Stop using the Service at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              The Service is not intended for users under 18 years of age. We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">11. Changes to Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">12. Contact Us</h2>
            <p className="leading-relaxed">
              For privacy-related questions, please contact us through our website.
            </p>
          </section>

          <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-md mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🔒 Your Privacy Matters
            </h3>
            <p className="text-blue-800">
              We are committed to protecting your privacy. Your contract text is processed temporarily and NOT permanently stored on our servers.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 mb-4">Last updated: January 2026</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;