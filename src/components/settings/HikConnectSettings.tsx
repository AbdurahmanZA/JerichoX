import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Wifi, 
  WifiOff,
  Eye,
  EyeOff,
  AlertTriangle,
  Camera,
  Monitor
} from 'lucide-react';

=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Camera, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Network,
  Database,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

// Types
>>>>>>> df8831273c93b9494cd2c830715464402580136f
interface HikConnectAccount {
  id: string;
  account_name: string;
  access_key: string;
  secret_key?: string;
  region: 'global' | 'eu' | 'asia' | 'us';
  api_url: string;
<<<<<<< HEAD
  auth_type: 'ak_sk' | 'oauth';
=======
  auth_type: 'ak_sk';
>>>>>>> df8831273c93b9494cd2c830715464402580136f
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
<<<<<<< HEAD
  camera_count?: number;
}

export const HikConnectSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<HikConnectAccount[]>([]);
  const [devices, setDevices] = useState<HikConnectDevice[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>('');

  const [newAccount, setNewAccount] = useState({
=======
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

// API Service
class HikConnectService {
  private baseUrl = '/api/hikconnect';
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('jericho_token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getAccounts(): Promise<HikConnectAccount[]> {
    return this.request<HikConnectAccount[]>('/accounts');
  }

  async createAccount(data: Omit<HikConnectAccount, 'id' | 'created_at' | 'last_sync' | 'device_count'>): Promise<HikConnectAccount> {
    return this.request<HikConnectAccount>('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        accountName: data.account_name,
        accessKey: data.access_key,
        secretKey: data.secret_key,
        region: data.region,
        apiUrl: data.api_url,
      }),
    });
  }

  async deleteAccount(accountId: string): Promise<void> {
    return this.request<void>(`/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  async syncDevices(accountId: string): Promise<{ message: string; devices: HikConnectDevice[]; total: number }> {
    return this.request<{ message: string; devices: HikConnectDevice[]; total: number }>(`/devices/sync/${accountId}`, {
      method: 'POST',
    });
  }

  async getDevices(accountId: string): Promise<HikConnectDevice[]> {
    return this.request<HikConnectDevice[]>(`/devices/account/${accountId}`);
  }

  async testCredentials(credentials: { accessKey: string; secretKey: string; region: string }): Promise<{ success: boolean; message: string; deviceCount?: number }> {
    return this.request<{ success: boolean; message: string; deviceCount?: number }>('/test-credentials', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getStats(): Promise<HikConnectStats> {
    return this.request<HikConnectStats>('/stats');
  }

  async addCamera(data: {
    deviceSerial: string;
    accountId: string;
    channelNo: number;
    name: string;
    location: string;
    isSelected: boolean;
  }): Promise<{ message: string; camera: any }> {
    return this.request<{ message: string; camera: any }>('/cameras/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Main Component
export const HikConnectSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<HikConnectAccount[]>([]);
  const [devices, setDevices] = useState<HikConnectDevice[]>([]);
  const [stats, setStats] = useState<HikConnectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Form states
  const [formData, setFormData] = useState({
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    accountName: '',
    accessKey: '',
    secretKey: '',
    region: 'global' as const,
<<<<<<< HEAD
    apiUrl: 'https://api.hik-connect.com'
  });

  // Load accounts with timeout and error handling
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/hikconnect/accounts', {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        setConnectionStatus({});
      } else {
        throw new Error(`Failed to load accounts: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout - please check your connection');
      } else {
        setError('Failed to load accounts. Using offline mode.');
      }
      // Fallback to empty accounts for now
      setAccounts([]);
=======
  });

  const hikService = new HikConnectService();

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      clearMessages();
      
      const [accountsData, statsData] = await Promise.all([
        hikService.getAccounts(),
        hikService.getStats(),
      ]);
      
      setAccounts(accountsData);
      setStats(statsData);
      
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, clearMessages]);

  const loadDevices = useCallback(async (accountId: string) => {
    try {
      setLoading(true);
      const devicesData = await hikService.getDevices(accountId);
      setDevices(devicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    } finally {
      setLoading(false);
    }
  }, []);

<<<<<<< HEAD
  // Load account devices with timeout
  const loadAccountDevices = useCallback(async (accountId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/hikconnect/devices/account/${accountId}`, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      } else {
        throw new Error(`Failed to load devices: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error loading devices:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout - please check your connection');
      } else {
        setError('Failed to load devices');
      }
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Load devices when account changes
  useEffect(() => {
    if (selectedAccount) {
      loadAccountDevices(selectedAccount);
    }
  }, [selectedAccount, loadAccountDevices]);

  const addAccount = async () => {
    try {
      setLoading(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/hikconnect/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        signal: controller.signal,
        body: JSON.stringify(newAccount)
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setShowAddDialog(false);
        setNewAccount({
          accountName: '',
          accessKey: '',
          secretKey: '',
          region: 'global',
          apiUrl: 'https://api.hik-connect.com'
        });
        await loadAccounts();
      } else {
        const error = await response.json();
        setError(`Error: ${error.error || 'Failed to add account'}`);
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout - please check your connection');
      } else {
        setError('Failed to add account');
      }
=======
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedAccount) {
      loadDevices(selectedAccount);
    }
  }, [selectedAccount, loadDevices]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName || !formData.accessKey || !formData.secretKey) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      // Test credentials first
      const testResult = await hikService.testCredentials({
        accessKey: formData.accessKey,
        secretKey: formData.secretKey,
        region: formData.region,
      });

      if (!testResult.success) {
        setError(testResult.message);
        return;
      }

      // Create account
      await hikService.createAccount({
        account_name: formData.accountName,
        access_key: formData.accessKey,
        secret_key: formData.secretKey,
        region: formData.region,
        api_url: getApiUrl(formData.region),
        auth_type: 'ak_sk',
        is_active: true,
      });

      setSuccess(`Account "${formData.accountName}" created successfully with ${testResult.deviceCount} devices`);
      setFormData({ accountName: '', accessKey: '', secretKey: '', region: 'global' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const deleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/hikconnect/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      if (response.ok) {
        await loadAccounts();
        if (selectedAccount === accountId) {
          setSelectedAccount('');
          setDevices([]);
        }
      } else {
        setError('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
=======
  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete account "${accountName}"? This will also remove all associated devices and cameras.`)) {
      return;
    }

    try {
      setLoading(true);
      clearMessages();
      await hikService.deleteAccount(accountId);
      setSuccess(`Account "${accountName}" deleted successfully`);
      await loadData();
      if (selectedAccount === accountId) {
        setSelectedAccount('');
        setDevices([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const syncDevices = async (accountId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for sync
      
      const response = await fetch(`/api/hikconnect/devices/sync/${accountId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        alert(`Synced ${result.devices?.length || 0} devices successfully`);
        if (selectedAccount === accountId) {
          await loadAccountDevices(accountId);
        }
      } else {
        const error = await response.json();
        setError(`Sync failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error syncing devices:', error);
      if (error.name === 'AbortError') {
        setError('Sync timeout - this may take longer for accounts with many devices');
      } else {
        setError('Failed to sync devices');
      }
=======
  const handleSyncDevices = async (accountId: string) => {
    try {
      setLoading(true);
      clearMessages();
      const result = await hikService.syncDevices(accountId);
      setSuccess(result.message);
      await loadData();
      await loadDevices(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync devices');
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const addCameraFromDevice = async (device: HikConnectDevice) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/hikconnect/cameras/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          deviceSerial: device.device_serial,
          accountId: device.account_id,
          channelNo: 1,
          name: device.device_name,
          location: 'Auto-added',
          isSelected: true
        })
      });
      
      if (response.ok) {
        alert(`Camera "${device.device_name}" added successfully`);
        // Refresh the device list
        if (selectedAccount) {
          await loadAccountDevices(selectedAccount);
        }
      } else {
        const error = await response.json();
        setError(`Failed to add camera: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding camera:', error);
      setError('Failed to add camera');
=======
  const handleAddCamera = async (device: HikConnectDevice) => {
    try {
      setLoading(true);
      clearMessages();
      
      const result = await hikService.addCamera({
        deviceSerial: device.device_serial,
        accountId: device.account_id,
        channelNo: 1,
        name: device.device_name,
        location: 'Unknown',
        isSelected: true,
      });
      
      setSuccess(result.message);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add camera');
>>>>>>> df8831273c93b9494cd2c830715464402580136f
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const getApiUrl = (region: string): string => {
    const urls = {
      global: 'https://api.hik-connect.com',
      eu: 'https://api-eu.hik-connect.com',
      us: 'https://api-us.hik-connect.com',
      asia: 'https://api-asia.hik-connect.com',
    };
    return urls[region as keyof typeof urls] || urls.global;
  };

  const toggleShowSecret = (accountId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getRegionFlag = (region: string): string => {
    const flags = {
      global: '🌍',
      eu: '🇪🇺',
      us: '🇺🇸',
      asia: '🌏',
    };
    return flags[region as keyof typeof flags] || '🌍';
  };

>>>>>>> df8831273c93b9494cd2c830715464402580136f
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h3 className="text-2xl font-bold text-white uppercase tracking-wide">HikConnect Integration</h3>
          <p className="text-gray-400 mt-1">Manage your HikConnect accounts and sync cameras</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add HikConnect Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your HikConnect credentials to sync cameras
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Office Cameras"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="accessKey">Access Key</Label>
                <Input
                  id="accessKey"
                  value={newAccount.accessKey}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, accessKey: e.target.value }))}
                  placeholder="Your HikConnect Access Key"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showPassword ? "text" : "password"}
                    value={newAccount.secretKey}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Your HikConnect Secret Key"
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={newAccount.region} onValueChange={(value: any) => setNewAccount(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="asia">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={addAccount}
                disabled={loading || !newAccount.accountName || !newAccount.accessKey || !newAccount.secretKey}
                className="bg-[#D18B47] hover:bg-[#C17A3A] text-[#2D5A5C] font-semibold"
              >
                {loading ? 'Adding...' : 'Add Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D18B47]"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="accounts" className="text-white data-[state=active]:bg-[#2D5A5C]">
            Accounts ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="devices" className="text-white data-[state=active]:bg-[#2D5A5C]">
            Devices ({devices.length})
          </TabsTrigger>
          <TabsTrigger value="cameras" className="text-white data-[state=active]:bg-[#2D5A5C]">
            Add Cameras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">HikConnect Accounts</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your HikConnect account connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No HikConnect accounts configured</p>
                  <p className="text-gray-500 text-sm">Add an account to start syncing your cameras</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${account.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <div>
                          <h4 className="text-white font-semibold">{account.account_name}</h4>
                          <p className="text-gray-400 text-sm">
                            {account.region.toUpperCase()} • {account.device_count || 0} devices
                          </p>
                          <p className="text-gray-500 text-xs">
                            Last sync: {new Date(account.last_sync).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncDevices(account.id)}
                          disabled={loading}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account.id);
                            loadAccountDevices(account.id);
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Monitor className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAccount(account.id)}
                          disabled={loading}
=======
          <h2 className="jericho-heading text-2xl font-bold text-jericho-main">
            HIKCONNECT INTEGRATION
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your HikConnect accounts and integrate cameras into JERICHO
          </p>
        </div>
        <Button 
          onClick={loadData} 
          disabled={loading}
          variant="outline" 
          size="sm"
          className="border-jericho-secondary hover:bg-jericho-secondary/10"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Dashboard */}
      {stats && (
        <Card className="border-jericho-light/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jericho-main">
              <Database className="w-5 h-5" />
              Integration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-jericho-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-jericho-accent">{stats.active_accounts}</div>
                <div className="text-sm text-muted-foreground">Active Accounts</div>
              </div>
              <div className="text-center p-3 bg-jericho-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-jericho-accent">{stats.online_devices}</div>
                <div className="text-sm text-muted-foreground">Online Devices</div>
              </div>
              <div className="text-center p-3 bg-jericho-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-jericho-accent">{stats.integrated_cameras}</div>
                <div className="text-sm text-muted-foreground">Integrated Cameras</div>
              </div>
              <div className="text-center p-3 bg-jericho-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-jericho-accent">{stats.display_selected_cameras}</div>
                <div className="text-sm text-muted-foreground">Display Selected</div>
              </div>
            </div>
            {stats.last_sync && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Last sync: {new Date(stats.last_sync).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="add-account">Add Account</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-jericho-light mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-jericho-main mb-2">No HikConnect Accounts</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first HikConnect account to start integrating cameras
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[value="add-account"]')?.click()}
                    className="jericho-btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <Card key={account.id} className="border-jericho-light/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <CardTitle className="text-jericho-main">{account.account_name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {getRegionFlag(account.region)} {account.region.toUpperCase()} Region
                            {account.device_count && (
                              <>
                                • <Camera className="w-3 h-3" /> {account.device_count} devices
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          onClick={() => handleSyncDevices(account.id)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteAccount(account.id, account.account_name)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
>>>>>>> df8831273c93b9494cd2c830715464402580136f
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
<<<<<<< HEAD
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Devices</CardTitle>
              <CardDescription className="text-gray-400">
                {selectedAccount ? 'Devices from selected account' : 'Select an account to view devices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAccount ? (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Select an account to view devices</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No devices found</p>
                  <p className="text-gray-500 text-sm">Try syncing the account to fetch devices</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Device</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Channels</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.device_serial} className="border-gray-700">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{device.device_name}</p>
                            <p className="text-gray-400 text-sm">{device.device_serial}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {device.device_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {device.status === 1 ? (
                              <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <span className={device.status === 1 ? 'text-green-400' : 'text-red-400'}>
                              {device.status === 1 ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {device.channel_number}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addCameraFromDevice(device)}
                            disabled={loading}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Camera
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
=======
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Access Key</Label>
                        <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                          {account.access_key}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Secret Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="font-mono text-xs bg-gray-50 p-2 rounded flex-1">
                            {showSecrets[account.id] ? '***ENCRYPTED***' : '***HIDDEN***'}
                          </div>
                          <Button
                            onClick={() => toggleShowSecret(account.id)}
                            variant="ghost"
                            size="sm"
                          >
                            {showSecrets[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">API Endpoint</Label>
                        <div className="text-xs text-blue-600 mt-1">{account.api_url}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Last Sync</Label>
                        <div className="text-xs mt-1">
                          {new Date(account.last_sync).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-jericho-main">
                <Camera className="w-5 h-5" />
                HikConnect Devices
              </CardTitle>
              <CardDescription>
                Select an account to view and manage devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length > 0 ? (
                <>
                  <div className="mb-4">
                    <Label htmlFor="account-select">Select Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {getRegionFlag(account.region)} {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {devices.length === 0 ? (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-jericho-light mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-jericho-main mb-2">No Devices Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {selectedAccount ? 'Sync devices from your HikConnect account' : 'Select an account to view devices'}
                      </p>
                      {selectedAccount && (
                        <Button 
                          onClick={() => handleSyncDevices(selectedAccount)}
                          disabled={loading}
                          className="jericho-btn-primary"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Devices
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {devices.map((device) => (
                        <Card key={device.device_serial} className="border-jericho-light/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${device.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                  <h4 className="font-medium text-jericho-main">{device.device_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {device.device_model} • {device.channel_number} channels
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={device.status === 1 ? "default" : "destructive"}>
                                  {device.status === 1 ? "Online" : "Offline"}
                                </Badge>
                                <Button
                                  onClick={() => handleAddCamera(device)}
                                  disabled={loading || device.status !== 1}
                                  size="sm"
                                  className="jericho-btn-primary"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Camera
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                              Serial: {device.device_serial}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-jericho-light mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-jericho-main mb-2">No Accounts Available</h3>
                  <p className="text-muted-foreground">
                    Add a HikConnect account first to manage devices
                  </p>
                </div>
>>>>>>> df8831273c93b9494cd2c830715464402580136f
              )}
            </CardContent>
          </Card>
        </TabsContent>

<<<<<<< HEAD
        <TabsContent value="cameras" className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Add Cameras</CardTitle>
              <CardDescription className="text-gray-400">
                Add cameras from your HikConnect devices to the monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Select devices from the Devices tab to add cameras</p>
                <p className="text-gray-500 text-sm">
                  Make sure to sync your accounts and select devices first
                </p>
              </div>
=======
        {/* Add Account Tab */}
        <TabsContent value="add-account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-jericho-main">
                <Plus className="w-5 h-5" />
                Add HikConnect Account
              </CardTitle>
              <CardDescription>
                Connect your HikConnect account using Access Key (AK) and Secret Key (SK)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name *</Label>
                    <Input
                      id="accountName"
                      placeholder="e.g., Office Security"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select value={formData.region} onValueChange={(value: any) => setFormData(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">🌍 Global</SelectItem>
                        <SelectItem value="eu">🇪🇺 Europe</SelectItem>
                        <SelectItem value="us">🇺🇸 United States</SelectItem>
                        <SelectItem value="asia">🌏 Asia Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessKey">Access Key (AK) *</Label>
                  <Input
                    id="accessKey"
                    placeholder="Your HikConnect Access Key"
                    value={formData.accessKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessKey: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key (SK) *</Label>
                  <Textarea
                    id="secretKey"
                    placeholder="Your HikConnect Secret Key"
                    value={formData.secretKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your credentials are encrypted and stored securely. Only the Access Key is visible after creation.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="jericho-btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setFormData({ accountName: '', accessKey: '', secretKey: '', region: 'global' })}
                    disabled={loading}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
>>>>>>> df8831273c93b9494cd2c830715464402580136f
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

<<<<<<< HEAD
export default HikConnectSettings;
=======
export default HikConnectSettings;
>>>>>>> df8831273c93b9494cd2c830715464402580136f
