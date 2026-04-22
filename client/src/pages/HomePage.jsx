import { Link } from 'react-router-dom';
import { FiSearch, FiActivity, FiAlertTriangle, FiHeart, FiShield, FiZap, FiMapPin } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-dark-900 to-dark-900" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-emergency-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Heartbeat Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emergency-500/10 border border-emergency-500/20 mb-8 animate-float">
            <FiHeart className="w-10 h-10 text-emergency-500 animate-heartbeat" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">Real-Time </span>
            <span className="gradient-text">Healthcare</span>
            <br />
            <span className="text-white">Assistance </span>
            <span className="gradient-text-emergency">When It Matters</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Find the nearest hospital, analyze your symptoms with AI, and get personalized recommendations — all in real-time.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Find Hospitals */}
            <Link to="/hospitals" className="group" id="btn-find-hospitals">
              <div className="glass-card-hover p-8 h-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FiSearch className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Find Hospitals</h3>
                <p className="text-sm text-gray-400">Discover nearby hospitals with real-time bed and ICU availability</p>
                <div className="mt-5 inline-flex items-center gap-1 text-primary-400 text-sm font-medium">
                  <FiMapPin className="w-4 h-4" /> Near you
                </div>
              </div>
            </Link>

            {/* Symptom Analyzer */}
            <Link to="/symptoms" className="group" id="btn-symptom-analyzer">
              <div className="glass-card-hover p-8 h-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-trust-500/10 border border-trust-500/20 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FiActivity className="w-8 h-8 text-trust-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Symptom Analyzer</h3>
                <p className="text-sm text-gray-400">AI-powered symptom analysis with urgency assessment</p>
                <div className="mt-5 inline-flex items-center gap-1 text-trust-400 text-sm font-medium">
                  <FiZap className="w-4 h-4" /> AI Powered
                </div>
              </div>
            </Link>

            {/* Emergency */}
            <Link to="/hospitals?urgency=Emergency" className="group" id="btn-emergency">
              <div className="glass-card p-8 h-full text-center border-emergency-500/30 bg-emergency-500/5 hover:bg-emergency-500/10 hover:border-emergency-500/50 transition-all duration-300 animate-pulse-glow rounded-2xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emergency-500/20 border border-emergency-500/30 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FiAlertTriangle className="w-8 h-8 text-emergency-400" />
                </div>
                <h3 className="text-lg font-bold text-emergency-400 mb-2">Emergency</h3>
                <p className="text-sm text-gray-400">Quick access to emergency hospitals near you</p>
                <div className="mt-5 inline-flex items-center gap-1 text-emergency-400 text-sm font-bold uppercase tracking-wide">
                  Quick Action
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            <span className="text-white">Why </span>
            <span className="gradient-text">LifeLine?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FiMapPin, title: 'Live Tracking', desc: 'Real-time hospital data updated by administrators', color: 'primary' },
              { icon: FiActivity, title: 'AI Analysis', desc: 'OpenAI-powered symptom assessment with urgency detection', color: 'trust' },
              { icon: FiZap, title: 'Smart Recommendations', desc: 'Intelligent scoring algorithm finds your best match', color: 'yellow' },
              { icon: FiShield, title: 'Secure & Private', desc: 'No patient data stored. HIPAA-conscious design', color: 'emerald' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 text-center hover:bg-white/5 transition-all duration-300">
                <Icon className={`w-8 h-8 text-${color}-400 mx-auto mb-3`} />
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-sm text-gray-500">
          © 2026 LifeLine — Real-Time Healthcare Assistance Platform
        </p>
        <p className="text-xs text-gray-600 mt-2">
          ⚠️ This platform provides informational assistance only. Always call emergency services for life-threatening situations.
        </p>
      </footer>
    </div>
  );
}
