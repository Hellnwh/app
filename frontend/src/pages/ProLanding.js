import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Info, Loader2, FileText, Upload, Sparkles,
  Copy, Check, Send, Download, Lock, ChevronRight, DollarSign
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const MAX_FREE_USES = 3;
const MAX_CHARACTERS = 10000;

const ProLanding = () => {
  const navigate = useNavigate();
  const [contractText, setContractText] = useState('');
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    const count = parseInt(localStorage.getItem('contract_usage_count') || '0');
    setUsageCount(count);
    if (count >= MAX_FREE_USES) setShowPaywall(true);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      toast.error('Only PDF files supported');
      return;
    }
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max 100 MB.`);
      return;
    }
    setUploadedFile(file);
    setInputMode('file');
    toast.success(`File uploaded: ${file.name}`);
  };

  const handleAnalyze = async () => {
    if (inputMode === 'text' && (!contractText.trim() || contractText.length < 100)) {
      toast.error('Contract text too short');
      return;
    }
    if (inputMode === 'file' && !uploadedFile) {
      toast.error('Please upload a PDF');
      return;
    }
    if (!consent) {
      toast.error('Accept disclaimer to continue');
      return;
    }
    if (usageCount >= MAX_FREE_USES) {
      setShowPaywall(true);
      toast.error('Free limit reached');
      return;
    }

    setAnalyzing(true);
    try {
      let response;
      if (inputMode === 'text') {
        response = await axios.post(`${API}/analyze`, { contract_text: contractText });
      } else {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await axios.post(`${API}/analyze-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setAnalysis(response.data);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('contract_usage_count', newCount.toString());
      if (newCount >= MAX_FREE_USES) setShowPaywall(true);
      toast.success('Analysis complete!');
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedStates({ ...copiedStates, [key]: false }), 2000);
  };

  const getRiskColor = (level) => {
    const colors = {
      HIGH: 'bg-red-50 border-red-300 text-red-800',
      MEDIUM: 'bg-amber-50 border-amber-300 text-amber-800',
      LOW: 'bg-emerald-50 border-emerald-300 text-emerald-800'
    };
    return colors[level] || colors.MEDIUM;
  };

  const getScoreColor = (score) => {
    if (score <= 40) return 'bg-emerald-500';
    if (score <= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getVerdictStyle = (verdict) => {
    const styles = {
      SAFE: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', icon: CheckCircle },
      RISKY: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: XCircle },
      NEEDS_REVIEW: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: AlertTriangle }
    };
    return styles[verdict] || styles.NEEDS_REVIEW;
  };

  const handlePayment = (plan) => {
    toast.info(`Payment integration: ${plan}. Demo mode - would redirect to Razorpay.`);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setContractText('');
    setUploadedFile(null);
    setInputMode('text');
    setConsent(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Disclaimer */}
      <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 py-3">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-900 font-medium">
            ⚠️ AI can make mistakes. This is NOT legal advice.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <h1 className="text-lg font-semibold text-slate-900">Contract Simplifier Pro</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span className="text-xs">Not stored. Deleted instantly.</span>
            </div>
            <button onClick={() => navigate('/terms')} className="text-slate-600 hover:text-slate-900">Terms</button>
            <button onClick={() => navigate('/privacy')} className="text-slate-600 hover:text-slate-900">Privacy</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        {!analysis && (
          <div className="text-center mb-12 fade-in">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center float-animation">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
              Know Exactly What You're Signing
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              AI-powered contract analysis with clause-level risk detection, suggested fixes, and negotiation guidance
            </p>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200 card-hover">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Risk Score</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200 card-hover">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Suggested Fixes</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200 card-hover">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Negotiation</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Counter */}
        {!showPaywall && !analysis && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 text-center">
            <p className="text-sm text-slate-700">
              Free analyses: <span className="font-semibold">{usageCount}/{MAX_FREE_USES}</span>
            </p>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && !analysis && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200 mb-6">
            <div className="text-center">
              <DollarSign className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Unlock More Analyses</h3>
              <p className="text-slate-600 mb-6">You've used all 3 free analyses</p>
              <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">₹10</p>
                  <p className="text-sm text-slate-600 mb-4">Per Analysis</p>
                  <Button onClick={() => handlePayment('single')} className="w-full bg-slate-900">Buy Now</Button>
                </div>
                <div className="bg-white p-6 rounded-lg border-2 border-indigo-500 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">BEST VALUE</div>
                  <p className="text-2xl font-bold text-indigo-600">₹49</p>
                  <p className="text-sm text-slate-600 mb-4">10 Analyses</p>
                  <Button onClick={() => handlePayment('pack')} className="w-full bg-indigo-600 hover:bg-indigo-700">Buy Pack</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        {!analysis && !showPaywall && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg mb-6 scale-in">
            <div className="flex space-x-2 mb-6">
              <Button
                variant={inputMode === 'text' ? 'default' : 'outline'}
                onClick={() => setInputMode('text')}
                className={`flex-1 ${inputMode === 'text' ? 'bg-indigo-600' : ''}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Paste Text
              </Button>
              <Button
                variant={inputMode === 'file' ? 'default' : 'outline'}
                onClick={() => setInputMode('file')}
                className={`flex-1 ${inputMode === 'file' ? 'bg-indigo-600' : ''}`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </div>

            {inputMode === 'text' && (
              <>
                <Textarea
                  placeholder="Paste contract text (up to 10,000 characters)..."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="min-h-[300px] border-slate-300 font-mono text-sm"
                />
                <p className={`text-xs mt-2 ${contractText.length > MAX_CHARACTERS ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                  Characters: {contractText.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
                </p>
              </>
            )}

            {inputMode === 'file' && (
              <>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-900 mb-2 font-medium">Upload PDF Contract</p>
                    <p className="text-sm text-slate-500 mb-4">Max 100 MB</p>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 h-10 px-4 py-2 cursor-pointer">
                      Select PDF
                    </label>
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-lg p-6 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); document.getElementById('file-upload').value = ''; }}>
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-3">
                <Checkbox id="consent" checked={consent} onCheckedChange={setConsent} />
                <label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer">
                  <strong>I understand this is not legal advice.</strong> AI analysis may contain errors.
                </label>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !consent || (inputMode === 'text' ? contractText.length < 100 : !uploadedFile)}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-base font-semibold shadow-lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Contract...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze Contract - Free
                </>
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div id="results" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-slate-900">Analysis Results</h3>
              <Button onClick={resetAnalysis} variant="outline">New Analysis</Button>
            </div>

            {/* Verdict & Risk Score */}
            <div className="bg-white p-6 rounded-xl border-2 ${getVerdictStyle(analysis.verdict).border} ${getVerdictStyle(analysis.verdict).bg}">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {React.createElement(getVerdictStyle(analysis.verdict).icon, { className: `h-8 w-8 ${getVerdictStyle(analysis.verdict).text}` })}
                  <div>
                    <h4 className="text-2xl font-semibold ${getVerdictStyle(analysis.verdict).text}">{analysis.verdict}</h4>
                    <p className="text-sm ${getVerdictStyle(analysis.verdict).text}">Overall Assessment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold ${getVerdictStyle(analysis.verdict).text}">{analysis.risk_score}</p>
                  <p className="text-sm ${getVerdictStyle(analysis.verdict).text}">Risk Score</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Risk Level</span>
                  <span className="font-medium">{analysis.risk_score}/100</span>
                </div>
                <Progress value={analysis.risk_score} className={`h-3 ${getScoreColor(analysis.risk_score)}`} />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-slate-600" />
                Summary
              </h4>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Actions Section */}
            {analysis.actions && analysis.actions.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                <h4 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                  <ChevronRight className="h-6 w-6 mr-2" />
                  What You Should Do
                </h4>
                <ul className="space-y-3">
                  {analysis.actions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-slate-800 font-medium">{action}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clause-Level Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Identified Risks ({analysis.risks.length})
                </h4>
                <div className="space-y-4">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className={`p-5 rounded-lg border-2 ${getRiskColor(risk.risk_level)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-sm uppercase">{risk.risk_level} RISK</h5>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50">{risk.risk_level}</span>
                      </div>
                      <div className="bg-white/50 p-3 rounded-md mb-3 border border-slate-200">
                        <p className="text-sm font-mono italic">"{risk.clause}"</p>
                      </div>
                      <p className="text-sm font-medium mb-2">Why this is risky:</p>
                      <p className="text-sm mb-3">{risk.reason}</p>
                      <div className="bg-white p-3 rounded-md border-l-4 border-emerald-500">
                        <p className="text-sm font-semibold text-emerald-800 mb-1">✓ Suggested Fix:</p>
                        <p className="text-sm text-slate-700">{risk.fix}</p>
                        <Button
                          onClick={() => handleCopy(risk.fix, `fix-${idx}`)}
                          size="sm"
                          variant="outline"
                          className="mt-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                          {copiedStates[`fix-${idx}`] ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          Copy Fix
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Negotiation Message */}
            {analysis.negotiation_message && (
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  Pre-Written Negotiation Message
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3 font-mono text-sm">
                  {analysis.negotiation_message}
                </div>
                <Button
                  onClick={() => handleCopy(analysis.negotiation_message, 'negotiation')}
                  variant="outline"
                  className="border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  {copiedStates.negotiation ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy Message
                </Button>
              </div>
            )}

            {/* Missing Clauses */}
            {analysis.missing_clauses && analysis.missing_clauses.length > 0 && (
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                <h4 className="text-lg font-semibold text-amber-900 mb-3">⚠️ Missing Important Clauses</h4>
                <ul className="space-y-2">
                  {analysis.missing_clauses.map((clause, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-amber-800">{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Worst Case */}
            {analysis.worst_case && (
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Worst Case Scenario
                </h4>
                <p className="text-red-800">{analysis.worst_case}</p>
              </div>
            )}

            {/* Other sections */}
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.obligations && analysis.obligations.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Your Obligations</h4>
                  <ul className="space-y-2">
                    {analysis.obligations.map((ob, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start space-x-2">
                        <span className="text-slate-400">•</span>
                        <span>{ob}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.rights && analysis.rights.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Your Rights</h4>
                  <ul className="space-y-2">
                    {analysis.rights.map((right, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start space-x-2">
                        <span className="text-slate-400">•</span>
                        <span>{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProLanding;
