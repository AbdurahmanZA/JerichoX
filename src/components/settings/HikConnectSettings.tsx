import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface HikConnectAccount {
  id: string;
  account_name: string;
  access_key: string;
  secret_key?: string;
  region: 'global' | 'eu' | 'asia' | 'us';
  api_url: string;
  auth_type: 'ak_sk' | 'oauth';
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
    accountName: '',
    accessKey: '',
    secretKey: '',
    region: 'global' as const,
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
    } finally {
      setLoading(false);
    }
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HikConnectSettings;
