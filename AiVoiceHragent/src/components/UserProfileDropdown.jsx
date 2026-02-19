import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../axios';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await API.get('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);

      // Handle token expiration or invalid token
      if (error.response?.status === 401) {
        const errorType = error.response?.data?.error;

        if (errorType === 'TOKEN_EXPIRED') {
          console.log('Token expired, redirecting to login...');
          toast.info('Session expired. Please login again.');
        } else if (errorType === 'INVALID_TOKEN') {
          console.log('Invalid token, redirecting to login...');
          toast.error('Invalid session. Please login again.');
        } else {
          console.log('Unauthorized, redirecting to login...');
          toast.error('Please login to continue.');
        }

        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Other errors (500, network, etc.)
        console.error('Failed to fetch user profile:', error.message);
        toast.error('Failed to load profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await API.post('/api/users/logout');
      localStorage.removeItem('token');
      toast.success('Signed out successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still sign out locally even if API call fails
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get initials from username
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-blue-500/30 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/30">
          {getInitials(user.username)}
        </div>
        
        {/* Username (hidden on mobile) */}
        <span className="hidden md:block text-white font-medium text-sm">
          {user.username}
        </span>
        
        {/* Chevron Icon */}
        <ChevronDown 
          className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl shadow-blue-500/20 overflow-hidden z-50 animate-fadeIn">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                {getInitials(user.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {user.username}
                </p>
                <p className="text-blue-200/70 text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserProfileDropdown;

