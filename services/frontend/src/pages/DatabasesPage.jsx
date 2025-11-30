import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 ADD THIS
import { useDatabaseStore } from '../stores/databaseStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ConnectionForm from '../components/ConnectionForm';
import { Trash2, Plus } from 'lucide-react';

export default function DatabasesPage() {
  const navigate = useNavigate(); // 👈 ADD THIS
  const { connections, fetchConnections, setSelectedConnection, deleteConnection } = useDatabaseStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleDelete = async (connectionId, connectionName) => {
    if (window.confirm(`Are you sure you want to delete "${connectionName}"?`)) {
      try {
        await deleteConnection(connectionId);
      } catch (error) {
        alert(`Failed to delete connection: ${error.message}`);
      }
    }
  };

  // 👇 ADD THIS FUNCTION
  const handleUseConnection = (conn) => {
    setSelectedConnection(conn);
    navigate('/editor'); // Navigate to editor page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Database Connections</h1>
                <p className="text-gray-600 mt-2">Manage your database connections securely</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition"
              >
                <Plus size={20} />
                <span>New Connection</span>
              </button>
            </div>

            {/* Add Connection Form */}
            {showForm && (
              <div className="mb-8">
                <ConnectionForm onConnected={() => setShowForm(false)} />
              </div>
            )}

            {/* Connections Grid */}
            {connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map((conn) => (
                  <div
                    key={conn._id || conn.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{conn.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{conn.type || 'mysql'}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(conn._id || conn.id, conn.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete connection"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>
                        <span className="font-semibold">Host:</span> {conn.host}:{conn.port}
                      </p>
                      <p>
                        <span className="font-semibold">Database:</span> {conn.database}
                      </p>
                      <p>
                        <span className="font-semibold">User:</span> {conn.username}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUseConnection(conn)} // 👈 CHANGED THIS
                      className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition font-semibold text-sm"
                    >
                      Use This Connection
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-600 mb-4">No database connections yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition"
                >
                  Add Your First Connection
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
