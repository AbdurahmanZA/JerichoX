string) => void;
}> = ({ cameras, layout, activeCameras, onCameraToggle, onError }) => {
  const getGridClasses = (layout: GridLayout): string => {
    switch (layout) {
      case 1: return 'grid-cols-1 grid-rows-1';
      case 2: return 'grid-cols-2 grid-rows-1';
      case 4: return 'grid-cols-2 grid-rows-2';
      case 6: return 'grid-cols-3 grid-rows-2';
      case 9: return 'grid-cols-3 grid-rows-3';
      case 12: return 'grid-cols-4 grid-rows-3';
      default: return 'grid-cols-2 grid-rows-2';
    }
  };

  const maxCameras = layout;
  const displayCameras = cameras.slice(0, maxCameras);

  return (
    <div className={cn(
      "grid gap-2 h-full w-full p-4",
      getGridClasses(layout)
    )}>
      {Array.from({ length: maxCameras }).map((_, index) => {
        const camera = displayCameras[index];
        
        if (!camera) {
          return (
            <Card key={index} className="bg-gray-900 border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 text-center">
                <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Add Camera</p>
              </CardContent>
            </Card>
          );
        }

        const isActive = activeCameras.includes(camera.id);

        return (
          <Card 
            key={camera.id} 
            className="bg-gray-900 border-gray-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-jericho-accent transition-all"
            onClick={() => onCameraToggle(camera.id)}
          >
            <div className="aspect-video">
              <ProgressiveStream
                camera={camera}
                isActive={isActive}
                onError={onError}
                className="w-full h-full"
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Add Camera Dialog
const AddCameraDialog: React.FC<{
  onAdd: (camera: Omit<Camera, 'id' | 'created_at' | 'updated_at'>) => void;
}> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ip' as Camera['type'],
    url: '',
    username: '',
    password: '',
    location: '',
    zone: '',
    has_audio: false,
    has_ptz: false,
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.url || !formData.location || !formData.zone) {
      return;
    }
    
    const newCamera = {
      ...formData,
      status: 'connecting' as const,
      is_recording: false,
      capabilities: [
        ...(formData.has_audio ? ['audio'] : []),
        ...(formData.has_ptz ? ['ptz'] : []),
      ],
    };

    onAdd(newCamera);
    setFormData({
      name: '',
      type: 'ip',
      url: '',
      username: '',
      password: '',
      location: '',
      zone: '',
      has_audio: false,
      has_ptz: false,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="jericho-btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="jericho-brand text-jericho-primary">Add New Camera</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Camera Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Front Entrance Camera"
            />
          </div>

          <div>
            <Label htmlFor="type">Camera Type</Label>
            <Select value={formData.type} onValueChange={(value: Camera['type']) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Camera</SelectItem>
                <SelectItem value="hikvision">Hikvision</SelectItem>
                <SelectItem value="rtsp">RTSP Stream</SelectItem>
                <SelectItem value="nvr">NVR Channel</SelectItem>
                <SelectItem value="dvr">DVR Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="url">Camera URL/RTSP Stream</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="rtsp://192.168.1.100:554/stream"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Building A"
              />
            </div>
            <div>
              <Label htmlFor="zone">Zone</Label>
              <Input
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="Entrance"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="has_audio"
                checked={formData.has_audio}
                onCheckedChange={(checked) => setFormData({ ...formData, has_audio: checked })}
              />
              <Label htmlFor="has_audio">Audio Support</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="has_ptz"
                checked={formData.has_ptz}
                onCheckedChange={(checked) => setFormData({ ...formData, has_ptz: checked })}
              />
              <Label htmlFor="has_ptz">PTZ Controls</Label>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full jericho-btn-accent">
            Add Camera
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Camera Management System
export default function EnhancedCameraSystem() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [layout, setLayout] = useState<GridLayout>(4);
  const [activeCameras, setActiveCameras] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiService] = useState(() => new CameraApiService());

  // Load cameras from API
  const loadCameras = useCallback(async () => {
    try {
      setLoading(true);
      const cameras = await apiService.getCameras();
      setCameras(cameras);
      
      // Auto-activate first few cameras
      const onlineCameras = cameras.filter(c => c.status === 'online');
      setActiveCameras(onlineCameras.slice(0, layout).map(c => c.id));
    } catch (error) {
      console.error('Failed to load cameras:', error);
      setErrors(prev => [...prev, 'Failed to load cameras from server']);
    } finally {
      setLoading(false);
    }
  }, [apiService, layout]);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  const handleAddCamera = useCallback(async (newCamera: Omit<Camera, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const camera = await apiService.createCamera(newCamera);
      setCameras(prev => [...prev, camera]);
      
      // Auto-activate new camera if there's space
      if (activeCameras.length < layout) {
        setActiveCameras(prev => [...prev, camera.id]);
      }
    } catch (error) {
      console.error('Failed to add camera:', error);
      setErrors(prev => [...prev, 'Failed to add camera']);
    }
  }, [apiService, layout, activeCameras.length]);

  const handleCameraToggle = useCallback((cameraId: string) => {
    setActiveCameras(prev => 
      prev.includes(cameraId) 
        ? prev.filter(id => id !== cameraId)
        : prev.length < layout 
          ? [...prev, cameraId]
          : prev
    );
  }, [layout]);

  const handleError = useCallback((error: string) => {
    setErrors(prev => [...prev, error]);
    setTimeout(() => {
      setErrors(prev => prev.slice(1));
    }, 5000);
  }, []);

  const layoutOptions: { value: GridLayout; label: string }[] = [
    { value: 1, label: '1 Camera' },
    { value: 2, label: '2 Cameras' },
    { value: 4, label: '4 Cameras' },
    { value: 6, label: '6 Cameras' },
    { value: 9, label: '9 Cameras' },
    { value: 12, label: '12 Cameras' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RotateCw className="w-12 h-12 mx-auto mb-4 animate-spin text-jericho-accent" />
          <h2 className="text-xl font-bold mb-2">Loading JerichoX Security Platform</h2>
          <p className="text-gray-400">Connecting to cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="jericho-gradient p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-jericho-accent rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-jericho-primary" />
              </div>
              <h1 className="text-2xl font-bold jericho-brand text-white">JERICHO SECURITY</h1>
            </div>
            <Badge variant="secondary" className="bg-jericho-accent text-jericho-primary">
              Camera Management System v2.0.0
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-white">Layout:</Label>
              <Select value={layout.toString()} onValueChange={(value) => setLayout(parseInt(value) as GridLayout)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AddCameraDialog onAdd={handleAddCamera} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online: {cameras.filter(c => c.status === 'online').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Offline: {cameras.filter(c => c.status === 'offline').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span>Recording: {cameras.filter(c => c.is_recording).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span>Active Views: {activeCameras.length}/{layout}</span>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {errors.length > 0 && (
        <div className="p-4 space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Camera Grid */}
      <div className="flex-1 h-[calc(100vh-200px)]">
        <CameraGrid
          cameras={cameras}
          layout={layout}
          activeCameras={activeCameras}
          onCameraToggle={handleCameraToggle}
          onError={handleError}
        />
      </div>

      {/* Camera List Sidebar */}
      <div className="fixed bottom-4 left-4 right-4">
        <Card className="bg-gray-900/95 backdrop-blur border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-jericho-accent flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Camera Management ({cameras.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cameras.map(camera => (
                <div
                  key={camera.id}
                  className={cn(
                    "p-3 rounded border cursor-pointer transition-all",
                    activeCameras.includes(camera.id) 
                      ? "border-jericho-accent bg-jericho-accent/10" 
                      : "border-gray-600 hover:border-gray-500"
                  )}
                  onClick={() => handleCameraToggle(camera.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{camera.name}</span>
                    <Badge 
                      variant={camera.status === 'online' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {camera.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>{camera.location} - {camera.zone}</div>
                    <div className="flex gap-2">
                      {camera.has_audio && <Badge variant="outline" className="text-xs">Audio</Badge>}
                      {camera.has_ptz && <Badge variant="outline" className="text-xs">PTZ</Badge>}
                      {camera.is_recording && <Badge variant="outline" className="text-xs bg-red-600 text-white">Recording</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
