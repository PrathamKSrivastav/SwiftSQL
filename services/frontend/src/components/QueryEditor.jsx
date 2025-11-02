import { useState } from 'react';
import { Play, Save, Copy, Trash2 } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function QueryEditor({ query, setQuery, onExecute, isLoading, onSave }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-semibold text-gray-700">SQL Query</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setQuery('')}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
          >
            <Copy size={16} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={onExecute}
            disabled={isLoading || !query.trim()}
            className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            <Play size={16} />
            <span>{isLoading ? 'Executing...' : 'Execute'}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-none"
          placeholder="SELECT * FROM table_name..."
          spellCheck="false"
        />
        
        {/* Syntax Highlight Preview */}
        <div className="absolute top-0 left-0 w-full h-64 p-4 pointer-events-none overflow-hidden">
          <SyntaxHighlighter
            language="sql"
            style={atomOneDark}
            customStyle={{
              margin: 0,
              padding: 0,
              fontSize: '14px',
              backgroundColor: 'transparent',
            }}
          >
            {query || 'SELECT * FROM table_name...'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
