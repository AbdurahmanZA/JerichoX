import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Activity, AlertTriangle, Clock } from 'lucide-react';

interface SystemStatusBoxProps {
  systemStatus: {
    uptime: string;
    activeStreams: number;
    totalEvents: number;
    hikvisionConnections: number;
  };
}

const SystemStatusBox: React.FC<SystemStatusBoxProps> = ({ systemStatus }) => {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-jericho-accent" />
            <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">
              Uptime
            </span>
          </div>
          <span className="text-xs text-white font-bold">
            {systemStatus.uptime}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-jericho-accent" />
            <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">
              Active Streams
            </span>
          </div>
          <span className="text-xs text-white font-bold">
            {systemStatus.activeStreams}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-jericho-accent" />
            <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">
              Events
            </span>
          </div>
          <span className="text-xs text-white font-bold">
            {systemStatus.totalEvents}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-jericho-accent" />
            <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">
              HikVision
            </span>
          </div>
          <span className="text-xs text-white font-bold">
            {systemStatus.hikvisionConnections}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusBox;
