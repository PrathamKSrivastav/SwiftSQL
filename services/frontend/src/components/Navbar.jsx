import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/editor')}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SwiftSQL</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => navigate('/editor')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Editor
          </button>
          <button
            onClick={() => navigate('/history')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            History
          </button>
          <button
            onClick={() => navigate('/databases')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Databases
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <img
              src={user?.picture}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded text-red-600"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-50 p-4 space-y-2">
          <button
            onClick={() => {
              navigate('/editor');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded"
          >
            Editor
          </button>
          <button
            onClick={() => {
              navigate('/history');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded"
          >
            History
          </button>
          <button
            onClick={() => {
              navigate('/databases');
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded"
          >
            Databases
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
