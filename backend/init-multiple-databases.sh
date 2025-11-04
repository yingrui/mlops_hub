#!/bin/bash
set -e

# Create databases and users for each service
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create Keycloak user and database
    CREATE USER keycloak_user WITH PASSWORD 'keycloak_password';
    CREATE DATABASE keycloak;
    GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
    
    -- Create MLflow user and database
    CREATE USER mlflow_user WITH PASSWORD 'mlflow_password';
    CREATE DATABASE mlflow;
    GRANT ALL PRIVILEGES ON DATABASE mlflow TO mlflow_user;
    
    -- Create MLOps Hub backend user (separate from main postgres user)
    CREATE USER mlops_hub_user WITH PASSWORD 'mlops_hub_password';
    GRANT ALL PRIVILEGES ON DATABASE mlops_hub TO mlops_hub_user;
EOSQL

# Ensure clean schema for mlops_hub database (main application database)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "mlops_hub" <<-EOSQL
    -- Drop and recreate public schema to ensure clean state
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    
    -- Grant permissions on public schema to the dedicated user
    GRANT ALL ON SCHEMA public TO mlops_hub_user;
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL ON SCHEMA public TO PUBLIC;
EOSQL

echo "Multiple databases and users created with proper permissions:"
echo "  - keycloak_user -> keycloak database"
echo "  - mlflow_user -> mlflow database" 
echo "  - mlops_hub_user -> mlops_hub database"
echo "mlops_hub database schema cleaned and ready for Flyway migrations"
