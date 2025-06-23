// HikConnect TypeScript Definitions
export interface HikConnectAccount {
  id: string;
  account_name: string;
  access_key: string;
  secret_key?: string; // Hidden in responses
  region: 'global' | 'eu' | 'asia' | 'us';
  api_url: string;
  auth_type: 'ak_sk' | 'oauth';
  is_active: boolean;
  last_sync: string;
  created_at: string;
  device_count?: number;
}

export interface HikConnectDevice {
  device_serial: string;
  device_name: string;
  device_type: string;
  device_model: string;
  version: string;
  status: number; // 0: offline, 1: online
  channel_number: number;
  support_function: string[];
  manufacturer: string;
  account_id: string;
  device_capabilities: Record<string, any>;
  stream_urls: Record<string, string>;
  synced_at: string;
  camera_count?: number;
}

export interface HikConnectCredentials {
  accountName: string;
  accessKey: string;
  secretKey: string;
  region: 'global' | 'eu' | 'asia' | 'us';
  apiUrl?: string;
}

export interface CameraDisplaySelection {
  id: number;
  camera_id: number;
  user_id: number;
  layout_position: number;
  is_selected: boolean;
  is_visible: boolean;
  display_priority: number;
  created_at: string;
}

export interface CameraWithHikConnect {
  id: number;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  url: string;
  location: string;
  zone: string;
  status: string;
  capabilities: string[];
  hikconnect_device_serial?: string;
  hikconnect_account_id?: string;
  hikconnect_channel_no?: number;
  hikconnect_account_name?: string;
  hikconnect_device_name?: string;
  hikconnect_device_status?: number;
  is_display_selected?: boolean;
  layout_position?: number;
  display_priority?: number;
}
