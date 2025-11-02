import { useState } from 'react';
import axios from 'axios';
import { Zap } from 'lucide-react';

export default function NLPConverter({ onSQLGenerated }) {
  const [nlpInput, setNlpInput] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!nlpInput.trim()) {
      setError('Please enter a natural language query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/nlp-to-sql',
        { question: nlpInput }
      );

      const sql = response.data.sql;
      setGeneratedSQL(sql);
      onSQLGenerated(sql); // Pass to parent to update Query Editor
    } catch (err) {
      setError('Failed to generate SQL: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">🤖 NLP Converter</h2>

      {/* Natural Language Input */}
      <textarea
        value={nlpInput}
        onChange={(e) => setNlpInput(e.target.value)}
        placeholder="Enter your query in natural language...
e.g., 'Show me all users who registered this month'"
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      {/* Generate Button */}
      <button
        onClick={handleConvert}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Zap className="w-5 h-5" />
        {loading ? 'Converting...' : 'Convert to SQL'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Generated SQL Output */}
      {generatedSQL && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Generated SQL:</p>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <code className="text-sm text-gray-900 break-words">
              {generatedSQL}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
