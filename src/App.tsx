import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Settings from './components/Settings';
import { CameraGrid } from './components/CameraGrid';
import './index.css';

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  return (
    <div className="bg-gradient-to-r from-[#2D5A5C] to-[#4A6B75] p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#D18B47] rounded-full flex items-center justify-center">
            <span className="text-[#2D5A5C] font-bold">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wide">JERICHO SECURITY</h1>
          <span className="bg-[#D18B47] text-[#2D5A5C] px-3 py-1 rounded text-sm font-semibold">
            Camera Management System v2.0.0
          </span>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'default' : 'outline'}
              className={location.pathname === '/' 
                ? 'bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold' 
                : 'border-gray-300 text-white hover:bg-white/10'
              }
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button
              variant={location.pathname === '/settings' ? 'default' : 'outline'}
              className={location.pathname === '/settings' 
                ? 'bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold' 
                : 'border-gray-300 text-white hover:bg-white/10'
              }
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Home Page with Navigation
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
    <Navigation />
    <CameraGrid />
  </div>
);

// Settings Page with Navigation
const SettingsPageWithNav = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
    <Navigation />
    <div className="p-6">
      <Settings />
    </div>
  </div>
);

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPageWithNav />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
