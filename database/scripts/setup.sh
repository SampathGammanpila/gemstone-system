#!/bin/bash
# Database setup script

# Create databases
psql -U postgres -c "CREATE DATABASE gemstone_dev;"
psql -U postgres -c "CREATE DATABASE gemstone_test;"
psql -U postgres -c "CREATE DATABASE gemstone_prod;"

echo "Databases created successfully"

