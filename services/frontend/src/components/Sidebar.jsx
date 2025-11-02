import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, History, Database, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { path: '/editor', label: 'Editor', icon: BarChart3 },
    { path: '/history', label: 'History', icon: History },
    { path: '/databases', label: 'Databases', icon: Database },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Navigation Links */}
        <nav className="space-y-2">
          {links.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                location.pathname === path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
