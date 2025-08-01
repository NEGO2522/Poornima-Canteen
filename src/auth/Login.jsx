import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, actionCodeSettings, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, googleProvider, signInWithPopup } from '../firebase/firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'owner'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Set up auth state persistence and handle email link sign-in
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });

    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const OWNER_EMAIL = '2024btechaimlkshitij18489@poornima.edu.in';
        const isOwner = user.email === OWNER_EMAIL;
        const defaultPath = isOwner ? '/owner-dashboard' : '/dashboard';
        const from = location.state?.from?.pathname || defaultPath;
        navigate(from, { replace: true });
      }
    });

    // Check if we're handling a sign-in link
    const handleEmailLinkSignIn = async () => {
      // Check if we're handling a sign-in link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          // Get the email from localStorage or prompt the user for it
          let email = window.localStorage.getItem('emailForSignIn');
          
          // If email is not in localStorage, check URL parameters or prompt the user
          if (!email) {
            // Try to get email from URL parameters if it exists
            const urlParams = new URLSearchParams(window.location.search);
            email = urlParams.get('email') || window.prompt('Please provide your email for confirmation');
            
            if (!email) {
              toast.error('Email is required to complete sign in');
              return;
            }
          }

          // Get the full URL for sign-in
          const fullUrl = window.location.href;
          
          // Clear the URL to prevent re-triggering this effect
          // But keep the path and search params for the redirect
          const cleanPath = window.location.pathname;
          window.history.replaceState({}, document.title, cleanPath);
          
          // Complete the sign-in process
          const result = await signInWithEmailLink(auth, email, fullUrl);
          
          // Clear the email from localStorage
          window.localStorage.removeItem('emailForSignIn');
          
          // Redirect to the appropriate dashboard based on user role
          const OWNER_EMAIL = '2024btechaimlkshitij18489@poornima.edu.in';
          const isOwner = result.user.email === OWNER_EMAIL;
          const defaultPath = isOwner ? '/owner-dashboard' : '/dashboard';
          const from = location.state?.from?.pathname || defaultPath;
          navigate(from, { replace: true });
          
          toast.success(`Successfully signed in as ${isOwner ? 'owner' : 'user'}!`);
          
        } catch (error) {
          console.error('Error signing in with email link', error);
          let errorMessage = 'Failed to sign in with email link';
          
          if (error.code === 'auth/invalid-action-code') {
            errorMessage = 'The sign-in link is invalid or has expired. Please request a new one.';
          } else if (error.code === 'auth/expired-action-code') {
            errorMessage = 'The sign-in link has expired. Please request a new one.';
          } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact support.';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please sign up first.';
          }
          
          toast.error(errorMessage);
          
          // Redirect to login page if there's an error
          navigate('/login', { replace: true });
        }
      }
    };

    handleEmailLinkSignIn();
    
    return () => unsubscribe();
  }, [navigate, location]);

  const handleGoogleSignIn = async (userType = 'user') => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if the user is the owner
      const OWNER_EMAIL = '2024btechaimlkshitij18489@poornima.edu.in';
      const isOwner = user.email === OWNER_EMAIL;
      
      // If user is trying to sign in as owner but email doesn't match
      if (userType === 'owner' && !isOwner) {
        await auth.signOut();
        throw new Error('Only authorized owners can access this section');
      }
      
      // Redirect based on actual user type, not the login button they clicked
      // Only redirect to owner dashboard if they are the owner
      if (isOwner) {
        navigate('/owner-dashboard', { replace: true });
        toast.success('Successfully signed in as owner!');
      } else {
        navigate('/dashboard', { replace: true });
        toast.success('Successfully signed in!');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in credentials';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in popup was closed before completion';
      } else if (error.message.includes('Only authorized owners')) {
        errorMessage = 'Only authorized owners can access this section';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const OWNER_EMAIL = '2024btechaimlkshitij18489@poornima.edu.in';
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if it's owner login and email doesn't match
    if (activeTab === 'owner' && email !== OWNER_EMAIL) {
      toast.error('Only authorized owners can access this section');
      return;
    }

    try {
      // Clear any previous email from localStorage
      window.localStorage.removeItem('emailForSignIn');
      
      // Create a complete sign-in URL with email parameter
      const signInUrl = new URL(window.location.origin + '/login');
      signInUrl.searchParams.append('email', email);
      
      // Prepare the action code settings with the complete URL
      const settings = {
        ...actionCodeSettings,
        url: signInUrl.toString(),
        handleCodeInApp: true
      };
      
      // Send the sign-in link
      await sendSignInLinkToEmail(auth, email, settings);
      
      // Save the email to localStorage for later use
      window.localStorage.setItem('emailForSignIn', email);
      setIsEmailSent(true);
      
      toast.success('Sign-in link sent to your email! Please check your inbox and click the link to sign in.');
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      let errorMessage = 'Failed to send sign-in link';
      
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized. Please contact support.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'Daily email sign-in quota exceeded. Please try again tomorrow or use another sign-in method.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use. Please use a different email or sign in.';
          break;
        default:
          errorMessage = error.message || 'An error occurred. Please try again.';
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-30"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-md mx-auto w-full">
          <div className="bg-black/50 backdrop-blur-md p-8 rounded-xl max-w-md mx-auto border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">Welcome Back!</h2>
            
            {/* Login Tabs */}
            <div className="flex mb-8 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-3 font-medium ${activeTab === 'user' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
              >
                <FaUser className="inline-block mr-2" /> User Login
              </button>
              <button
                onClick={() => setActiveTab('owner')}
                className={`flex-1 py-3 font-medium ${activeTab === 'owner' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
              >
                <FaUserTie className="inline-block mr-2" /> Owner Login
              </button>
            </div>
            
            {!isEmailSent ? (
              <>
                {activeTab === 'user' ? (
                  <div className="space-y-6">
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white/5 border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <FcGoogle className="text-2xl" />
                      <span className="font-medium">Continue with Google</span>
                    </button>
                    
                    <div className="relative mt-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 bg-black/50 text-gray-300 text-sm">or</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm text-center mt-6">
                      Continue as <button 
                        onClick={() => setActiveTab('owner')} 
                        className="text-yellow-400 hover:text-yellow-300 font-medium"
                      >
                        Canteen Owner
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <form onSubmit={handleEmailLogin}>
                      <div className="mb-4">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your owner email"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg transition-all duration-200"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Sending...' : 'Send Owner Sign-in Link'}
                      </button>
                    </form>
                    
                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => setActiveTab('user')} 
                        className="text-yellow-400 hover:text-yellow-300 text-sm font-medium disabled:opacity-50"
                        disabled={isLoading}
                      >
                        ← Back to User Login
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  We've sent a {activeTab === 'owner' ? 'owner ' : ''}sign-in link to <span className="text-white font-medium">{email}</span>
                </p>
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 text-lg font-medium transition-colors"
                >
                  Back to {activeTab === 'owner' ? 'owner login' : 'sign in'}
                </button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-white/10 text-sm text-gray-400">
              <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;