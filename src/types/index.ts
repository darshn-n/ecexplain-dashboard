export interface PostItem {
  id: string;
  index: number;
  day_number?: number;
  slot?: 'morning' | 'evening';
  title: string;
  category: string;
  type: 'single' | 'carousel';
  hook: string;
  caption: string;
  caption_facebook?: string;
  hashtags: string[];
  hashtags_facebook?: string[];
  cta: string;
  source_url: string;
  scheduled_date_str: string;
  scheduled_iso: string;
  day_name: string;
  images: string[];
  status?: string;
  quiz?: any;
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
