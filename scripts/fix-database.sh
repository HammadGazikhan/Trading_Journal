#!/usr/bin/env bash
set -euo pipefail

# Fixes: missing tables + "permission denied for schema public"
# Run from project root:
#   chmod +x scripts/fix-database.sh
#   ./scripts/fix-database.sh

DB_NAME="trading_journal"
DB_USER="trading_user"
DB_PASS="Trading123!"

echo "Resetting database '${DB_NAME}' and granting permissions to '${DB_USER}'..."

sudo -u postgres psql <<SQL
-- Recreate database cleanly (dev only)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS ${DB_NAME};
DROP ROLE IF EXISTS ${DB_USER};

CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

\\c ${DB_NAME}

GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL

echo ""
echo "Applying Prisma schema..."
npm run db:push

echo ""
echo "Seeding demo data..."
npm run db:seed

echo ""
echo "Done. Login with demo@tradingjournal.com / Demo123!"
