import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, 
  AlertCircle, 
  Sparkles, 
  Table, 
  FileText,
  Clock,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDatabaseStore } from '../stores/databaseStore';
import { useQueryStore } from '../stores/queryStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import ResultsDisplay from '../components/ResultsDisplay';

export default function EditorPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedConnection, fetchTables, tables } = useDatabaseStore();
  const { executeQuery, convertNLPToSQL, results, isExecuting, error, fetchHistory, queries } = useQueryStore();
  
  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL query here\nSELECT * FROM users LIMIT 10;');
  const [showNLPPanel, setShowNLPPanel] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [convertingNLP, setConvertingNLP] = useState(false);
  const [showTables, setShowTables] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [executionStats, setExecutionStats] = useState(null);

  // Load tables and history when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      fetchTables(selectedConnection._id || selectedConnection.id).catch(() => {});
      fetchHistory().catch(() => {});
    }
  }, [selectedConnection]);

const handleExecute = async () => {
  if (!selectedConnection) {
    alert('Please select a database connection first');
    navigate('/databases');
    return;
  }

  try {
    const result = await executeQuery(sqlQuery, selectedConnection._id || selectedConnection.id);
    
    setExecutionStats({
      rowCount: result?.rowCount ?? result?.results?.length ?? 0,
      executionTime: result?.executionTime ?? 0,
      timestamp: new Date(),
    });

    fetchHistory().catch((err) => console.error('Failed to refresh history:', err));

    // Auto-detect USE statement and refresh tables
    const useMatch = sqlQuery.trim().match(/^USE\s+`?(\w+)`?;?$/i);
    if (useMatch) {
      const newDatabase = useMatch[1];
      console.log(`🔄 Database switched to: ${newDatabase}`);
      
      // Show a toast/notification (optional)
      // toast.success(`Switched to database: ${newDatabase}`);
      
      // Refresh tables after a short delay
      setTimeout(() => {
        fetchTables(selectedConnection._id || selectedConnection.id)
          .then(() => console.log(`✅ Tables refreshed for: ${newDatabase}`))
          .catch((err) => console.error('Failed to refresh tables:', err));
      }, 500);
    }
  } catch (err) {
    console.error('Query execution failed:', err);
    setExecutionStats(null);
  }
};




  const handleConvertNLP = async () => {
    if (!nlpQuery.trim()) return;
    
    setConvertingNLP(true);
    try {
      const generatedSQL = await convertNLPToSQL(nlpQuery);
      setSqlQuery(generatedSQL);
      setNlpQuery('');
      setShowNLPPanel(false);
    } catch (err) {
      console.error('NLP conversion failed:', err);
    } finally {
      setConvertingNLP(false);
    }
  };

  const handleTableClick = (tableName) => {
    setSqlQuery(`SELECT * FROM \`${tableName}\` LIMIT 100;`);
  };

  const handleHistoryClick = (query) => {
    setSqlQuery(query.generatedSQL);
  };

  const insertQuickSnippet = (snippet) => {
    setSqlQuery(snippet);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        
        {/* Left Sidebar - Database Explorer */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Connection Info */}
            {selectedConnection ? (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Database className="text-green-600 mt-1" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-800 truncate">
                      {selectedConnection.name}
                    </p>
                    <p className="text-xs text-green-600 truncate">
                      {selectedConnection.database}
                    </p>
                  </div>
                </div>
                <Link
                  to="/databases"
                  className="text-xs text-green-700 hover:underline mt-2 inline-block"
                >
                  Change
                </Link>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-yellow-600 mt-1" size={16} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-yellow-800">
                      No Connection
                    </p>
                    <Link
                      to="/databases"
                      className="text-xs text-yellow-700 hover:underline mt-1 inline-block"
                    >
                      Select Database
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tables List */}
            <div className="mb-4">
              <button
                onClick={() => setShowTables(!showTables)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <Table size={16} />
                  <span>Tables</span>
                </div>
                {showTables ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {showTables && (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {tables.length > 0 ? (
                    tables.map((table, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTableClick(table)}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition truncate"
                        title={`SELECT * FROM ${table}`}
                      >
                        📊 {table}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 px-3 py-2">
                      {selectedConnection ? 'No tables found' : 'Connect to see tables'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Query History */}
            <div className="mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Recent Queries</span>
                </div>
                {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {showHistory && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {queries.slice(0, 10).map((query, idx) => (
                    <button
                      key={query._id || idx}
                      onClick={() => handleHistoryClick(query)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition"
                      title={query.generatedSQL}
                    >
                      <p className="truncate font-mono">{query.generatedSQL.substring(0, 40)}...</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(query.createdAt).toLocaleTimeString()}
                      </p>
                    </button>
                  ))}
                  {queries.length === 0 && (
                    <p className="text-xs text-gray-500 px-3 py-2">No history yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Snippets */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <FileText size={16} />
                <span>Quick Snippets</span>
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => insertQuickSnippet('SHOW TABLES;')}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  📋 Show Tables
                </button>
                <button
                  onClick={() => insertQuickSnippet('SHOW DATABASES;')}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  🗄️ Show Databases
                </button>
                <button
                  onClick={() => insertQuickSnippet('DESCRIBE table_name;')}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  🔍 Describe Table
                </button>
                <button
                  onClick={() => insertQuickSnippet('SELECT COUNT(*) FROM table_name;')}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  🔢 Count Rows
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {/* AI Assistant Toggle Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">SQL Editor</h2>
              <button
                onClick={() => setShowNLPPanel(!showNLPPanel)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
              >
                <Sparkles size={18} />
                <span>{showNLPPanel ? 'Hide' : 'Show'} AI Assistant</span>
              </button>
            </div>

            {/* NLP Panel (Collapsible) */}
            {showNLPPanel && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="text-purple-600 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      AI-Powered Query Generator
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Describe what you want in plain English, and let AI generate the SQL for you.
                    </p>
                    <textarea
                      value={nlpQuery}
                      onChange={(e) => setNlpQuery(e.target.value)}
                      placeholder="e.g., Show me all users who signed up in the last 7 days"
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows="3"
                    />
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={handleConvertNLP}
                        disabled={!nlpQuery.trim() || convertingNLP}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                      >
                        {convertingNLP ? 'Generating...' : 'Generate SQL'}
                      </button>
                      <button
                        onClick={() => setNlpQuery('')}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Stats */}
            {executionStats && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-600">Rows:</span>
                    <span className="font-semibold text-gray-800 ml-1">{executionStats.rowCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-800 ml-1">{executionStats.executionTime}ms</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {executionStats.timestamp.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* SQL Editor */}
            <QueryEditor
              query={sqlQuery}
              setQuery={setSqlQuery}
              onExecute={handleExecute}
              isLoading={isExecuting}
              disabled={!selectedConnection}
            />

            {/* Results Display */}
            <ResultsDisplay
              results={results}
              isLoading={isExecuting}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
