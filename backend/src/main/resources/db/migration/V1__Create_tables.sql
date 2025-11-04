-- Create experiments table
CREATE TABLE experiments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mlflow_experiment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create models table
CREATE TABLE models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    model_path VARCHAR(500),
    model_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create datasets table (updated for versioned dataset system)
CREATE TABLE datasets (
    id BIGSERIAL PRIMARY KEY,
    dataset_uuid VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_format VARCHAR(100),
    total_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dataset_versions table
CREATE TABLE dataset_versions (
    id BIGSERIAL PRIMARY KEY,
    version_id VARCHAR(255) NOT NULL UNIQUE,
    dataset_id BIGINT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    committed_at TIMESTAMP
);

-- Create dataset_files table
CREATE TABLE dataset_files (
    id BIGSERIAL PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL UNIQUE,
    version_id BIGINT NOT NULL REFERENCES dataset_versions(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    file_format VARCHAR(100),
    digest VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create runs table
CREATE TABLE runs (
    id BIGSERIAL PRIMARY KEY,
    experiment_id BIGINT REFERENCES experiments(id),
    name VARCHAR(255),
    status VARCHAR(50),
    mlflow_run_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_experiments_name ON experiments(name);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_datasets_name ON datasets(name);
CREATE INDEX idx_datasets_uuid ON datasets(dataset_uuid);
CREATE INDEX idx_runs_experiment_id ON runs(experiment_id);

-- Create indexes for versioned dataset system
CREATE INDEX idx_dataset_versions_dataset_id ON dataset_versions(dataset_id);
CREATE INDEX idx_dataset_versions_version_id ON dataset_versions(version_id);
CREATE INDEX idx_dataset_versions_status ON dataset_versions(status);
CREATE INDEX idx_dataset_files_version_id ON dataset_files(version_id);
CREATE INDEX idx_dataset_files_file_id ON dataset_files(file_id);

-- Add unique constraint for version number per dataset
CREATE UNIQUE INDEX idx_dataset_versions_dataset_version ON dataset_versions(dataset_id, version_number);