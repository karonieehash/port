-- Migration 001: Create Portfolio Tables
-- Schema version: 1

CREATE TABLE IF NOT EXISTS public.portfolio (
    id TEXT PRIMARY KEY DEFAULT 'default',
    schema_version INTEGER NOT NULL DEFAULT 1,
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
    data JSONB NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient JSONB and updated_at lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_updated_at ON public.portfolio(updated_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_owner_id ON public.portfolio(owner_id);

-- Insert baseline portfolio document if not exists
INSERT INTO public.portfolio (id, schema_version, updated_at, data)
VALUES (
    'default',
    1,
    0,
    '{
        "schemaVersion": 1,
        "updatedAt": 0,
        "readings": {},
        "project": {},
        "archive": [],
        "process": {
            "log": "",
            "contribution": "",
            "reflection": "",
            "sources": "",
            "acknowledgements": "Website design and interface were created with assistance from ChatGPT. Reading analyses, learning summaries, project findings, and personal reflections must be added by Deepak. This declaration should be reviewed before academic submission."
        }
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
