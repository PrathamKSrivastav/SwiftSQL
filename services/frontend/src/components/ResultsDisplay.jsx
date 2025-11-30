import { useState } from 'react';
import { Download, AlertCircle, ChevronLeft, ChevronRight, Copy, Eye, EyeOff } from 'lucide-react';

export default function ResultsDisplay({ results, isLoading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showJSON, setShowJSON] = useState(false);
  const [copiedCell, setCopiedCell] = useState(null);

  // Robust data extraction with multiple fallbacks
  const safeResults = results?.results || results?.data || (Array.isArray(results) ? results : []);
  const safeRowCount = results?.rowCount ?? safeResults.length ?? 0;
  const safeExecutionTime = results?.executionTime ?? 0;
  const columns = results?.columns || (safeResults.length > 0 ? Object.keys(safeResults[0]) : []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Executing query...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-1">Query Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!results || safeResults.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg mb-2">📊 Execute a query to see results</p>
        <p className="text-gray-500 text-sm">Results will appear here once you run a query</p>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(safeResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = safeResults.slice(startIndex, endIndex);

  const handleCopyCell = (value) => {
    navigator.clipboard.writeText(String(value));
    setCopiedCell(value);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (safeResults.length === 0) return;

    const csvContent = [
      columns.join(','),
      ...safeResults.map((row) =>
        columns.map((col) => {
          const value = row[col];
          const escaped = String(value ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-xs">NULL</span>;
    }

    if (typeof value === 'object') {
      return (
        <button
          onClick={() => alert(JSON.stringify(value, null, 2))}
          className="text-blue-600 hover:underline text-xs"
        >
          {'{'}...{'}'}
        </button>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`font-semibold text-xs ${value ? 'text-green-600' : 'text-red-600'}`}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-gray-700">
            {safeRowCount} rows returned
          </span>
          {safeExecutionTime > 0 && (
            <span className="text-sm text-gray-600">
              Execution time: {safeExecutionTime}ms
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowJSON(!showJSON)}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
          >
            {showJSON ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{showJSON ? 'Table' : 'JSON'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {showJSON ? (
        <div className="p-4 bg-gray-900 overflow-auto max-h-96">
          <pre className="text-sm text-green-400 font-mono">
            {JSON.stringify(safeResults, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{col}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          ({displayedRows.length > 0 && displayedRows[0]?.[col] !== undefined
                            ? typeof displayedRows[0][col] === 'number' 
                              ? 'number' 
                              : typeof displayedRows[0][col] === 'boolean' 
                              ? 'boolean' 
                              : 'text'
                            : 'text'})
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {displayedRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50 transition">
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-3 whitespace-nowrap max-w-xs truncate cursor-pointer"
                        onClick={() => handleCopyCell(row[col])}
                        title={`Click to copy: ${row[col]}`}
                      >
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, safeResults.length)} of {safeResults.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
