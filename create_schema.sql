-- JerichoX Security Platform Database Schema
-- Version: 2.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    permissions TEXT[],
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cameras table
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    url TEXT NOT NULL,
    username VARCHAR(255),
    password_encrypted TEXT,
    location VARCHAR(255),
    zone VARCHAR(100),
    status VARCHAR(20) DEFAULT 'offline',
    capabilities TEXT[],
    settings JSONB DEFAULT '{}',
    last_seen TIMESTAMP,
    is_recording BOOLEAN DEFAULT false,
    has_audio BOOLEAN DEFAULT false,
    has_ptz BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    camera_id UUID REFERENCES cameras(id),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    location VARCHAR(255),
    evidence JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);
CREATE INDEX IF NOT EXISTS idx_cameras_location ON cameras(location);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, permissions) 
VALUES (
    'admin',
    'admin@jerichosecurity.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/h/bQxhOxC',
    'admin',
    ARRAY['camera_view', 'camera_manage', 'user_manage', 'system_admin']
) ON CONFLICT (username) DO NOTHING;

-- Insert default operator user (password: operator123)
INSERT INTO users (username, email, password_hash, role, permissions) 
VALUES (
    'operator',
    'operator@jerichosecurity.local',
    '$2b$12$xG4.4B3K9k7NyHVG3a3j9O5.3h8hQ3g3b3nC7vF8vG3a3j9O5.3h8',
    'operator',
    ARRAY['camera_view', 'incident_manage']
) ON CONFLICT (username) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
    ('system_name', 'JerichoX Security Platform', 'System display name', 'general'),
    ('max_cameras', '64', 'Maximum number of cameras supported', 'cameras'),
    ('stream_quality', 'high', 'Default streaming quality', 'cameras'),
    ('recording_retention', '30', 'Recording retention period in days', 'storage'),
    ('alert_email', 'security@jerichosecurity.local', 'Default alert email address', 'notifications'),
    ('emergency_contact', '+1-555-EMERGENCY', 'Emergency contact number', 'emergency')
ON CONFLICT (key) DO NOTHING;

-- Insert sample cameras
INSERT INTO cameras (name, type, url, location, zone, status, has_ptz, has_audio, capabilities) VALUES
    ('Front Entrance', 'hikvision', 'rtsp://192.168.1.100:554/stream1', 'Building A', 'Main Entrance', 'online', true, true, ARRAY['ptz', 'audio', 'night_vision']),
    ('Parking Lot', 'ip', 'rtsp://192.168.1.101:554/stream1', 'Exterior', 'Parking Area', 'online', false, false, ARRAY['night_vision']),
    ('Server Room', 'rtsp', 'rtsp://192.168.1.102:554/stream1', 'Building B', 'Server Room', 'offline', false, false, ARRAY[])
ON CONFLICT (name) DO NOTHING;

-- Show table status
\dt
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as camera_count FROM cameras;
SELECT COUNT(*) as settings_count FROM settings;
