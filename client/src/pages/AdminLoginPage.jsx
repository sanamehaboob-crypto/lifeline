import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiUser, FiLock, FiLogIn } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-5">
            <FiShield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Hospital Admin Panel</h1>
          <p className="text-sm text-gray-400">Sign in to manage your hospital's data</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 bg-emergency-500/10 border border-emergency-500/30 rounded-xl">
              <p className="text-sm text-emergency-400">{error}</p>
            </div>
          )}

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Username</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field pl-11"
                required
                id="admin-username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-11"
                required
                id="admin-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary w-full flex items-center justify-center gap-2"
            id="btn-admin-login"
          >
            {loading ? 'Signing in...' : <><FiLogIn className="w-5 h-5" /> Sign In</>}
          </button>

          <div className="mt-5 p-3 bg-white/5 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              Demo: <span className="text-primary-400">admin</span> / <span className="text-primary-400">admin123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
