#!/bin/sh
set -e

# Initialize database if not exists
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    
    # Initialize the database
    su-exec postgres initdb -D "$PGDATA"
    
    # Configure authentication
    echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
    echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
    
    # Start PostgreSQL temporarily to create user and database
    su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start
    
    # Create user and database
    su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
        CREATE USER $POSTGRES_USER WITH SUPERUSER PASSWORD '$POSTGRES_PASSWORD';
        CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;
EOSQL
    
    # Stop PostgreSQL
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
    
    echo "PostgreSQL database initialized."
fi

# Start PostgreSQL
exec su-exec postgres "$@"
