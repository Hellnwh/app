import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login, register } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Shield, Lock, Mail, User } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await register(formData);
      }

      loginUser(response.data.user, response.data.token);
      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-semibold text-white">Contract Simplifier AI</h1>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold text-white leading-tight">
            Understand Legal Documents in Minutes, Not Hours
          </h2>
          <p className="text-slate-300 text-lg">
            AI-powered contract analysis that highlights risks, extracts key terms, and answers your questions in simple language.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-md">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Risk Detection</p>
                <p className="text-slate-400 text-sm">Automatically identifies risky clauses</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-md">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Simple Explanations</p>
                <p className="text-slate-400 text-sm">Complex legal terms explained clearly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-md">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Q&A Chat</p>
                <p className="text-slate-400 text-sm">Ask questions about your contract</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-slate-400 text-sm">
          ⚠️ This tool provides AI-generated summaries and is NOT legal advice.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-slate-900" />
              <h1 className="text-xl font-semibold text-slate-900">Contract Simplifier AI</h1>
            </div>
          </div>

          <div className="bg-white p-8 rounded-md border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-600">
                {isLogin ? 'Sign in to your account' : 'Start analyzing contracts for free'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div data-testid="register-name-field">
                  <Label htmlFor="name" className="text-slate-700 text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      data-testid="name-input"
                      placeholder="John Doe"
                      className="pl-10 border-slate-300"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div data-testid="email-field">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                  Email
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    data-testid="email-input"
                    placeholder="you@example.com"
                    className="pl-10 border-slate-300"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div data-testid="password-field">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    data-testid="password-input"
                    placeholder="••••••••"
                    className="pl-10 border-slate-300"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                data-testid="auth-submit-button"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                data-testid="toggle-auth-mode"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="font-medium text-slate-900">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            Free: 1 document/day • Premium: Unlimited + Chat
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;