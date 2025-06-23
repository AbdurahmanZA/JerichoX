// HikConnect API Service for JerichoX
import { HikConnectAccount, HikConnectDevice, HikConnectCredentials, CameraWithHikConnect } from '../types/hikconnect.types';

const API_BASE_URL = 'http://localhost:3001/api/hikconnect';

class HikConnectService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jericho_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Account Management
  async getAccounts(): Promise<HikConnectAccount[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HikConnect accounts:', error);
      throw error;
    }
  }

  async addAccount(credentials: HikConnectCredentials): Promise<HikConnectAccount> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add account: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding HikConnect account:', error);
      throw error;
    }
  }

  async updateAccount(id: string, updates: Partial<HikConnectCredentials & { isActive: boolean }>): Promise<HikConnectAccount> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update account: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating HikConnect account:', error);
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete account: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting HikConnect account:', error);
      throw error;
    }
  }

  // Device Management
  async getAccountDevices(accountId: string): Promise<HikConnectDevice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/account/${accountId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching account devices:', error);
      throw error;
    }
  }

  async syncDevices(accountId: string): Promise<{ message: string; devices: HikConnectDevice[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/sync/${accountId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to sync devices: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing devices:', error);
      throw error;
    }
  }

  // Camera Management
  async addCameraFromDevice(deviceSerial: string, accountId: string, options: {
    channelNo?: number;
    name?: string;
    location?: string;
    isSelected?: boolean;
  } = {}): Promise<{ message: string; camera: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/cameras/add`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          deviceSerial,
          accountId,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add camera: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding camera from device:', error);
      throw error;
    }
  }

  async getDisplayCameras(userId: number = 1): Promise<CameraWithHikConnect[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cameras/display?userId=${userId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch display cameras: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching display cameras:', error);
      throw error;
    }
  }

  async updateCameraDisplaySettings(cameraId: number, settings: {
    isSelected?: boolean;
    layoutPosition?: number;
    displayPriority?: number;
    userId?: number;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/cameras/display/${cameraId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update display settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating camera display settings:', error);
      throw error;
    }
  }

  // Statistics
  async getStats(): Promise<{
    total_accounts: number;
    active_accounts: number;
    total_devices: number;
    online_devices: number;
    integrated_cameras: number;
    display_selected_cameras: number;
    last_sync: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HikConnect stats:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing HikConnect connection:', error);
      return false;
    }
  }

  // Helper methods
  getRegionDisplayName(region: string): string {
    const regionNames = {
      global: 'Global',
      eu: 'Europe',
      us: 'United States',
      asia: 'Asia Pacific',
    };
    return regionNames[region as keyof typeof regionNames] || region;
  }

  getDefaultApiUrl(region: string): string {
    const urls = {
      global: 'https://api.hik-connect.com',
      eu: 'https://api-eu.hik-connect.com',
      us: 'https://api-us.hik-connect.com',
      asia: 'https://api-asia.hik-connect.com',
    };
    return urls[region as keyof typeof urls] || urls.global;
  }

  getDeviceStatusText(status: number): string {
    return status === 1 ? 'Online' : 'Offline';
  }

  getDeviceStatusColor(status: number): string {
    return status === 1 ? 'text-green-500' : 'text-red-500';
  }
}

// Export singleton instance
export const hikConnectService = new HikConnectService();
export default hikConnectService;
