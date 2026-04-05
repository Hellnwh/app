import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Loader2, FileText, Upload, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const MAX_FREE_USES = 3;
const MAX_CHARACTERS = 10000;

const SimpleLanding = () => {
  const navigate = useNavigate();
  const [contractText, setContractText] = useState('');
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'

  useEffect(() => {
    // Load usage count from localStorage
    const count = parseInt(localStorage.getItem('contract_usage_count') || '0');
    setUsageCount(count);
    if (count >= MAX_FREE_USES) {
      setShowPaywall(true);
    }
  }, []);

  const handleAnalyze = async () => {
    // Validate input
    if (inputMode === 'text') {
      if (!contractText.trim()) {
        toast.error('Please paste your contract text');
        return;
      }
      if (contractText.length < 100) {
        toast.error('Contract text is too short. Please provide at least 100 characters.');
        return;
      }
      if (contractText.length > MAX_CHARACTERS) {
        toast.warning(`Text exceeds ${MAX_CHARACTERS} characters. Only the first ${MAX_CHARACTERS} characters will be analyzed.`);
      }
    } else {
      if (!uploadedFile) {
        toast.error('Please upload a PDF file');
        return;
      }
    }

    if (!consent) {
      toast.error('You must accept the disclaimer to continue');
      return;
    }

    // Check usage limit
    if (usageCount >= MAX_FREE_USES) {
      setShowPaywall(true);
      toast.error('You\'ve reached your free limit');
      return;
    }

    setAnalyzing(true);
    try {
      let response;
      
      if (inputMode === 'text') {
        // Text analysis
        response = await axios.post(`${API}/analyze`, {
          contract_text: contractText
        });
      } else {
        // File upload analysis
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        response = await axios.post(`${API}/analyze-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setAnalysis(response.data);
      
      // Increment usage count
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('contract_usage_count', newCount.toString());
      
      if (newCount >= MAX_FREE_USES) {
        setShowPaywall(true);
      }

      toast.success('Analysis complete!');
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-50 border-red-300 text-red-800',
      medium: 'bg-amber-50 border-amber-300 text-amber-800',
      low: 'bg-emerald-50 border-emerald-300 text-emerald-800'
    };
    return colors[severity?.toLowerCase()] || colors.medium;
  };

  const getVerdictStyle = (status) => {
    const styles = {
      safe: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', icon: CheckCircle },
      risky: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: XCircle },
      needs_review: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: AlertTriangle }
    };
    return styles[status] || styles.needs_review;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      toast.error('Only PDF files are supported');
      return;
    }

    // Validate file size (100 MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is 100 MB. Your file is ${(file.size / (1024*1024)).toFixed(1)} MB.`);
      return;
    }

    setUploadedFile(file);
    setInputMode('file');
    toast.success(`File "${file.name}" uploaded successfully`);
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
      {/* Sticky Warning */}
      <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 py-3">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-900 font-medium">
            ⚠️ This tool provides AI-generated summaries and is NOT legal advice. AI can make mistakes.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-slate-900" />
            <h1 className="text-lg font-semibold text-slate-900">Contract Simplifier AI</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => navigate('/terms')}
              className="text-slate-600 hover:text-slate-900"
              data-testid="terms-link"
            >
              Terms
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="text-slate-600 hover:text-slate-900"
              data-testid="privacy-link"
            >
              Privacy
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        {!analysis && (
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
              Don't Sign Blindly.<br />Know the Risks First.
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Paste your contract and get a clear, simple explanation in seconds.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Simple. Clear. Safe.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Understand in seconds</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Avoid hidden traps</span>
              </div>
            </div>
          </div>
        )}

        {/* Usage Counter */}
        {!showPaywall && (
          <div className="bg-white p-4 rounded-md border border-slate-200 mb-6 text-center">
            <p className="text-sm text-slate-700">
              Free analyses used: <span className="font-semibold">{usageCount}/{MAX_FREE_USES}</span>
            </p>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div className="bg-amber-50 p-8 rounded-md border-2 border-amber-300 mb-6 text-center" data-testid="paywall">
            <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-amber-900 mb-2">
              You've Reached Your Free Limit
            </h3>
            <p className="text-amber-800 mb-6">
              Upgrade to continue analyzing contracts and access premium features.
            </p>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3"
              onClick={() => toast.info('Payment integration coming soon! Contact us for early access.')}
              data-testid="upgrade-button"
            >
              Upgrade Now - ₹499/month
            </Button>
          </div>
        )}

        {/* Input Section */}
        {!analysis && !showPaywall && (
          <div className="bg-white p-6 rounded-md border border-slate-200 mb-6" data-testid="input-section">
            {/* Mode Toggle */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={inputMode === 'text' ? 'default' : 'outline'}
                onClick={() => setInputMode('text')}
                className={inputMode === 'text' ? 'bg-slate-900' : 'border-slate-300'}
                data-testid="text-mode-button"
              >
                <FileText className="h-4 w-4 mr-2" />
                Paste Text
              </Button>
              <Button
                variant={inputMode === 'file' ? 'default' : 'outline'}
                onClick={() => setInputMode('file')}
                className={inputMode === 'file' ? 'bg-slate-900' : 'border-slate-300'}
                data-testid="file-mode-button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </div>

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paste Your Contract Here
                </label>
                <Textarea
                  placeholder="Paste the complete contract text here (up to 10,000 characters)...\n\nExample: This agreement is made on...\n\nMinimum 100 characters required."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="min-h-[300px] border-slate-300 font-mono text-sm"
                  data-testid="contract-input"
                />
                <p className={`text-xs mt-2 ${contractText.length > MAX_CHARACTERS ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                  Characters: {contractText.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} 
                  {contractText.length < 100 && ' (minimum 100 required)'}
                  {contractText.length > MAX_CHARACTERS && ` (⚠️ Exceeds limit - only first ${MAX_CHARACTERS.toLocaleString()} will be analyzed)`}
                </p>
              </>
            )}

            {/* File Upload Mode */}
            {inputMode === 'file' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload PDF Contract
                </label>
                
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-md p-12 text-center hover:border-slate-400 transition-colors">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-900 mb-2 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      PDF files only (Max size: 100 MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      data-testid="file-input"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        as="span"
                        variant="outline"
                        className="border-slate-300 cursor-pointer"
                      >
                        Select PDF File
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-md p-6 bg-slate-50" data-testid="uploaded-file-info">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-3 rounded-md">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          document.getElementById('file-upload').value = '';
                        }}
                        className="text-slate-600 hover:text-slate-900"
                        data-testid="remove-file-button"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  📄 The AI will extract and analyze text from your PDF contract
                </p>
              </>
            )}

            {/* Consent Checkbox */}
            <div className="mt-6 p-4 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={setConsent}
                  data-testid="consent-checkbox"
                />
                <label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer">
                  <strong>I understand this is not legal advice.</strong> This tool uses AI to provide a simplified summary. It may contain errors and should not replace professional legal counsel.
                </label>
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !consent || (inputMode === 'text' ? contractText.length < 100 : !uploadedFile)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-6 text-base"
              data-testid="analyze-button"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing {inputMode === 'file' ? 'PDF' : 'Contract'}...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze Contract Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div id="results" className="space-y-6" data-testid="results-section">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-slate-900">Analysis Results</h3>
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="border-slate-300"
                data-testid="new-analysis-button"
              >
                New Analysis
              </Button>
            </div>

            {/* Final Verdict */}
            {analysis.final_verdict && (
              <div className={`p-6 rounded-md border-2 ${getVerdictStyle(analysis.final_verdict.status).bg} ${getVerdictStyle(analysis.final_verdict.status).border}`} data-testid="final-verdict">
                <div className="flex items-center space-x-3 mb-3">
                  {React.createElement(getVerdictStyle(analysis.final_verdict.status).icon, {
                    className: `h-8 w-8 ${getVerdictStyle(analysis.final_verdict.status).text}`
                  })}
                  <h3 className={`text-2xl font-semibold uppercase ${getVerdictStyle(analysis.final_verdict.status).text}`}>
                    {analysis.final_verdict.status.replace('_', ' ')}
                  </h3>
                </div>
                <p className={`text-base ${getVerdictStyle(analysis.final_verdict.status).text}`}>
                  {analysis.final_verdict.reason}
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-white p-6 rounded-md border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-slate-600" />
                Simple Summary
              </h4>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Key Points */}
            {analysis.key_points && analysis.key_points.length > 0 && (
              <div className="bg-white p-6 rounded-md border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Key Points</h4>
                <ul className="space-y-2">
                  {analysis.key_points.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <div className="bg-white p-6 rounded-md border border-slate-200" data-testid="risks-section">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Identified Risks
                </h4>
                <div className="space-y-3">
                  {analysis.risks.map((risk, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border ${getSeverityColor(risk.severity)}`}
                      data-testid={`risk-${risk.severity}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">{risk.risk}</h5>
                        <span className="text-xs uppercase font-bold px-2 py-1 rounded">
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-sm">{risk.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worst Case Scenario */}
            {analysis.worst_case_scenario && (
              <div className="bg-red-50 p-6 rounded-md border-2 border-red-200" data-testid="worst-case">
                <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Worst Case Scenario
                </h4>
                <p className="text-red-800">{analysis.worst_case_scenario}</p>
              </div>
            )}

            {/* Obligations */}
            {analysis.obligations && analysis.obligations.length > 0 && (
              <div className="bg-white p-6 rounded-md border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Your Obligations</h4>
                <ul className="space-y-2">
                  {analysis.obligations.map((obligation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-slate-400 mt-1">•</span>
                      <span className="text-slate-700">{obligation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Terms */}
            {analysis.important_terms && (
              <div className="bg-white p-6 rounded-md border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Important Terms</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.important_terms).map(([key, value]) => (
                    value && (
                      <div key={key} className="border-l-2 border-slate-300 pl-4">
                        <dt className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
                          {key}
                        </dt>
                        <dd className="text-slate-900">{value}</dd>
                      </div>
                    )
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-600 mb-2">
            <strong>Important:</strong> This tool is for informational purposes only and does not constitute legal advice.
          </p>
          <p className="text-xs text-slate-500">
            © 2026 Contract Simplifier AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLanding;