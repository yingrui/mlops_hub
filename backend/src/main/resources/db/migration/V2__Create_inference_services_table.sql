-- Create inference_services table
CREATE TABLE inference_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    namespace VARCHAR(100),
    replicas INTEGER DEFAULT 1,
    cpu VARCHAR(50),
    memory VARCHAR(50),
    image VARCHAR(500),
    port INTEGER,
    base_url VARCHAR(500),
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for inference_services
CREATE INDEX idx_inference_services_name ON inference_services(name);
CREATE INDEX idx_inference_services_status ON inference_services(status);
CREATE INDEX idx_inference_services_namespace ON inference_services(namespace);

-- Add unique constraint for name
CREATE UNIQUE INDEX idx_inference_services_name_unique ON inference_services(name);
