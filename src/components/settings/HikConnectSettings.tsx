// Enhanced HikConnect Settings Component with Real Credential Form
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Monitor,
  Globe,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface HikConnectAccount {
  id: string;
  account_name: string;
  access_key: string;
  secret_key?: string;
  region: 'global' | 'eu' | 'asia' | 'us';
  api_url: string;
  auth_type: 'ak_sk';
  is_active: boolean;
  last_sync: string;
  created_at: string;
  device_count?: number;
}

interface HikConnectDevice {
  device_serial: string;
  device_name: string;
  device_type: string;
  device_model: string;
  status: number;
  channel_number: number;
  manufacturer: string;
  account_id: string;
}

interface HikConnectStats {
  total_accounts: string;
  active_accounts: string;
  total_devices: string;
  online_devices: string;
  integrated_cameras: string;
  display_selected_cameras: string;
  last_sync: string;
}

export const HikConnectSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<HikConnectAccount[]>([]);
  const [devices, setDevices] = useState<HikConnectDevice[]>([]);
  const [stats, setStats] = useState<HikConnectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form state for adding new account
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accessKey: '',
    secretKey: '',
    region: 'global' as 'global' | 'eu' | 'asia' | 'us'
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testingCredentials, setTestingCredentials] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('jericho_token') || '';
  };

  // API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(`/api/hikconnect${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  };

  // Load data
  const loadAccounts = async () => {
    try {
      const data = await apiCall('/accounts');
      setAccounts(data);
    } catch (err) {
      setError(`Failed to load accounts: ${err.message}`);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiCall('/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadDevices = async (accountId: string) => {
    try {
      const data = await apiCall(`/devices/account/${accountId}`);
      setDevices(data);
    } catch (err) {
      setError(`Failed to load devices: ${err.message}`);
    }
  };

  // Test credentials before adding
  const testCredentials = async () => {
    if (!formData.accessKey || !formData.secretKey) {
      setError('Please enter both Access Key and Secret Key');
      return;
    }

    setTestingCredentials(true);
    setError('');

    try {
      const result = await apiCall('/test-credentials', {
        method: 'POST',
        body: JSON.stringify({
          accessKey: formData.accessKey,
          secretKey: formData.secretKey,
          region: formData.region
        })
      });

      if (result.success) {
        setSuccess(`✅ Credentials valid! Found ${result.deviceCount || 0} devices.`);
      } else {
        setError('❌ Invalid credentials or connection failed');
      }
    } catch (err) {
      setError(`❌ Credential test failed: ${err.message}`);
    } finally {
      setTestingCredentials(false);
    }
  };

  // Add new account
  const addAccount = async () => {
    if (!formData.accountName || !formData.accessKey || !formData.secretKey) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          accountName: formData.accountName,
          accessKey: formData.accessKey,
          secretKey: formData.secretKey,
          region: formData.region,
          apiUrl: getApiUrlForRegion(formData.region)
        })
      });

      setSuccess('Account added successfully!');
      setFormData({ accountName: '', accessKey: '', secretKey: '', region: 'global' });
      setShowAddForm(false);
      await loadAccounts();
      await loadStats();
    } catch (err) {
      setError(`Failed to add account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sync devices for account
  const syncDevices = async (accountId: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiCall(`/devices/sync/${accountId}`, {
        method: 'POST'
      });

      setSuccess(`Synced ${result.devices?.length || 0} devices successfully!`);
      await loadStats();
      await loadDevices(accountId);
    } catch (err) {
      setError(`Failed to sync devices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    setLoading(true);
    try {
      await apiCall(`/accounts/${accountId}`, { method: 'DELETE' });
      setSuccess('Account deleted successfully!');
      await loadAccounts();
      await loadStats();
    } catch (err) {
      setError(`Failed to delete account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getApiUrlForRegion = (region: string) => {
    const urls = {
      global: 'https://api.hik-connect.com',
      eu: 'https://api-eu.hik-connect.com',
      us: 'https://api-us.hik-connect.com',
      asia: 'https://api-asia.hik-connect.com'
    };
    return urls[region] || urls.global;
  };

  const getRegionFlag = (region: string) => {
    const flags = {
      global: '🌍',
      eu: '🇪🇺',
      us: '🇺🇸',
      asia: '🌏'
    };
    return flags[region] || '🌍';
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Load initial data
  useEffect(() => {
    loadAccounts();
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wide">HikConnect Integration</h2>
          <p className="text-gray-400 mt-1">
            Connect your HikConnect accounts to stream cameras directly
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Real Account
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-500 bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-900/20">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-[#D18B47] data-[state=active]:text-[#2D5A5C]">
            Accounts ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-[#D18B47] data-[state=active]:text-[#2D5A5C]">
            Devices ({stats?.total_devices || 0})
          </TabsTrigger>
          <TabsTrigger value="cameras" className="data-[state=active]:bg-[#D18B47] data-[state=active]:text-[#2D5A5C]">
            Cameras ({stats?.integrated_cameras || 0})
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-[#D18B47] data-[state=active]:text-[#2D5A5C]">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Add Account Form */}
          {showAddForm && (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#D18B47]" />
                  Add Your Real HikConnect Account
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Enter your actual HikConnect API credentials to connect real cameras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName" className="text-white">Account Name</Label>
                    <Input
                      id="accountName"
                      placeholder="e.g., Office Security System"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region" className="text-white">Region</Label>
                    <select
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as any }))}
                      className="w-full h-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="global">🌍 Global (api.hik-connect.com)</option>
                      <option value="eu">🇪🇺 Europe (api-eu.hik-connect.com)</option>
                      <option value="us">🇺🇸 United States (api-us.hik-connect.com)</option>
                      <option value="asia">🌏 Asia (api-asia.hik-connect.com)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="accessKey" className="text-white">Access Key (AK)</Label>
                  <Input
                    id="accessKey"
                    placeholder="Your HikConnect Access Key"
                    value={formData.accessKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessKey: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="secretKey" className="text-white">Secret Key (SK)</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showSecretKey ? "text" : "password"}
                      placeholder="Your HikConnect Secret Key"
                      value={formData.secretKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      {showSecretKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={testCredentials}
                    disabled={testingCredentials || !formData.accessKey || !formData.secretKey}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    {testingCredentials ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Test Credentials
                  </Button>
                  
                  <Button
                    onClick={addAccount}
                    disabled={loading || !formData.accountName || !formData.accessKey || !formData.secretKey}
                    className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Account
                  </Button>

                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Accounts */}
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D18B47] rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-[#2D5A5C]" />
                      </div>
                      <div>
                        <CardTitle className="text-white">
                          {getRegionFlag(account.region)} {account.account_name}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {account.api_url} • {account.device_count || 0} devices
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={account.is_active ? "default" : "destructive"}
                        className={account.is_active ? "bg-green-600" : "bg-red-600"}
                      >
                        {account.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Access Key:</span>
                        <p className="text-white font-mono">{account.access_key}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Sync:</span>
                        <p className="text-white">{new Date(account.last_sync).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => syncDevices(account.id)}
                        disabled={loading}
                        size="sm"
                        className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C]"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Sync Devices
                      </Button>
                      
                      <Button
                        onClick={() => deleteAccount(account.id)}
                        disabled={loading}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {accounts.length === 0 && !showAddForm && (
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Camera className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Accounts Connected</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Add your first HikConnect account to start streaming cameras
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Account
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card key={device.device_serial} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-[#D18B47]" />
                    {device.device_name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {device.device_model} • {device.channel_number} channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial:</span>
                      <span className="text-white font-mono">{device.device_serial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant={device.status === 1 ? "default" : "destructive"}>
                        {device.status === 1 ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{device.device_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {devices.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Monitor className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Devices Found</h3>
                <p className="text-gray-400 text-center">
                  Add an account and sync devices to see your cameras here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cameras" className="space-y-4">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Camera Integration Coming Soon</h3>
              <p className="text-gray-400 text-center">
                Once devices are synced, you'll be able to create cameras from them here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{stats.total_accounts}</div>
                  <div className="text-blue-200 text-sm">Total Accounts</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{stats.online_devices}</div>
                  <div className="text-green-200 text-sm">Online Devices</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{stats.integrated_cameras}</div>
                  <div className="text-purple-200 text-sm">Active Cameras</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{stats.total_devices}</div>
                  <div className="text-orange-200 text-sm">Total Devices</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#D18B47]" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p><strong className="text-[#D18B47]">Step 1:</strong> Obtain your HikConnect API credentials from the Hik-Connect platform</p>
          <p><strong className="text-[#D18B47]">Step 2:</strong> Click "Add Real Account" and enter your credentials</p>
          <p><strong className="text-[#D18B47]">Step 3:</strong> Test your credentials before saving</p>
          <p><strong className="text-[#D18B47]">Step 4:</strong> Sync devices to discover your cameras</p>
          <p><strong className="text-[#D18B47]">Step 5:</strong> Create camera feeds from your devices</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HikConnectSettings;