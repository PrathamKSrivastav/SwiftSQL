import { useState } from 'react';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import { useDatabaseStore } from '../stores/databaseStore';

export default function ConnectionForm({ onConnected }) {
  const [formData, setFormData] = useState({
    name: '',
    //type: 'mysql',
    host: '',
    port: '3306',
    database: '',
    username: '',
    password: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { testConnection, createConnection, isLoading } = useDatabaseStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    try {
      const result = await testConnection(formData);
      setTestResult({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestResult({ success: false, message: error });
    }
    setTesting(false);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!testResult?.success) {
  //     alert('Please test connection first');
  //     return;
  //   }
  //   try {
  //     await createConnection(formData);
  //     setFormData({
  //       name: '',
  //       type: 'mysql',
  //       host: '',
  //       port: '3306',
  //       database: '',
  //       username: '',
  //       password: '',
  //     });
  //     setTestResult(null);
  //     onConnected?.();
  //   } catch (error) {
  //     console.error('Error creating connection:', error);
  //   }
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!testResult?.success) {
    alert('Please test connection first');
    return;
  }

  try {
    await createConnection(formData);
    // Success! Reset form
    setFormData({
      name: '',
      type: 'mysql',
      host: '',
      port: '3306',
      database: '',
      username: '',
      password: '',
    });
    setTestResult(null);
    onConnected?.();
  } catch (error) {
    // Show actual error to user
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create connection';
    alert(`Error: ${errorMsg}`);
    console.error('Error creating connection:', error);
  }
};


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      
      <div className="flex items-center space-x-2 mb-6">
        <Database className="text-primary" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Add Database Connection</h3>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Connection Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Production DB"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Database Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="mysql">MySQL</option>
          <option value="postgres">PostgreSQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="sqlite">SQLite</option>
        </select>
      </div>

      {/* Connection Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Host</label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleChange}
            placeholder="localhost"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Port</label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Database */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Database Name
        </label>
        <input
          type="text"
          name="database"
          value={formData.database}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`mb-4 p-3 rounded-lg flex items-start space-x-2 ${
          testResult.success
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {testResult.success ? (
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !formData.host || !formData.database}
          className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          type="submit"
          disabled={isLoading || !testResult?.success}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          {isLoading ? 'Adding...' : 'Add Connection'}
        </button>
      </div>

      {/* Security Note */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        🔒 Your credentials are encrypted and never stored in plain text.
      </p>
    </form>
  );
}
