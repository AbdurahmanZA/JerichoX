-- HikConnect Database Migration Script
-- Run this on your existing jerichox_security database

-- Create HikConnect accounts table with AK/SK authentication
CREATE TABLE IF NOT EXISTS hikconnect_accounts (
    id VARCHAR(255) PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    access_key VARCHAR(255) NOT NULL,
    secret_key TEXT NOT NULL, -- Encrypted storage
    region VARCHAR(50) NOT NULL CHECK (region IN ('global', 'eu', 'us', 'asia')),
    api_url VARCHAR(500) NOT NULL,
    auth_type VARCHAR(20) DEFAULT 'ak_sk' CHECK (auth_type IN ('ak_sk', 'oauth')),
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create HikConnect devices table
CREATE TABLE IF NOT EXISTS hikconnect_devices (
    device_serial VARCHAR(255) PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100),
    device_model VARCHAR(255),
    version VARCHAR(100),
    status INTEGER DEFAULT 0 CHECK (status IN (0, 1)), -- 0: offline, 1: online
    channel_number INTEGER DEFAULT 1,
    support_function TEXT[],
    manufacturer VARCHAR(100) DEFAULT 'Hikvision',
    account_id VARCHAR(255) REFERENCES hikconnect_accounts(id) ON DELETE CASCADE,
    device_capabilities JSONB DEFAULT '{}',
    stream_urls JSONB DEFAULT '{}',
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create camera selection table for display management
CREATE TABLE IF NOT EXISTS camera_display_selection (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    layout_position INTEGER DEFAULT 0,
    is_selected BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    display_priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(camera_id, user_id)
);

-- Add columns to existing cameras table for HikConnect integration
DO $$ 
BEGIN
    -- Add HikConnect integration columns to cameras table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'hikconnect_device_serial') THEN
        ALTER TABLE cameras ADD COLUMN hikconnect_device_serial VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'hikconnect_account_id') THEN
        ALTER TABLE cameras ADD COLUMN hikconnect_account_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'hikconnect_channel_no') THEN
        ALTER TABLE cameras ADD COLUMN hikconnect_channel_no INTEGER DEFAULT 1;
    END IF;
    
    -- Add manufacturer and model if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'manufacturer') THEN
        ALTER TABLE cameras ADD COLUMN manufacturer VARCHAR(100) DEFAULT 'Generic';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'model') THEN
        ALTER TABLE cameras ADD COLUMN model VARCHAR(255) DEFAULT 'IP Camera';
    END IF;
    
    -- Add capabilities column for camera features (PTZ, Audio, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'capabilities') THEN
        ALTER TABLE cameras ADD COLUMN capabilities TEXT[] DEFAULT '{}';
    END IF;

    -- Add display settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'display_order') THEN
        ALTER TABLE cameras ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'is_featured') THEN
        ALTER TABLE cameras ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hikconnect_devices_account_id ON hikconnect_devices(account_id);
