import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Play, Square, Image, Edit2, Check, X, AlertTriangle } from "lucide-react";
import { CameraState } from "@/hooks/useCameraState";
import { ResolutionSelector, ResolutionProfile } from "./ResolutionSelector";
import { VideoPlayer } from "./VideoPlayer";

interface CameraTileProps {
  cameraId: number;
  url: string;
  name: string;
  isActive: boolean;
  isEditing: boolean;
  isEditingName: boolean;
  cameraState: CameraState;
  tempUrl: string;
  tempName: string;
  setEditingCamera: (id: number | null) => void;
  setEditingName: (id: number | null) => void;
  setTempUrl: (url: string) => void;
  setTempName: (name: string) => void;
  handleUrlSubmit: (id: number) => void;
  handleNameSubmit: (id: number) => void;
  onSnapshot: (id: number) => void;
  startStream: (id: number, url: string) => void;
  stopStream: (id: number) => void;
  resetCamera: (id: number) => void;
  MAX_RETRIES: number;
  onLog?: (msg: string) => void;
  videoRefs: React.MutableRefObject<Record<number, HTMLVideoElement | null>>;
  updateCameraState: (id: number, updates: Partial<CameraState>) => void;
}

export const CameraTile: React.FC<CameraTileProps> = ({
  cameraId,
  url,
  name,
  isActive,
  isEditing,
  isEditingName,
  cameraState,
  tempUrl,
  tempName,
  setEditingCamera,
  setEditingName,
  setTempUrl,
  setTempName,
  handleUrlSubmit,
  handleNameSubmit,
  onSnapshot,
  startStream,
  stopStream,
  resetCamera,
  MAX_RETRIES,
  onLog,
  videoRefs,
  updateCameraState,
}) => {
  const [resolutionProfile, setResolutionProfile] = React.useState<ResolutionProfile>('medium');

  const handleResolutionChange = (profile: ResolutionProfile) => {
    setResolutionProfile(profile);
    localStorage.setItem(`camera-${cameraId}-resolution`, profile);
    
    if (isActive && url) {
      onLog?.(`Switching Camera ${cameraId} to ${profile} quality`);
      stopStream(cameraId);
      setTimeout(() => {
        startStream(cameraId, url);
      }, 500);
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem(`camera-${cameraId}-resolution`) as ResolutionProfile;
    if (saved && ['low', 'medium', 'high'].includes(saved)) {
      setResolutionProfile(saved);
    }
  }, [cameraId]);

  const getStatusColor = () => {
    if (isActive && (cameraState.hlsAvailable || cameraState.connectionType === 'webrtc')) return "status-indicator-online";
    if (isActive && !cameraState.hlsAvailable) return "status-indicator-connecting";
    switch (cameraState.connectionStatus) {
      case "connecting":
        return "status-indicator-connecting";
      case "failed":
        return "status-indicator-offline";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    if (isActive && cameraState.connectionType === 'webrtc') return "Live (WebRTC)";
    if (isActive && cameraState.hlsAvailable) return "Live (HLS)";
    if (isActive && !cameraState.hlsAvailable) return "Converting...";
    switch (cameraState.connectionStatus) {
      case "connecting": return "Connecting...";
      case "failed": return `Failed (${cameraState.retryCount}/${MAX_RETRIES})`;
      default: return "Stopped";
    }
  };

  return (
    <div
      key={cameraId}
      className="relative camera-tile-professional rounded-lg overflow-hidden flex flex-col group"
    >
      {/* Professional Camera Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-600">
        <div className="flex items-center space-x-2 flex-1">
          <Camera className="w-4 h-4 text-jericho-accent" />
          {isEditingName ? (
            <div className="flex items-center space-x-1 flex-1">
              <Input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="h-6 text-xs py-1 px-2 bg-slate-700 border-slate-600 text-white"
                placeholder="Camera name"
                onKeyPress={e => e.key === "Enter" && handleNameSubmit(cameraId)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNameSubmit(cameraId)}
                className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingName(null);
                  setTempName("");
                }}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-sm font-medium text-white truncate uppercase tracking-wide">
                {name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingName(cameraId);
                  setTempName(name);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 text-jericho-accent"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wide">
              {getStatusText()}
            </span>
          </div>
        </div>
        
        {/* Professional Control Buttons */}
        <div className="flex space-x-1">
          <ResolutionSelector
            currentProfile={resolutionProfile}
            onProfileChange={handleResolutionChange}
            disabled={!url}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSnapshot(cameraId)}
            disabled={!isActive}
            className="h-6 w-6 p-0 text-jericho-accent hover:text-jericho-light hover:bg-slate-700"
            title="Capture Snapshot"
          >
            <Image className="w-3 h-3" />
          </Button>
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => stopStream(cameraId)}
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-slate-700"
              title="Stop Stream"
            >
              <Square className="w-3 h-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => url && startStream(cameraId, url)}
              disabled={!url || cameraState.connectionStatus === "connecting"}
              className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-slate-700"
              title="Start Stream"
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
          {cameraState.retryCount >= MAX_RETRIES && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetCamera(cameraId)}
              className="h-6 w-6 p-0 text-orange-400 hover:text-orange-300 hover:bg-slate-700"
              title="Reset camera (exceeded max retries)"
            >
              <AlertTriangle className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Professional Video Area */}
      <div className="flex-1 relative group">
        {isActive ? (
          <VideoPlayer
            cameraId={cameraId}
            isActive={isActive}
            onLog={onLog}
            updateCameraState={updateCameraState}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-sm text-slate-300 font-medium">
                {cameraState.connectionStatus === "failed" && cameraState.lastError
                  ? `Error: ${cameraState.lastError}`
                  : url
                  ? `Stream ${cameraState.connectionStatus}`
                  : "No URL Set"}
              </p>
              {cameraState.retryCount >= MAX_RETRIES && (
                <p className="text-xs text-orange-400 mt-2 font-medium">
                  Max retries reached. Click ⚠️ to reset.
                </p>
              )}
              {isActive && !cameraState.hlsAvailable && (
                <p className="text-xs text-yellow-400 mt-2 font-medium">
                  FFmpeg processing RTSP stream...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional URL Input */}
      <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-600">
        {isEditing ? (
          <div className="flex space-x-2">
            <Input
              value={tempUrl}
              onChange={e => setTempUrl(e.target.value)}
              placeholder="rtsp://username:password@ip:port/path"
              className="text-xs bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              onKeyPress={e => e.key === "Enter" && handleUrlSubmit(cameraId)}
              autoFocus
            />
            <Button 
              size="sm" 
              onClick={() => handleUrlSubmit(cameraId)} 
              className="px-3 jericho-btn-accent"
            >
              Save
            </Button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingCamera(cameraId);
              setTempUrl(url || "");
            }}
            className="w-full text-left text-xs text-slate-400 hover:text-jericho-accent truncate transition-colors duration-200 p-1 rounded hover:bg-slate-700"
          >
            {url || "Click to set RTSP URL"}
          </button>
        )}
      </div>
    </div>
  );
};
