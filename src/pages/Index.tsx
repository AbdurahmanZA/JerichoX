import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CameraGrid } from '@/components/CameraGrid';
import { 
  Monitor, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  Minimize2,
  Camera,
  Settings,
  Eye,
  Menu,
  Plus,
  Shield
} from 'lucide-react';
import { 
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import CameraLayoutControls from '@/components/CameraLayoutControls';
import SystemStatusBox from '@/components/SystemStatusBox';
import QuickActions from '@/components/QuickActions';
import StreamLogsDrawer from '@/components/StreamLogsDrawer';
import BackendLogsDrawer from '@/components/BackendLogsDrawer';
import { ComprehensiveCameraSetup } from '@/components/ComprehensiveCameraSetup';
import { SaveLayoutButton } from '@/components/SaveLayoutButton';
import { config } from '@/config/environment';

const Index = () => {
  const [layout, setLayout] = useState(4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [backendLogs, setBackendLogs] = useState<string[]>([]);
  const [backendStatus, setBackendStatus] = useState({
    isConnected: false,
    activeStreams: 0,
    lastHeartbeat: null as Date | null
  });
  const [streamLogsOpen, setStreamLogsOpen] = useState(false);
  const [backendLogsOpen, setBackendLogsOpen] = useState(false);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [cameraUrls, setCameraUrls] = useState<Record<number, string>>({});
  const [cameraNames, setCameraNames] = useState<Record<number, string>>({});
  const [useUniversalPlayer, setUseUniversalPlayer] = useState(true);
  
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const backendWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isConnectingRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const lastConnectionAttemptRef = useRef(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-99), logEntry]);
  };

  const addBackendLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setBackendLogs(prev => [...prev.slice(-99), logEntry]);
  };

  // Load layout preference
  useEffect(() => {
    const savedLayout = localStorage.getItem('jericho-camera-layout');
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      setLayout(parsed.layout || 4);
      addLog(`Loaded saved configuration: ${parsed.layout} camera layout`);
    }
  }, []);

  // Save layout preference
  useEffect(() => {
    localStorage.setItem('jericho-camera-layout', JSON.stringify({ 
      layout,
      lastUpdated: new Date().toISOString()
    }));
  }, [layout]);

  const handleSnapshot = async (cameraId: number) => {
    try {
      const response = await fetch(`/api/cameras/${cameraId}/snapshot`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Snapshot Captured",
          description: `Camera ${cameraId} snapshot saved successfully`,
        });
        addLog(`Snapshot captured for Camera ${cameraId}`);
      } else {
        throw new Error('Snapshot failed');
      }
    } catch (error: any) {
      toast({
        title: "Snapshot Failed",
        description: `Could not capture snapshot for Camera ${cameraId}`,
        variant: "destructive",
      });
      addLog(`Snapshot failed for Camera ${cameraId}: ${error.message}`);
    }
  };

  const handleAddCameras = (cameras: Array<{ id: number; name: string; url: string; }>) => {
    const newUrls = { ...cameraUrls };
    const newNames = { ...cameraNames };
    
    cameras.forEach(camera => {
      newUrls[camera.id] = camera.url;
      newNames[camera.id] = camera.name;
    });
    
    setCameraUrls(newUrls);
    setCameraNames(newNames);
    
    if (addLog) {
      addLog(`Added ${cameras.length} cameras from comprehensive setup`);
    }
  };

  const totalPages = isFullscreen ? 1 : Math.ceil(12 / layout);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    addLog(`Switched to page ${page}`);
  };

  const copyLogs = (logType: 'stream' | 'backend') => {
    const logsToCopy = logType === 'stream' ? logs : backendLogs;
    navigator.clipboard.writeText(logsToCopy.join('\n'));
    toast({
      title: "Logs Copied",
      description: `${logType === 'stream' ? 'Stream' : 'Backend'} logs copied to clipboard`,
    });
  };

  const downloadLogs = (logType: 'stream' | 'backend') => {
    const logsToCopy = logType === 'stream' ? logs : backendLogs;
    const blob = new Blob([logsToCopy.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jericho-${logType}-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = (logType: 'stream' | 'backend') => {
    if (logType === 'stream') {
      setLogs([]);
    } else {
      setBackendLogs([]);
    }
    toast({
      title: "Logs Cleared",
      description: `${logType === 'stream' ? 'Stream' : 'Backend'} logs cleared`,
    });
  };

  const systemStatus = {
    uptime: "2h 34m",
    activeStreams: backendStatus.activeStreams,
    totalEvents: 0,
    hikvisionConnections: 0
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {!isFullscreen && (
          <Sidebar className="sidebar-professional">
            <SidebarContent className="p-4 space-y-6">
              <SidebarGroup>
                <SidebarGroupLabel className="text-white font-bold uppercase tracking-wide">
                  Camera Layout
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <CameraLayoutControls
                    layout={layout}
                    isFullscreen={isFullscreen}
                    onLayoutChange={setLayout}
                    onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  />
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-white font-bold uppercase tracking-wide">
                  System Status
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SystemStatusBox systemStatus={systemStatus} />
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-white font-bold uppercase tracking-wide">
                  Quick Actions
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <QuickActions 
                    onShowSnapshots={() => {}}
                    onShowHikvisionSetup={() => {}}
                    onShowSettings={() => {}}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        )}

        <main className="flex-1 flex flex-col">
          {/* Professional Header with JERICHO Branding */}
          <div className="header-professional">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {!isFullscreen && <SidebarTrigger className="text-white hover:bg-slate-700" />}
                  <div className="flex items-center space-x-4">
                    {/* JERICHO Logo - Professional Size */}
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-3 jericho-shield">
                      <Shield className="w-full h-full text-jericho-accent" />
                    </div>
                    {!isFullscreen && (
                      <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight jericho-brand">
                          JERICHO SECURITY
                        </h1>
                        <p className="text-sm jericho-security-text font-medium">
                          Professional Video Surveillance System
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera Controls Section */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-300">
                    <span className="bg-slate-700 px-3 py-1 rounded-full">
                      Page {currentPage} • {layout} cameras
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUseUniversalPlayer(!useUniversalPlayer)}
                      className={useUniversalPlayer ? "jericho-btn-accent" : "bg-slate-600 text-white"}
                    >
                      {useUniversalPlayer ? 'Universal Player' : 'Legacy Player'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCameraSetup(true)}
                      className="jericho-btn-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cameras
                    </Button>
                    
                    <SaveLayoutButton
                      layout={layout}
                      currentPage={currentPage}
                      cameraUrls={cameraUrls}
                      cameraNames={cameraNames}
                    />

                    <Button
                      variant={isFullscreen ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="jericho-btn-primary"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="w-4 h-4 mr-2" />
                          Exit Fullscreen
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Fullscreen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Camera Grid */}
          <div className="flex-1">
            <CameraGrid
              layout={layout}
              isFullscreen={isFullscreen}
              onSnapshot={handleSnapshot}
              currentPage={currentPage}
              onLog={addLog}
              cameraUrls={cameraUrls}
              cameraNames={cameraNames}
              onCameraUrlsChange={setCameraUrls}
              onCameraNamesChange={setCameraNames}
              useUniversalPlayer={useUniversalPlayer}
            />
          </div>

          {/* Professional Bottom Status Bar */}
          {!isFullscreen && (
            <div className="border-t border-slate-600 bg-slate-900/95 backdrop-blur-sm">
              <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-slate-300">
                    <span className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-jericho-accent" />
                      <span>Cameras: {layout}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-jericho-accent" />
                      <span>Active: {backendStatus.activeStreams}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full security-pulse ${backendStatus.isConnected ? 'status-indicator-online' : 'status-indicator-offline'}`}></div>
                      <span className="font-medium">
                        Backend: {backendStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStreamLogsOpen(true)}
                      className="jericho-btn-primary"
                    >
                      Stream Logs ({logs.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBackendLogsOpen(true)}
                      className="jericho-btn-primary"
                    >
                      Backend Logs ({backendLogs.length})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <ComprehensiveCameraSetup
          open={showCameraSetup}
          onClose={() => setShowCameraSetup(false)}
          onAddCameras={handleAddCameras}
          existingCameras={cameraUrls}
        />
        
        <StreamLogsDrawer 
          open={streamLogsOpen}
          onOpenChange={setStreamLogsOpen}
          logs={logs}
          onCopy={() => copyLogs('stream')}
          onDownload={() => downloadLogs('stream')}
          onClear={() => clearLogs('stream')}
          activeStreams={backendStatus.activeStreams}
        />
        
        <BackendLogsDrawer 
          open={backendLogsOpen}
          onOpenChange={setBackendLogsOpen}
          logs={backendLogs}
          onCopy={() => copyLogs('backend')}
          onDownload={() => downloadLogs('backend')}
          onClear={() => clearLogs('backend')}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
