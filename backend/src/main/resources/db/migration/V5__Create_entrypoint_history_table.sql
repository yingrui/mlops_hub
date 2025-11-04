-- Create entrypoint_history table to store inference API call history
CREATE TABLE entrypoint_history (
    id BIGSERIAL PRIMARY KEY,
    entrypoint_id BIGINT NOT NULL REFERENCES entrypoints(id) ON DELETE CASCADE,
    request_body TEXT,
    response_body TEXT,
    status_code INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- success, error, timeout
    error_message TEXT,
    elapsed_time_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for entrypoint_history
CREATE INDEX idx_entrypoint_history_entrypoint_id ON entrypoint_history(entrypoint_id);
CREATE INDEX idx_entrypoint_history_created_at ON entrypoint_history(created_at);
CREATE INDEX idx_entrypoint_history_status ON entrypoint_history(status);

