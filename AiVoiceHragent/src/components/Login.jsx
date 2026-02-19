import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import API from "../axios";
import AnimatedBackground from './AnimatedBackground';
import '../styles/animations.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post('/api/users/login', {
        email,
        password
      });

      if(response.status===400){
        toast.error("Invalid email or password || user not register" );
        setIsLoading(false);
        return;
      }

      console.log(response);

      if (response.status === 201) {
        localStorage.setItem('token', response?.data?.token);
        console.log(response.data.token);

        toast.success("Logged in successfully!");

        setTimeout(() => {
          navigate('/main');
        }, 2000);
        setIsLoading(false)
      }
    } catch (error) {
      
      console.log("Something went wrong", error.message);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    canvas: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(135deg, #030712 0%, #1e1b4b 100%)',
    },
    gradientOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
      pointerEvents: 'none',
      zIndex: 1,
    },
    mouseGradient: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.15), transparent 80%)',
      pointerEvents: 'none',
      zIndex: 1,
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground canvasRef={canvasRef} styles={styles} />

     

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Glassmorphic Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-200/70">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-200/90 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200/90 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400/50" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-blue-500/20">
            <p className="text-center text-blue-200/70">
              Don't have an account?{' '}
              <Link
                to="/"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-blue-200/50 text-sm mt-6">
          AI HR Calling Agent - Powered by Ruvanta Technology
        </p>
      </div>
    </div>
  );
};

export default Login;