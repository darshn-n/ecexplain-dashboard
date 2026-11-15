export interface PostItem {
  id: string;
  index: number;
  title: string;
  category: string;
  type: 'single' | 'carousel';
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  source_url: string;
  scheduled_date_str: string;
  scheduled_iso: string;
  day_name: string;
  images: string[];
}

export interface WorkerHealth {
  status: string;
  service: string;
  version: string;
  timestamp_utc: string;
  config: {
    dry_run: string;
    publishing_enabled: string;
    meta_graph_api_version: string;
    timezone: string;
    media_base_url: string;
  };
}
