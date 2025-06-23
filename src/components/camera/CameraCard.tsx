// Enhanced Camera Card with HikConnect Progressive JPEG Streaming
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressiveJPEGStream } from './ProgressiveJPEGStream';
import { 
  Camera, 
  Settings, 
  Trash2, 
  Eye, 
  EyeOff,
  Monitor,
  AlertCircle
} from 'lucide-react';

interface CameraCardProps {
  camera: {
    id: number;
    name: string;
    url: string;
    status: string;
    type: string;
    location?: string;
    manufacturer?: string;
    model?: string;
    capabilities?: string[];
    has_ptz?: boolean;
    has_audio?: boolean;
    hikconnect_device_serial?: string;
    hikconnect_account_name?: string;
    hikconnect_device_name?: string;
    device_status?: number;
    stream_info?: {
      type: string;
      primary_url: string;
      snapshot_url?: string;
      supports_ptz: boolean;
      supports_audio: boolean;
    };
    is_selected?: boolean;
    display_priority?: number;
  };
  onEdit?: (camera: any) => void;
  onDelete?: (cameraId: number) => void;
  onToggleDisplay?: (cameraId: number, isSelected: boolean) => void;
  className?: string;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onEdit,
  onDelete,
  onToggleDisplay,
  className = ""
}) => {
  const [showStream, setShowStream] = useState(false);

  const getTypeColor = () => {
    switch (camera.type) {
      case 'hikconnect': return 'bg-jericho-primary text-white';
      case 'rtsp': return 'bg-blue-500 text-white';
      case 'ip': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = () => {
    if (camera.device_status === 1 || camera.status === 'online') return 'text-green-500';
    if (camera.device_status === 0 || camera.status === 'offline') return 'text-red-500';
    return 'text-yellow-500';
  };

  const handleToggleDisplay = () => {
    if (onToggleDisplay) {
      onToggleDisplay(camera.id, !camera.is_selected);
    }
  };

  const renderCameraContent = () => {
    if (showStream && camera.type === 'hikconnect') {
      return (
        <ProgressiveJPEGStream
          camera={camera}
          className="w-full"
          intervalMs={1000}
          showControls={true}
        />
      );
    }

    // Default view - camera info
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48 bg-gray-900 rounded-lg mb-4">
            <div className="text-center text-gray-400">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Camera Preview</p>
              {camera.type === 'hikconnect' && (
                <Button
                  size="sm"
                  onClick={() => setShowStream(true)}
                  className="mt-2 jericho-btn-primary"
                >
                  Start Stream
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white jericho-heading text-lg">
              {camera.name}
            </CardTitle>
            {camera.location && (
              <p className="text-gray-400 text-sm mt-1">{camera.location}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getTypeColor()}>
              {camera.type.toUpperCase()}
            </Badge>
            
            <div className={`flex items-center gap-1 ${getStatusColor()}`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span className="text-xs">
                {camera.device_status === 1 || camera.status === 'online' ? 'Online' : 
                 camera.device_status === 0 || camera.status === 'offline' ? 'Offline' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Camera Content */}
        {renderCameraContent()}

        {/* Camera Details */}
        <div className="space-y-2">
          {camera.manufacturer && (
            <div className="text-xs text-gray-400">
              <span className="font-medium">Device:</span> {camera.manufacturer} {camera.model}
            </div>
          )}
          
          {camera.hikconnect_device_name && (
            <div className="text-xs text-gray-400">
              <span className="font-medium">HikConnect:</span> {camera.hikconnect_device_name}
            </div>
          )}
          
          {camera.hikconnect_account_name && (
            <div className="text-xs text-gray-400">
              <span className="font-medium">Account:</span> {camera.hikconnect_account_name}
            </div>
          )}

          {/* Capabilities */}
          {(camera.capabilities || camera.has_ptz || camera.has_audio) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {camera.has_ptz && (
                <Badge variant="outline" className="text-xs border-jericho-accent text-jericho-accent">
                  PTZ
                </Badge>
              )}
              {camera.has_audio && (
                <Badge variant="outline" className="text-xs border-jericho-accent text-jericho-accent">
                  Audio
                </Badge>
              )}
              {camera.capabilities?.includes('Motion Detection') && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                  Motion
                </Badge>
              )}
              {camera.capabilities?.includes('Night Vision') && (
                <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                  Night Vision
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {onToggleDisplay && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleDisplay}
              className={`border-gray-600 ${camera.is_selected ? 'text-green-400 border-green-600' : 'text-gray-400'}`}
            >
              {camera.is_selected ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hidden
                </>
              )}
            </Button>
          )}
          
          {showStream && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStream(false)}
              className="border-gray-600 text-gray-400"
            >
              <Monitor className="w-3 h-3 mr-1" />
              Info View
            </Button>
          )}
          
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(camera)}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(camera.id)}
              className="border-red-600 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCard;
