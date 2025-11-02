import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar';
import { ArrowRight, Zap, Lock, Database, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Convert Natural Language to SQL
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ask questions in plain English and SwiftSQL will convert them to SQL queries.
            Query your database without writing a single line of code.
          </p>
          <button
            onClick={() => navigate(user ? '/editor' : '/login')}
            className="inline-flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition font-semibold text-lg"
          >
            <span>{user ? 'Go to Editor' : 'Get Started'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Sparkles className="text-primary mb-4" size={32} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI Query Generation</h3>
              <p className="text-gray-600 text-sm">
                Convert natural language to optimized SQL queries instantly
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Database className="text-primary mb-4" size={32} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Multiple Databases</h3>
              <p className="text-gray-600 text-sm">
                Connect to MySQL, PostgreSQL, MongoDB, and more
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Lock className="text-primary mb-4" size={32} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your credentials are encrypted. We never store your data
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Zap className="text-primary mb-4" size={32} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Real-time Results</h3>
              <p className="text-gray-600 text-sm">
                Execute queries directly on your database instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Login with Google to connect your database and start querying with natural language
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
            >
              Sign In Now
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 SwiftSQL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
