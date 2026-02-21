/**
 * Domain types for Source (RSS/editorial source).
 * Read by daily-ingestor from sources table.
 */

export interface Source {
  id: string;
  name: string;
  rss_url: string;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SourceCreate {
  name: string;
  rss_url: string;
  category?: string;
  is_active?: boolean;
}
