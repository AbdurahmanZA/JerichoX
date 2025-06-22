import React from 'react'
import { Shield, Camera, Phone, AlertTriangle, Activity, Users } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold text-white">JERICHO Security Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-400">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">System Online</span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Camera Systems</h3>
                <p className="text-gray-400">Hikvision Integration</p>
                <p className="text-green-400 text-sm mt-1">Ready for Configuration</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Emergency Calling</h3>
                <p className="text-gray-400">Asterisk PBX</p>
                <p className="text-yellow-400 text-sm mt-1">VM Configuration Needed</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">AI Analytics</h3>
                <p className="text-gray-400">Threat Detection</p>
                <p className="text-yellow-400 text-sm mt-1">VM Configuration Needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Welcome to JERICHO</h2>
          <p className="text-gray-300 mb-6">
            Enterprise Security Control Room with Unified Communications. 
            Your security platform is successfully deployed and ready for configuration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                System Status
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  React Development Server Running
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Docker Environment Ready
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Node.js v18.19.1 Active
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Awaiting API Configuration
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Next Steps</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Configure Hikvision API credentials</li>
                <li>• Set up Asterisk VM for emergency calling</li>
                <li>• Deploy AI VM for analytics processing</li>
                <li>• Configure NFS shared storage</li>
                <li>• Test inter-VM communication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>JERICHO Security Platform v1.0.0 • ESXi Infrastructure • Ubuntu 24.04 LTS</p>
          <p className="mt-1">Enterprise Security Control Room with Unified Communications</p>
        </div>
      </main>
    </div>
  )
}

export default App
