import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { analyzePollutionImage, type AIAnalysisResult } from '../services/gemini';
import { db, storage, isFirebaseMock } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import ImagePicker from '../components/ImagePicker';
import MapPicker from '../components/MapPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Brain, Send, Loader2, CheckCircle, 
  ChevronRight, ChevronLeft, ShieldAlert, Sparkles 
} from 'lucide-react';

const ReportPollution: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { detectLocation, loading: detectingGPS } = useGeolocation();

  // Wizard State
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  
  // Geolocation specific state
  const [manualLat, setManualLat] = useState<number>(37.7749);
  const [manualLng, setManualLng] = useState<number>(-122.4194);
  const [customAddress, setCustomAddress] = useState('');

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Trigger GPS detection
  const handleGPSDetect = async () => {
    const loc = await detectLocation();
    if (loc) {
      setManualLat(loc.latitude);
      setManualLng(loc.longitude);
      setCustomAddress(loc.address);
    }
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setManualLat(lat);
    setManualLng(lng);
    // User dragged pin; optionally clear address or leave as is
    if (!customAddress) {
      setCustomAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  // Run Gemini Multimodal Analysis
  const handleAIAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const result = await analyzePollutionImage(image);
      setAiAnalysis(result);
      setStep(3); // Advance to AI Preview
    } catch (err: any) {
      console.error(err);
      setSubmitError('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user || !image || !aiAnalysis) return;
    
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isFirebaseMock) {
        // Read file as base64 data URL for local storage persistence
        const reader = new FileReader();
        const imageUrlPromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
        const imageUrl = await imageUrlPromise;

        const reportData = {
          id: `report-mock-${Date.now()}`,
          reporterId: user.uid,
          reporterName: user.displayName || 'Demo Lead Admin',
          imageUrl,
          imagePath: '',
          location: {
            latitude: manualLat,
            longitude: manualLng,
          },
          address: customAddress || `${manualLat.toFixed(5)}, ${manualLng.toFixed(5)}`,
          description: description.trim(),
          aiAnalysis,
          status: 'pending',
          adminNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const localData = localStorage.getItem('mock_reports');
        const list = localData ? JSON.parse(localData) : [];
        list.unshift(reportData);
        localStorage.setItem('mock_reports', JSON.stringify(list));
        
        setStep(4);
        return;
      }

      // 1. Upload Image to Firebase Storage
      const fileExtension = image.name.split('.').pop() || 'png';
      const imagePath = `reports/${user.uid}/${Date.now()}_report.${fileExtension}`;
      const storageRef = ref(storage, imagePath);
      
      const uploadResult = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // 2. Write Report Document to Firestore
      const reportData = {
        reporterId: user.uid,
        reporterName: user.displayName || 'Citizen Guardian',
        imageUrl,
        imagePath,
        location: {
          latitude: manualLat,
          longitude: manualLng,
        },
        address: customAddress || `${manualLat.toFixed(5)}, ${manualLng.toFixed(5)}`,
        description: description.trim(),
        aiAnalysis,
        status: 'pending',
        adminNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reports'), reportData);
      
      // Navigate to success step or history
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit report. Please check rules.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans">
      
      {/* Step Indicator Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white">Report Pollution</h1>
          <p className="text-slate-400 text-sm mt-1">Help clear our community streets & skies.</p>
        </div>
        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-3.5 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800/40">
          Step {Math.min(step, 3)} of 3
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-dark-800 h-1.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Upload Image */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-500" />
                <span>Upload Pollution Image</span>
              </h3>
              <p className="text-slate-400 text-sm mb-6">Take a photo of the waste, dumping, or water contamination.</p>
              
              <ImagePicker
                selectedImage={image}
                onImageSelected={(file) => {
                  setImage(file);
                }}
                onClear={() => {
                  setImage(null);
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!image}
                className="btn-primary py-3 px-6 disabled:opacity-50"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Location Selector */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft space-y-6">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>Geotag Report Location</span>
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={detectingGPS}
                  className="btn-primary py-2.5 px-4 font-semibold text-sm justify-center grow sm:grow-0"
                >
                  {detectingGPS ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>Detect My Location</span>
                </button>
                <div className="text-xs text-slate-400 self-center">
                  Or drag the map pin manually below.
                </div>
              </div>

              <MapPicker
                latitude={manualLat}
                longitude={manualLng}
                onLocationChange={handleCoordinatesChange}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Street name, neighborhood, city..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline py-3 px-5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={analyzing || !customAddress}
                className="btn-primary py-3 px-6 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Gemini Analysis Preview */}
        {step === 3 && aiAnalysis && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* AI Callout Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-400/20 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-blue-500 text-white rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-slate-800 dark:text-white text-sm">Gemini AI Audit Complete</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Confidence Score: {(aiAnalysis.confidenceScore * 100).toFixed(0)}%</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                aiAnalysis.severity === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                aiAnalysis.severity === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
              }`}>
                {aiAnalysis.severity} Severity
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Image & Description Summary */}
              <div className="space-y-6">
                {image && (
                  <div className="rounded-2xl border border-slate-200 dark:border-dark-800 overflow-hidden shadow-soft">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Report preview"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Additional Citizen Observations
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Provide details: how long has it been here? Any smells, hazards, or immediate safety context?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* AI Details Details */}
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft space-y-6">
                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Detected Category</h4>
                  <p className="font-display font-semibold text-xl text-slate-800 dark:text-white">{aiAnalysis.category}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Environmental Impact</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{aiAnalysis.environmentalImpact}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Community Health Risk</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{aiAnalysis.healthRisk}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1.5">Citizen Safety Tips</h4>
                  <ul className="space-y-1.5">
                    {aiAnalysis.citizenTips.map((tip, idx) => (
                      <li key={idx} className="text-slate-500 dark:text-slate-400 text-xs flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Formal Complaint Draft Preview */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft">
              <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">Generated Municipal Complaint Draft</h4>
              <pre className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-150 dark:border-dark-800">
                {aiAnalysis.professionalComplaint}
              </pre>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline py-3 px-5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="btn-primary py-3 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Uploading Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-8 rounded-2xl shadow-soft text-center space-y-6 max-w-lg mx-auto"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                <CheckCircle className="w-16 h-16" />
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white">Report Submitted Successfully!</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Thank you for acting as a CleanAir Guardian. City administrators and community coordinators have been notified.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-dark-950 rounded-xl text-left border border-slate-100 dark:border-dark-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">What happens next?</h4>
              <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-decimal list-inside">
                <li>City administrators verify the report content against spam/fakes.</li>
                <li>The report becomes visible on the community interactive heatmap.</li>
                <li>Municipality sanitation dispatch is coordinated to resolve the hotspot.</li>
              </ol>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setImage(null);
                  setAiAnalysis(null);
                  setDescription('');
                  setStep(1);
                }}
                className="btn-outline py-2.5 px-4"
              >
                Submit Another Report
              </button>
              <button
                onClick={() => navigate('/history')}
                className="btn-primary py-2.5 px-5"
              >
                View Report History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportPollution;
