# Database Setup & Migrations Guide

This directory contains the SQL migration files for the Supabase PostgreSQL database.

## Architecture & Trade-Offs

- **Storage Model**: Single JSONB document per portfolio (`public.portfolio`).
- **Trade-Offs**:
  - *Advantages*: Matches the client-side schema (`schemaVersion: 1`), allows atomic saves of entire readings/project/archive/process sets, requires zero multi-table join round-trips for visitors, and matches the portable JSON export/import format seamlessly.
  - *Extensibility*: The repository interface (`RepositoryInterface`) abstracts database access so that future relational migrations (e.g. separate `readings`, `archive_records`, and `projects` tables) can be introduced by creating another repository adapter without altering any frontend UI components.

## Migration Steps

1. In your **Supabase Dashboard**, navigate to the **SQL Editor**.
2. Run `001_create_portfolio_tables.sql`:
   - Creates the `public.portfolio` table with default row.
   - Sets schema version to 1.
3. Run `002_security_and_rls_policies.sql`:
   - Enables Row Level Security (RLS).
   - Allows public read access for all visitors.
   - Restricts updates strictly to the authenticated owner UUID.
4. Assign Owner:
   After signing up the owner account in Supabase Auth (Dashboard -> Authentication -> Users), copy the owner's UUID and run:
   ```sql
   SELECT public.assign_portfolio_owner('YOUR-USER-UUID-HERE'::uuid);
   ```
