import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../services/api';
import { getUrgencyBadge } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiActivity, FiAlertTriangle, FiArrowRight, FiZap } from 'react-icons/fi';

const quickSymptoms = [
  'Chest pain', 'Difficulty breathing', 'High fever', 'Severe headache',
  'Abdominal pain', 'Nausea', 'Dizziness', 'Back pain', 'Cough',
  'Sore throat', 'Joint pain', 'Fatigue', 'Skin rash', 'Anxiety',
];

export default function SymptomAnalyzerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeSymptoms(symptoms);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addQuickSymptom = (symptom) => {
    const current = symptoms.trim();
    if (current.toLowerCase().includes(symptom.toLowerCase())) return;
    setSymptoms(current ? `${current}, ${symptom.toLowerCase()}` : symptom.toLowerCase());
  };

  const handleFindHospitals = () => {
    if (result) {
      navigate(`/recommendations?urgency=${result.urgency}`);
    }
  };

  const urgencyConfig = {
    Emergency: { color: 'text-emergency-400', bg: 'bg-emergency-500/10', border: 'border-emergency-500/30', icon: '🚨' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '⚠️' },
    Low: { color: 'text-trust-400', bg: 'bg-trust-500/10', border: 'border-trust-500/30', icon: '✅' },
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-trust-500/10 border border-trust-500/20 mb-5">
            <FiActivity className="w-8 h-8 text-trust-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            AI Symptom <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Describe your symptoms and our AI will assess the urgency level and suggest the appropriate type of care.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <FiZap className="w-4 h-4 text-trust-400" />
            <span className="text-xs text-trust-400 font-medium">Powered by OpenAI GPT</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass-card p-6 mb-6">
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Describe your symptoms
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., I have a severe headache, feeling dizzy, and nauseous since morning..."
            className="input-field min-h-[120px] resize-none mb-4"
            id="symptom-input"
            maxLength={1000}
          />

          {/* Quick Symptom Tags */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {quickSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => addQuickSymptom(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-300
                             border border-white/10 hover:bg-primary-500/10 hover:text-primary-400
                             hover:border-primary-500/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className="btn-trust w-full flex items-center justify-center gap-2"
            id="btn-analyze"
          >
            {loading ? (
              <>Analyzing...</>
            ) : (
              <>
                <FiActivity className="w-5 h-5" />
                Analyze Symptoms
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner text="AI is analyzing your symptoms..." />}

        {/* Error */}
        {error && (
          <div className="glass-card p-6 border-emergency-500/30 bg-emergency-500/5 text-center mb-6 animate-slide-up">
            <p className="text-emergency-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="animate-slide-up space-y-5">
            {/* Urgency Banner */}
            <div className={`glass-card p-6 ${urgencyConfig[result.urgency]?.border} ${urgencyConfig[result.urgency]?.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{urgencyConfig[result.urgency]?.icon}</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Urgency Level</p>
                  <p className={`text-2xl font-black ${urgencyConfig[result.urgency]?.color}`}>
                    {result.urgency}
                  </p>
                </div>
                <span className={`ml-auto ${getUrgencyBadge(result.urgency)}`}>
                  {result.urgency}
                </span>
              </div>
            </div>

            {/* Condition & Care Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Possible Condition</p>
                <p className="text-lg font-bold text-white">{result.condition}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Suggested Care</p>
                <p className="text-lg font-bold text-primary-400">{result.careType}</p>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Assessment Details</p>
              <p className="text-sm text-gray-300 leading-relaxed">{result.description}</p>
            </div>

            {/* Method badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                Analysis by: <span className="text-primary-400 font-medium">{result.method === 'openai' ? 'OpenAI GPT' : 'Rule-based Engine'}</span>
              </span>
            </div>

            {/* Disclaimer */}
            <div className="glass-card p-4 border-yellow-500/20">
              <p className="text-xs text-yellow-400/80 leading-relaxed">
                ⚠️ {result.disclaimer}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleFindHospitals}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all
                ${result.urgency === 'Emergency' ? 'btn-emergency' : 'btn-primary'}`}
              id="btn-find-recommended"
            >
              Find Recommended Hospitals
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
