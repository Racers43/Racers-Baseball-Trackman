# Racers Baseball TrackMan Analytics

A hosted Next.js dashboard for importing TrackMan CSV/XLSX exports and building season-long hitter/pitcher analytics.

## Current build
- CSV and XLSX browser importer
- TrackMan field normalization for common export names
- Pitch/batter/pitcher summary cards
- Imported-data preview
- Cloud database schema for Supabase
- Responsive coach dashboard foundation

## Production architecture
Next.js + Supabase Auth/Postgres/Storage. Deploy the Next.js app on Vercel or another Node-compatible host.

## Supabase
Run `supabase/schema.sql` in the Supabase SQL editor, then add:
`NEXT_PUBLIC_SUPABASE_URL`
`NEXT_PUBLIC_SUPABASE_ANON_KEY`

## TrackMan
The importer intentionally preserves the raw row in the cloud schema so additional TrackMan columns can be mapped without losing source data. Add production ingestion/auth wiring before using this with live team data.
