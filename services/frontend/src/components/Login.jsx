import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { user, login, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/editor');
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await login(credentialResponse);
    if (result?.success) {
      navigate('/editor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl text-white font-bold">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">SwiftSQL</h1>
          <p className="text-gray-600 mt-2">Natural Language to SQL</p>
        </div>

        {/* Description */}
        <div className="mb-8 text-center">
          <p className="text-gray-700 font-semibold mb-2">Connect Your Database</p>
          <p className="text-gray-500 text-sm">
            Login with Google to get started. Your database credentials are encrypted and secure.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Google Login */}
        <div className="mb-6">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                text="signin"
                size="large"
              />
            </div>
          </GoogleOAuthProvider>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 mt-2">Logging in...</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm font-semibold mb-4">Features:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Convert Natural Language to SQL</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Execute queries on your database</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Save and manage query history</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Encrypted database credentials</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
