-- Create entrypoints table
CREATE TABLE entrypoints (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    type VARCHAR(50) NOT NULL DEFAULT 'api', -- api, batch, streaming, scheduled, webhook
    status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- active, inactive, deployed, failed
    endpoint VARCHAR(500),
    method VARCHAR(10), -- GET, POST, PUT, DELETE, PATCH
    model_id BIGINT REFERENCES models(id),
    model_name VARCHAR(255),
    model_type VARCHAR(100), -- e.g., text-classification
    inference_service_id BIGINT REFERENCES inference_services(id),
    inference_service_name VARCHAR(255),
    path VARCHAR(500), -- path on the inference service (e.g., /predict)
    full_inference_path VARCHAR(500), -- full path including model (e.g., /infer/text-classification/emotion-classifier)
    tags TEXT, -- JSON array of tags
    visibility VARCHAR(50) DEFAULT 'private', -- public, private, organization
    owner_id BIGINT, -- FK to user/auth system
    owner_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_deployed TIMESTAMP,
    deployment_config TEXT, -- JSON configuration
    metrics_data TEXT -- JSON metrics data
);

-- Create indexes for entrypoints
CREATE INDEX idx_entrypoints_name ON entrypoints(name);
CREATE INDEX idx_entrypoints_status ON entrypoints(status);
CREATE INDEX idx_entrypoints_type ON entrypoints(type);
CREATE INDEX idx_entrypoints_model_id ON entrypoints(model_id);
CREATE INDEX idx_entrypoints_inference_service_id ON entrypoints(inference_service_id);
CREATE INDEX idx_entrypoints_owner_id ON entrypoints(owner_id);

-- Add unique constraint for name
CREATE UNIQUE INDEX idx_entrypoints_name_unique ON entrypoints(name);

