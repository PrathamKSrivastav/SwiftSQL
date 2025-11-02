import { Trash2, Clock, Copy } from 'lucide-react';

export default function QueryHistory({ queries = [] }) {
  // Ensure queries is always an array
  const queryList = Array.isArray(queries) ? queries : [];

  if (queryList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          📜 Query History
        </h2>
        <p className="text-gray-500 text-center py-8">No query history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        📜 Query History ({queryList.length})
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {queryList.map((q, idx) => (
          <div
            key={idx}
            className="flex justify-between items-start p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
          >
            <div className="flex-1 min-w-0">
              <code className="text-sm text-gray-900 break-words line-clamp-2">
                {typeof q === 'string' ? q : q.query || JSON.stringify(q)}
              </code>
              <p className="text-xs text-gray-500 mt-1">
                {q.timestamp ? new Date(q.timestamp).toLocaleTimeString() : 'Just now'}
              </p>
            </div>
            <div className="flex gap-2 ml-2 flex-shrink-0">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(typeof q === 'string' ? q : q.query || '')
                }
                className="p-1 hover:bg-gray-200 rounded text-gray-600 transition"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => console.log('Delete:', idx)}
                className="p-1 hover:bg-red-100 rounded text-red-600 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