CREATE INDEX IF NOT EXISTS idx_hikconnect_devices_status ON hikconnect_devices(status);
CREATE INDEX IF NOT EXISTS idx_hikconnect_devices_sync ON hikconnect_devices(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_hikconnect_accounts_active ON hikconnect_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_hikconnect_accounts_region ON hikconnect_accounts(region);
CREATE INDEX IF NOT EXISTS idx_camera_display_selection_user ON camera_display_selection(user_id);
CREATE INDEX IF NOT EXISTS idx_camera_display_selection_priority ON camera_display_selection(display_priority DESC);

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cameras_hikconnect_device'
    ) THEN
        ALTER TABLE cameras 
        ADD CONSTRAINT fk_cameras_hikconnect_device 
        FOREIGN KEY (hikconnect_device_serial) 
        REFERENCES hikconnect_devices(device_serial) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cameras_hikconnect_account'
    ) THEN
        ALTER TABLE cameras 
        ADD CONSTRAINT fk_cameras_hikconnect_account 
        FOREIGN KEY (hikconnect_account_id) 
        REFERENCES hikconnect_accounts(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hikconnect_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to hikconnect_accounts table
DROP TRIGGER IF EXISTS tr_hikconnect_accounts_updated_at ON hikconnect_accounts;
CREATE TRIGGER tr_hikconnect_accounts_updated_at
    BEFORE UPDATE ON hikconnect_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_hikconnect_accounts_updated_at();

-- Insert HikConnect-related settings
INSERT INTO settings (key, value, description) VALUES 
    ('hikconnect_enabled', 'true', 'Enable HikConnect integration')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
    ('hikconnect_sync_interval', '300', 'HikConnect device sync interval in seconds (5 minutes)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
    ('hikconnect_auto_add_cameras', 'false', 'Automatically add new HikConnect devices as cameras')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
    ('hikconnect_stream_quality', 'main', 'Default stream quality for HikConnect cameras (main/sub)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
    ('camera_grid_layout', '2x2', 'Default camera grid layout for home page')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
    ('max_cameras_display', '12', 'Maximum number of cameras to display simultaneously')
ON CONFLICT (key) DO NOTHING;

-- Create view for camera management with HikConnect data
CREATE OR REPLACE VIEW v_cameras_with_hikconnect AS
SELECT 
    c.*,
    ha.account_name as hikconnect_account_name,
    ha.region as hikconnect_region,
    hd.device_name as hikconnect_device_name,
    hd.device_model as hikconnect_device_model,
    hd.status as hikconnect_device_status,
    hd.channel_number as hikconnect_total_channels,
    CASE 
        WHEN c.hikconnect_device_serial IS NOT NULL THEN 'hikconnect'
        WHEN c.type = 'rtsp' THEN 'rtsp'
        WHEN c.type = 'ip' THEN 'ip'
        ELSE 'manual'
    END as integration_type,
    COALESCE(cds.is_selected, true) as is_display_selected,
    COALESCE(cds.layout_position, 0) as layout_position,
    COALESCE(cds.display_priority, 0) as display_priority
FROM cameras c
LEFT JOIN hikconnect_devices hd ON c.hikconnect_device_serial = hd.device_serial
LEFT JOIN hikconnect_accounts ha ON c.hikconnect_account_id = ha.id
LEFT JOIN camera_display_selection cds ON c.id = cds.camera_id
ORDER BY COALESCE(cds.display_priority, 0) DESC, c.created_at DESC;

-- Create function to get HikConnect statistics
CREATE OR REPLACE FUNCTION get_hikconnect_stats()
RETURNS TABLE (
    total_accounts BIGINT,
    active_accounts BIGINT,
    total_devices BIGINT,
    online_devices BIGINT,
    integrated_cameras BIGINT,
    display_selected_cameras BIGINT,
    last_sync TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM hikconnect_accounts)::BIGINT,
        (SELECT COUNT(*) FROM hikconnect_accounts WHERE is_active = true)::BIGINT,
        (SELECT COUNT(*) FROM hikconnect_devices)::BIGINT,
        (SELECT COUNT(*) FROM hikconnect_devices WHERE status = 1)::BIGINT,
        (SELECT COUNT(*) FROM cameras WHERE hikconnect_device_serial IS NOT NULL)::BIGINT,
        (SELECT COUNT(*) FROM camera_display_selection WHERE is_selected = true)::BIGINT,
        (SELECT MAX(last_sync) FROM hikconnect_accounts);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to jerichox user
GRANT ALL PRIVILEGES ON hikconnect_accounts TO jerichox;
GRANT ALL PRIVILEGES ON hikconnect_devices TO jerichox;
GRANT ALL PRIVILEGES ON camera_display_selection TO jerichox;
GRANT ALL PRIVILEGES ON v_cameras_with_hikconnect TO jerichox;
GRANT EXECUTE ON FUNCTION get_hikconnect_stats() TO jerichox;
GRANT EXECUTE ON FUNCTION update_hikconnect_accounts_updated_at() TO jerichox;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE camera_display_selection_id_seq TO jerichox;

COMMIT;
