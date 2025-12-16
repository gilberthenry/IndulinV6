import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const data = await authService.resetPassword({ token, password });
      setSuccessMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-blue-200 text-sm mt-1">Enter your new password</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl flex items-center text-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-xl flex items-center text-sm">
            <CheckCircle size={16} className="mr-2 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="New Password"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
         {successMessage && (
            <p className="text-center text-sm text-slate-400 mt-6">
                Redirecting to login...
            </p>
         )}
      </div>
    </div>
  );
}
