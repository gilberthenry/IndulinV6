import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import LoginBackground from '../assets/Login_Background.jpg';
import KCPLogo from '../assets/kings-college-of-the-philippines-logo.jpg';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const { token, refreshToken, user } = await authService.login({ email, password });
      login(user, token, refreshToken);

      if (user.role === 'employee') navigate('/employee/dashboard');
      else if (user.role === 'hr') navigate('/hr/dashboard');
      else if (user.role === 'mis') navigate('/mis/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div 
      className="h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      <div className="flex items-center justify-center h-screen bg-black bg-opacity-50">
        <div className="bg-black/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
          <div className="text-center mb-8">
            <img src={KCPLogo} alt="KCP Logo" className="w-16 h-16 rounded-2xl mx-auto shadow-lg mb-4" />
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-200 text-sm mt-1">Sign in to your account</p>
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right -mt-2 mb-2">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <LogIn size={20} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
