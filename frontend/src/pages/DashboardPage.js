import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { uploadDocument, analyzeDocument, chatWithDocument, downloadReport, getSubscription } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { 
  Shield, Upload, FileText, Loader2, MessageSquare, 
  Download, AlertTriangle, CheckCircle, Crown, LogOut,
  Send, Sparkles, Info
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [language, setLanguage] = useState('english');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await getSubscription();
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Auto-generate title from filename
      const fileName = selectedFile.name.replace(/\.(pdf|docx|txt)$/, '');
      setTitle(fileName);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error('Please select a file and provide a title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const response = await uploadDocument(formData);
      setCurrentDocument(response.data);
      toast.success('Document uploaded successfully!');
      
      // Auto-analyze
      await handleAnalyze(response.data.id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (documentId) => {
    setAnalyzing(true);
    try {
      const response = await analyzeDocument({
        document_id: documentId || currentDocument?.id,
        language: language
      });
      setAnalysis(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    if (user?.subscription_plan !== 'premium') {
      toast.error('Chat feature is only available for premium users');
      return;
    }

    setChatLoading(true);
    const userMessage = chatInput;
    setChatInput('');
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await chatWithDocument({
        document_id: currentDocument.id,
        question: userMessage,
        language: language
      });
      
      // Add AI response
      setChatMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Chat failed');
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await downloadReport(currentDocument.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Download failed');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const getRiskColor = (severity) => {
    const colors = {
      high: 'bg-red-50 text-red-700 border-red-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[severity?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Disclaimer */}
      <div className="sticky-disclaimer" data-testid="disclaimer-banner">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-900 font-medium">
            ⚠️ AI can make mistakes. This is NOT legal advice.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-slate-900" />
            <span className="text-lg font-semibold text-slate-900">Contract Simplifier AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {subscription && (
              <div className="text-sm text-slate-600">
                {user?.subscription_plan === 'premium' ? (
                  <span className="premium-badge flex items-center space-x-1">
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </span>
                ) : (
                  <span>
                    Free: {subscription.documents_analyzed_today}/1 today
                  </span>
                )}
              </div>
            )}
            
            <span className="text-sm text-slate-700">{user?.name}</span>
            
            <Button
              variant="outline"
              size="sm"
              data-testid="logout-button"
              onClick={handleLogout}
              className="border-slate-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upload Section */}
            {!currentDocument && (
              <div className="bg-white p-6 border border-slate-200 rounded-md" data-testid="upload-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4">Upload Contract</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700">Document Title</Label>
                    <Input
                      id="title"
                      data-testid="document-title-input"
                      placeholder="e.g., Rent Agreement, Employment Contract"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Document File</Label>
                    <div
                      {...getRootProps()}
                      className={`upload-dropzone p-12 text-center cursor-pointer ${isDragActive ? 'active' : ''}`}
                      data-testid="file-upload-dropzone"
                    >
                      <input {...getInputProps()} data-testid="file-input" />
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      {file ? (
                        <div>
                          <p className="text-slate-900 font-medium">{file.name}</p>
                          <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-900 mb-1">Drop your contract here or click to browse</p>
                          <p className="text-sm text-slate-500">Supports PDF, DOCX, TXT (max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-slate-700">Language:</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={language === 'english' ? 'default' : 'outline'}
                        size="sm"
                        data-testid="language-english"
                        onClick={() => setLanguage('english')}
                        className={language === 'english' ? 'bg-slate-900' : ''}
                      >
                        English
                      </Button>
                      <Button
                        variant={language === 'hinglish' ? 'default' : 'outline'}
                        size="sm"
                        data-testid="language-hinglish"
                        onClick={() => setLanguage('hinglish')}
                        className={language === 'hinglish' ? 'bg-slate-900' : ''}
                      >
                        Hinglish
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || !title || uploading}
                    data-testid="upload-analyze-button"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {uploading || analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploading ? 'Uploading...' : 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upload & Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && currentDocument && (
              <div className="space-y-6" data-testid="analysis-results">
                {/* Summary */}
                <div className="bg-white p-6 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-slate-900">
                      {currentDocument.title}
                    </h2>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleDownloadReport}
                        variant="outline"
                        size="sm"
                        data-testid="download-report-button"
                        className="border-slate-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        onClick={() => {
                          setCurrentDocument(null);
                          setAnalysis(null);
                          setFile(null);
                          setTitle('');
                          setChatMessages([]);
                        }}
                        variant="outline"
                        size="sm"
                        data-testid="new-analysis-button"
                        className="border-slate-300"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-md mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Executive Summary
                    </h3>
                    <p className="text-slate-700">{analysis.summary}</p>
                    {analysis.confidence_level && (
                      <p className="text-sm text-slate-500 mt-2">
                        Confidence: <span className="font-medium capitalize">{analysis.confidence_level}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Points */}
                {analysis.key_points && analysis.key_points.length > 0 && (
                  <div className="bg-white p-6 border border-slate-200 rounded-md">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Key Points</h3>
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
                  <div className="bg-white p-6 border border-slate-200 rounded-md" data-testid="risks-section">
                    <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                      Risk Assessment
                    </h3>
                    <div className="space-y-3">
                      {analysis.risks.map((risk, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-md border ${getRiskColor(risk.severity)}`}
                          data-testid={`risk-item-${risk.severity?.toLowerCase()}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{risk.risk}</h4>
                            <span className="text-xs uppercase font-semibold px-2 py-1 rounded">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-sm">{risk.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Obligations & Rights */}
                <div className="grid md:grid-cols-2 gap-6">
                  {analysis.obligations && analysis.obligations.length > 0 && (
                    <div className="bg-white p-6 border border-slate-200 rounded-md">
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Your Obligations</h3>
                      <ul className="space-y-2">
                        {analysis.obligations.map((obligation, index) => (
                          <li key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                            <span className="text-slate-400 mt-1">•</span>
                            <span>{obligation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.rights && analysis.rights.length > 0 && (
                    <div className="bg-white p-6 border border-slate-200 rounded-md">
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Your Rights</h3>
                      <ul className="space-y-2">
                        {analysis.rights.map((right, index) => (
                          <li key={index} className="text-sm text-slate-700 flex items-start space-x-2">
                            <span className="text-slate-400 mt-1">•</span>
                            <span>{right}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Key Terms */}
                {analysis.key_terms && Object.keys(analysis.key_terms).length > 0 && (
                  <div className="bg-white p-6 border border-slate-200 rounded-md">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Key Terms</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysis.key_terms).map(([key, value]) => {
                        if (!value) return null;
                        
                        // Handle nested objects
                        const displayValue = typeof value === 'object' 
                          ? JSON.stringify(value, null, 2)
                          : value;
                        
                        return (
                          <div key={key} className="border-l-2 border-slate-300 pl-4">
                            <dt className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
                              {key}
                            </dt>
                            <dd className="text-slate-900 whitespace-pre-wrap">{displayValue}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Chat & Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upgrade Card */}
            {user?.subscription_plan !== 'premium' && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 border border-amber-200 rounded-md" data-testid="upgrade-card">
                <div className="flex items-center space-x-2 mb-3">
                  <Crown className="h-5 w-5 text-amber-700" />
                  <h3 className="text-lg font-semibold text-amber-900">Upgrade to Premium</h3>
                </div>
                <ul className="space-y-2 mb-4 text-sm text-amber-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Unlimited uploads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>AI Q&A chat</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Save contracts</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  data-testid="upgrade-premium-button"
                  onClick={() => navigate('/upgrade')}
                >
                  Upgrade for ₹499/month
                </Button>
              </div>
            )}

            {/* Chat Interface */}
            {currentDocument && (
              <div className="bg-white border border-slate-200 rounded-md flex flex-col h-[500px]" data-testid="chat-interface">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Q&A Chat
                    {user?.subscription_plan !== 'premium' && (
                      <span className="ml-2 premium-badge">PRO</span>
                    )}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">Ask questions about your contract</p>
                      {user?.subscription_plan !== 'premium' && (
                        <p className="text-xs mt-2 text-amber-600">Premium feature</p>
                      )}
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          msg.role === 'user' ? 'chat-message-user ml-8' : 'chat-message-ai mr-8'
                        }`}
                        data-testid={`chat-message-${msg.role}`}
                      >
                        <p className="text-sm text-slate-700">{msg.content}</p>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="chat-message-ai mr-8 p-3 rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask a question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                      disabled={user?.subscription_plan !== 'premium'}
                      data-testid="chat-input"
                      className="border-slate-300"
                    />
                    <Button
                      onClick={handleChat}
                      disabled={!chatInput.trim() || chatLoading || user?.subscription_plan !== 'premium'}
                      data-testid="chat-send-button"
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
