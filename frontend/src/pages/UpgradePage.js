import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Crown, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';

const UpgradePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    toast.info('Razorpay integration requires API keys. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env file.');
    
    // For demo purposes, let's simulate upgrade
    toast.success('Demo: Subscription upgraded to Premium!');
    updateUser({ ...user, subscription_plan: 'premium' });
    navigate('/dashboard');
  };

  if (user?.subscription_plan === 'premium') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-md text-center">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">You're Premium!</h2>
          <p className="text-slate-600 mb-6">You already have an active premium subscription.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-slate-900 hover:bg-slate-800">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white p-8 border border-slate-200 rounded-md">
          <div className="text-center mb-8">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-amber-700" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">Upgrade to Premium</h1>
            <p className="text-slate-600">Unlock unlimited contract analysis and advanced features</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-md mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Premium Plan</h3>
                  <p className="text-slate-600">Everything you need for legal analysis</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-slate-900">₹499</div>
                  <div className="text-slate-600">/month</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Unlimited Document Uploads</p>
                    <p className="text-sm text-slate-600">No daily limits, analyze as many contracts as you need</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">AI Q&A Chat</p>
                    <p className="text-sm text-slate-600">Ask questions and get instant answers about your contracts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Save & Manage Contracts</p>
                    <p className="text-sm text-slate-600">Access your contract history anytime</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Full Risk Analysis</p>
                    <p className="text-sm text-slate-600">Comprehensive risk detection and explanations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">PDF Reports</p>
                    <p className="text-sm text-slate-600">Download professional analysis reports</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Priority Support</p>
                    <p className="text-sm text-slate-600">Get help when you need it</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> To enable Razorpay payments, please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your backend .env file.
              </p>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={loading}
              data-testid="proceed-payment-button"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;