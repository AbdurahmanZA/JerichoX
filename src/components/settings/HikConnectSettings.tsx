import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    accountName: '',
    accessKey: '',
    secretKey: '',
    region: 'global' as const,
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
    } finally {
      setLoading(false);
    }
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HikConnectSettings;