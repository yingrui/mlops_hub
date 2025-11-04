-- Add model_type and full_inference_path columns to entrypoints table
ALTER TABLE entrypoints ADD COLUMN IF NOT EXISTS model_type VARCHAR(100);
ALTER TABLE entrypoints ADD COLUMN IF NOT EXISTS full_inference_path VARCHAR(500);

