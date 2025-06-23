import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Camera, Grid, Grid3X3, LayoutGrid, Maximize2 } from 'lucide-react';

interface Camera {
  id: number;
  name: string;
  type: string;
  url: string;
  status: string;
  location?: string;
  manufacturer?: string;
  model?: string;
}

// Mock camera data for development
const mockCameras: Camera[] = [
  {
    id: 1,
    name: "Front Entrance",
    type: "hikvision",
    url: "rtsp://192.168.1.100:554/stream1",
    status: "online",
    location: "Main Building",
    manufacturer: "Hikvision",
    model: "DS-2CD2085FWD-I"
  },
  {
    id: 2,
    name: "Parking Lot",
    type: "ip",
    url: "rtsp://192.168.1.101:554/stream1",
    status: "online",
    location: "Exterior",
    manufacturer: "Hikvision",
    model: "DS-2CD2023G0-I"
  },
  {
    id: 3,
    name: "Server Room",
    type: "rtsp",
    url: "rtsp://192.168.1.102:554/stream1",
    status: "offline",
    location: "IT Department",
    manufacturer: "Generic",
    model: "IP Camera"
  },
  {
    id: 4,
    name: "Reception Area",
    type: "hikvision",
    url: "rtsp://192.168.1.103:554/stream1",
    status: "online",
    location: "Main Building",
    manufacturer: "Hikvision",
    model: "DS-2CD2041G1-IDW1"
  }
];

// Camera Card Component
const CameraCard: React.FC<{ camera: Camera; isStreaming: boolean; onToggleStream: () => void }> = ({ 
  camera, 
  isStreaming, 
  onToggleStream 
}) => {
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-[#D18B47] transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white uppercase tracking-wide">
            {camera.name}
          </CardTitle>
          <Badge 
            variant={camera.status === 'online' ? 'default' : 'destructive'}
            className={camera.status === 'online' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {camera.status.toUpperCase()}
          </Badge>
        </div>
        <div className="text-xs text-gray-400">
          {camera.location} • {camera.manufacturer}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Video Stream Area */}
        <div className="aspect-video bg-black rounded-lg border border-gray-600 flex items-center justify-center relative overflow-hidden">
          {isStreaming ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#D18B47] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-[#D18B47] text-sm font-medium">STREAMING...</div>
                <div className="text-gray-400 text-xs mt-1">Progressive JPEG Feed</div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <div className="text-gray-400 text-sm">Camera Feed</div>
              <div className="text-gray-500 text-xs">Click to start streaming</div>
            </div>
          )}
          
          {/* Stream Controls */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 bg-black/50 border-gray-600 hover:bg-[#D18B47] hover:border-[#D18B47]"
              onClick={onToggleStream}
            >
              {isStreaming ? "⏸" : "▶"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 bg-black/50 border-gray-600 hover:bg-[#D18B47] hover:border-[#D18B47]"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Camera Info */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">{camera.model}</span>
          <span className={`font-medium ${camera.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {camera.status === 'online' ? '● LIVE' : '● OFFLINE'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Grid Layout Controls
const GridControls: React.FC<{ 
  gridSize: number; 
  onGridSizeChange: (size: number) => void;
  totalCameras: number;
}> = ({ gridSize, onGridSizeChange, totalCameras }) => {
  const gridOptions = [
    { size: 1, icon: Grid, label: "1x1" },
    { size: 4, icon: Grid, label: "2x2" },
    { size: 6, icon: Grid3X3, label: "2x3" },
    { size: 9, icon: LayoutGrid, label: "3x3" },
    { size: 12, icon: LayoutGrid, label: "3x4" }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 mr-2">Grid Size:</span>
      {gridOptions.map(({ size, icon: Icon, label }) => (
        <Button
          key={size}
          size="sm"
          variant={gridSize === size ? "default" : "outline"}
          className={gridSize === size 
            ? "bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C]" 
            : "border-gray-600 text-gray-300 hover:bg-gray-700"
          }
          onClick={() => onGridSizeChange(size)}
          disabled={size > totalCameras}
        >
          <Icon className="w-4 h-4 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );
};

// Main Camera Grid Component
export const CameraGrid: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [streamingStates, setStreamingStates] = useState<Record<number, boolean>>({});
  const [gridSize, setGridSize] = useState(4);
  const [loading, setLoading] = useState(true);

  // Load cameras on mount
  useEffect(() => {
    const loadCameras = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/cameras');
        if (response.ok) {
          const apiCameras = await response.json();
          setCameras(apiCameras.length > 0 ? apiCameras : mockCameras);
        } else {
          // Fallback to mock data
          setCameras(mockCameras);
        }
      } catch (error) {
        console.log('Using mock data for development');
        setCameras(mockCameras);
      } finally {
        setLoading(false);
      }
    };

    loadCameras();
  }, []);

  const toggleStream = (cameraId: number) => {
    setStreamingStates(prev => ({
      ...prev,
      [cameraId]: !prev[cameraId]
    }));
  };

  const displayedCameras = cameras.slice(0, gridSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D18B47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-semibold">Loading Camera System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
              🎥 CAMERA MONITORING SYSTEM
            </h1>
            <p className="text-gray-400 mt-1">
              Live security camera feeds • {cameras.filter(c => c.status === 'online').length} of {cameras.length} cameras online
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </div>
        </div>
        
        <GridControls 
          gridSize={gridSize} 
          onGridSizeChange={setGridSize}
          totalCameras={cameras.length}
        />
      </div>

      {/* Camera Grid */}
      <div className={`grid gap-4 ${
        gridSize === 1 ? 'grid-cols-1' :
        gridSize <= 4 ? 'grid-cols-1 md:grid-cols-2' :
        gridSize <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        gridSize <= 9 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {displayedCameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            isStreaming={streamingStates[camera.id] || false}
            onToggleStream={() => toggleStream(camera.id)}
          />
        ))}
      </div>

      {/* Footer Status */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">System Operational</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="text-gray-400 text-sm">
            Displaying {displayedCameras.length} of {cameras.length} cameras
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraGrid;
