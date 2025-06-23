// Progressive JPEG Streaming Component for HikConnect cameras
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  Wifi, 
  WifiOff, 
  Maximize2, 
  RotateCw,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';

interface ProgressiveJPEGStreamProps {
  camera: {
    id: number;
    name: string;
    url: string;
    status: string;
    stream_info?: {
      type: string;
      primary_url: string;
      snapshot_url?: string;
      supports_ptz: boolean;
      supports_audio: boolean;
    };
    hikconnect_device_name?: string;
    device_status?: number;
  };
  className?: string;
  intervalMs?: number;
  showControls?: boolean;
}

export const ProgressiveJPEGStream: React.FC<ProgressiveJPEGStreamProps> = ({
  camera,
  className = "",
  intervalMs = 1000,
  showControls = true
}) => {
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Progressive JPEG streaming logic
  useEffect(() => {
    if (isStreaming && camera.stream_info?.snapshot_url) {
      startProgressiveStream();
    } else {
      stopProgressiveStream();
    }

    return () => stopProgressiveStream();
  }, [isStreaming, camera.stream_info?.snapshot_url, intervalMs]);

  const startProgressiveStream = () => {
    stopProgressiveStream(); // Clear any existing interval

    const updateFrame = async () => {
      try {
        // Use snapshot URL with cache busting
        const snapshotUrl = camera.stream_info?.snapshot_url || 
                           `http://localhost:3001/api/cameras/${camera.id}/snapshot`;
        const timestamp = Date.now();
        const frameUrl = `${snapshotUrl}?t=${timestamp}`;

        setCurrentFrame(frameUrl);
        setFrameCount(prev => prev + 1);
        setError('');
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to update frame:', err);
        setError('Stream error');
      }
    };

    // Start with immediate frame
    updateFrame();

    // Set up interval for continuous updates
    intervalRef.current = setInterval(updateFrame, intervalMs);
  };

  const stopProgressiveStream = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError('');
  };

  const handleImageError = () => {
    setError('Failed to load frame');
    setIsLoading(false);
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const refreshFrame = () => {
    if (camera.stream_info?.snapshot_url) {
      const timestamp = Date.now();
      const frameUrl = `${camera.stream_info.snapshot_url}?t=${timestamp}`;
      setCurrentFrame(frameUrl);
      setFrameCount(prev => prev + 1);
    }
  };

  const getStatusColor = () => {
    if (camera.device_status === 1 || camera.status === 'online') return 'bg-green-500';
    if (camera.device_status === 0 || camera.status === 'offline') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (isStreaming) return 'Streaming';
    if (camera.device_status === 1 || camera.status === 'online') return 'Online';
    if (camera.device_status === 0 || camera.status === 'offline') return 'Offline';
    return 'Unknown';
  };

  return (
    <Card className={`relative overflow-hidden bg-gray-900 ${className}`}>
      <CardContent className="p-0 relative">
        {/* Video Display Area */}
        <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-red-400 z-10">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-sm">Stream Error</span>
              <span className="text-xs text-gray-500">{error}</span>
            </div>
          )}
          
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400 z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jericho-accent mb-2"></div>
                <span className="text-sm">Loading camera feed...</span>
              </div>
            </div>
          )}

          {currentFrame && (
            <img
              ref={imgRef}
              src={currentFrame}
              alt={`Camera: ${camera.name}`}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          {/* Status Overlay */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge className={`${getStatusColor()} text-white border-0`}>
              {getStatusText()}
            </Badge>
            {isStreaming && (
              <Badge className="bg-jericho-accent text-jericho-main border-0">
                Live
              </Badge>
            )}
          </div>

          {/* Frame Counter */}
          {isStreaming && frameCount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-black/50 text-white border-gray-600">
                {frameCount} frames
              </Badge>
            </div>
          )}

          {/* Camera Capabilities */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {camera.stream_info?.supports_ptz && (
              <Badge variant="outline" className="bg-black/50 text-white border-gray-600 text-xs">
                PTZ
              </Badge>
            )}
            {camera.stream_info?.supports_audio && (
              <Badge variant="outline" className="bg-black/50 text-white border-gray-600 text-xs">
                Audio
              </Badge>
            )}
            {camera.stream_info?.type === 'hikconnect' && (
              <Badge variant="outline" className="bg-jericho-primary text-white border-jericho-accent text-xs">
                HikConnect
              </Badge>
            )}
          </div>
        </div>

        {/* Camera Info */}
        <div className="p-3 bg-gray-900">
          <h3 className="text-white font-medium text-sm mb-1 jericho-heading">
            {camera.name}
          </h3>
          {camera.hikconnect_device_name && (
            <p className="text-gray-400 text-xs mb-2">
              Device: {camera.hikconnect_device_name}
            </p>
          )}
          
          {/* Controls */}
          {showControls && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={toggleStreaming}
                className={isStreaming ? "jericho-btn-accent" : "jericho-btn-primary"}
              >
                {isStreaming ? (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Stream
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={refreshFrame}
                disabled={isStreaming}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <RotateCw className="w-3 h-3" />
              </Button>
              
              {camera.stream_info?.supports_ptz && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveJPEGStream;
