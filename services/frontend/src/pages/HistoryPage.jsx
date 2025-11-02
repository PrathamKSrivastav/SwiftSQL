import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Calendar, Trash2, Copy } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder queries - replace with real data
  const queries = [
    {
      _id: '1',
      query: 'SELECT * FROM users',
      nlpQuery: 'Get all users',
      database: 'myapp_db',
      createdAt: new Date().toISOString(),
      status: 'success',
    },
    {
      _id: '2',
      query: 'SELECT COUNT(*) FROM orders',
      nlpQuery: 'How many orders do we have',
      database: 'myapp_db',
      createdAt: new Date().toISOString(),
      status: 'success',
    },
  ];

  // Filter queries safely
  const filteredQueries = Array.isArray(queries)
    ? queries.filter(
        (q) =>
          q.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.nlpQuery?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Query History
              </h1>
              <p className="text-gray-600">
                View and manage your previous SQL queries
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Queries List */}
            <div className="space-y-4">
              {filteredQueries.length > 0 ? (
                filteredQueries.map((q) => (
                  <div
                    key={q._id}
                    className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">
                          Natural Language:
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {q.nlpQuery}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        {q.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-xs text-gray-500 mb-1">SQL Query:</p>
                      <code className="text-sm text-gray-900 break-words">
                        {q.query}
                      </code>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                        <span>Database: {q.database}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(q.query)
                          }
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Copy query"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Delete handler
                            console.log('Delete:', q._id);
                          }}
                          className="p-2 hover:bg-red-100 rounded"
                          title="Delete query"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? 'No queries match your search'
                      : 'No query history yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
