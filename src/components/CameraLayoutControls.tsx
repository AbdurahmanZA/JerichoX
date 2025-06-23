import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Grid3X3, Grid2X2, Maximize } from 'lucide-react';

interface CameraLayoutControlsProps {
  layout: number;
  isFullscreen: boolean;
  onLayoutChange: (layout: number) => void;
  onToggleFullscreen: () => void;
}

const CameraLayoutControls: React.FC<CameraLayoutControlsProps> = ({
  layout,
  isFullscreen,
  onLayoutChange,
  onToggleFullscreen
}) => {
  const layouts = [
    { value: 1, label: '1x1', icon: Monitor },
    { value: 4, label: '2x2', icon: Grid2X2 },
    { value: 6, label: '2x3', icon: Grid3X3 },
    { value: 9, label: '3x3', icon: Grid3X3 },
    { value: 12, label: '3x4', icon: Grid3X3 }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {layouts.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={layout === value ? "default" : "outline"}
            size="sm"
            onClick={() => onLayoutChange(value)}
            className={`${layout === value ? 'jericho-btn-primary' : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'} text-xs`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {label}
          </Button>
        ))}
        <Button
          variant={isFullscreen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFullscreen}
          className={`${isFullscreen ? 'jericho-btn-accent' : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'} text-xs col-span-1`}
        >
          <Maximize className="w-3 h-3 mr-1" />
          Full
        </Button>
      </div>
    </div>
  );
};

export default CameraLayoutControls;
