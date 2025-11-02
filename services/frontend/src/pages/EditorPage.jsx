import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import NLPConverter from '../components/NLPConverter';  // Keep the typo filename
import ResultsDisplay from '../components/ResultsDisplay';
import QueryHistory from '../components/QueryHistory';

export default function EditorPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);  // Initialize as empty array
  const [error, setError] = useState('');

  const handleExecute = async () => {
    setLoading(true);
    setError('');
    try {
      // Add to history
      setQueryHistory((prev) => [
        { query: sqlQuery, timestamp: new Date() },
        ...prev,
      ]);
      // Execute query logic here
      setResults([{ id: 1, name: 'User 1' }]);
    } catch (err) {
      setError('Error executing query');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">SQL Editor</h1>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Left: Query Editor */}
              <div className="col-span-2">
                <QueryEditor
                  query={sqlQuery}
                  onQueryChange={setSqlQuery}
                  onExecute={handleExecute}
                  loading={loading}
                />
              </div>

              {/* Right: NLP Converter */}
              <div>
                <NLPConverter onSQLGenerated={setSqlQuery} />
              </div>
            </div>

            {/* Results Display */}
            <ResultsDisplay results={results} loading={loading} error={error} />

            {/* Query History - Pass as array */}
            <QueryHistory queries={queryHistory} />
          </div>
        </main>
      </div>
    </div>
  );
}
