-- V8__geofencing_oauth_and_fuel_analytics.sql
-- Adds: geofences, geofence_events tables; OAuth fields to users

-- ─── Geofences ───
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'CUSTOM',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_geofence_active ON geofences(active);
CREATE INDEX IF NOT EXISTS idx_geofence_tenant ON geofences(tenant_id);

-- ─── Geofence Events ───
CREATE TABLE IF NOT EXISTS geofence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geofence_id UUID NOT NULL REFERENCES geofences(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    trip_id UUID REFERENCES trips(id),
    event_type VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    event_time TIMESTAMP NOT NULL,
    tenant_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_gfe_geofence_time ON geofence_events(geofence_id, event_time);
CREATE INDEX IF NOT EXISTS idx_gfe_vehicle_time ON geofence_events(vehicle_id, event_time);

-- ─── OAuth2 SSO fields on users ───
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_provider_id)
    WHERE oauth_provider IS NOT NULL;

-- ─── Seed sample geofences ───
INSERT INTO geofences (name, description, latitude, longitude, radius_meters, type, active)
VALUES
    ('Mumbai JNPT Port Hub', 'Jawaharlal Nehru Port Terminal logistics zone, Navi Mumbai', 18.9496, 72.9515, 1000, 'DEPOT', true),
    ('Delhi NCR Freight Depot', 'Central container freight depot, Tughlakabad - Gurugram', 28.5020, 77.2915, 800, 'DEPOT', true),
    ('Bengaluru Cargo Hub', 'Electronic City freight & e-commerce distribution hub', 12.8452, 77.6602, 1200, 'DELIVERY_ZONE', true),
    ('Chennai Sriperumbudur Corridor', 'Automotive & manufacturing corridor delivery zone', 12.9669, 79.9482, 1500, 'DELIVERY_ZONE', true),
    ('Hyderabad Shamshabad Cargo', 'Air cargo and pharma logistics park, Hyderabad', 17.2403, 78.4294, 900, 'DEPOT', true),
    ('Pune Chakan Industrial Restricted', 'Restricted heavy industrial plant & hazardous cargo zone', 18.7606, 73.8636, 600, 'RESTRICTED_ZONE', true);


