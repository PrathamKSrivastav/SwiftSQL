import { useState } from 'react';
import {
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ResultsDisplay({ results, isLoading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showJSON, setShowJSON] = useState(false);
  const [copiedCell, setCopiedCell] = useState(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center h-80">
        <div className="space-y-4 w-full">
          {/* Animated skeleton loader */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="flex-1 h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-gray-600 mt-8 text-center">Executing query...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 flex items-start space-x-4">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-red-800 font-bold text-lg mb-2">Query Error</h3>
          <p className="text-red-700 text-sm font-mono bg-red-100 p-3 rounded overflow-auto max-h-40">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center h-80 flex items-center justify-center">
        <div>
          <p className="text-gray-600 text-lg font-semibold">
            📊 Execute a query to see results
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Results will appear here once you run a query
          </p>
        </div>
      </div>
    );
  }

  const rows = results.data || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // Pagination logic
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const displayedRows = rows.slice(startIdx, endIdx);

  const handleCopyCell = (value) => {
    navigator.clipboard.writeText(JSON.stringify(value));
    setCopiedCell(value);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  const handleExportCSV = () => {
    // CSV Header
    const header = columns.join(',');

    // CSV Body
    const body = rows
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            const stringValue =
              typeof value === 'string' ? value : JSON.stringify(value);
            // Escape quotes
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${header}\n${body}`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.json`;
    a.click();
  };

  // Format cell value for display
  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }
    if (typeof value === 'object') {
      return (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {JSON.stringify(value)}
        </code>
      );
    }
    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-green-600 font-semibold' : 'text-red-600'}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{rows.length}</span> rows
              returned
            </p>
            {results.executionTime && (
              <p className="text-xs text-gray-500">
                Execution time: {results.executionTime}ms
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowJSON(!showJSON)}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
          >
            {showJSON ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showJSON ? 'Table' : 'JSON'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
          >
            <Download size={16} />
            <span>JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* JSON View */}
      {showJSON && (
        <div className="bg-gray-900 rounded-lg shadow-md p-4 overflow-auto max-h-96">
          <pre className="text-green-400 font-mono text-xs">
            {JSON.stringify(rows, null, 2)}
          </pre>
        </div>
      )}

      {/* Table View */}
      {!showJSON && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            
            {/* Table */}
            <div className="overflow-x-auto">
              {rows.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left w-10 bg-gray-100">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-100 whitespace-nowrap"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{col}</span>
                            <span className="text-xs text-gray-500">
                              ({
                                typeof displayedRows[0]?.[col] === 'number'
                                  ? 'number'
                                  : typeof displayedRows[0]?.[col] === 'boolean'
                                  ? 'boolean'
                                  : 'text'
                              })
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-gray-200 hover:bg-blue-50 transition group"
                      >
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" className="w-4 h-4" />
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-3 text-gray-700 relative group/cell"
                          >
                            <div className="flex items-center justify-between group-hover:bg-gray-100 p-1 rounded">
                              <span className="truncate max-w-xs">
                                {formatCellValue(row[col])}
                              </span>
                              <button
                                onClick={() => handleCopyCell(row[col])}
                                className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-gray-200 rounded transition"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-600">
                  Query executed successfully but returned no rows.
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {rows.length > rowsPerPage && (
            <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} (
                {rows.length > 0 ? startIdx + 1 : 0} -{' '}
                {Math.min(endIdx, rows.length)} of {rows.length})
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded transition ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Footer */}
      <div className="text-xs text-gray-500 text-center">
        💡 Click on cells to copy values. Use JSON tab to view raw data.
      </div>
    </div>
  );
}
