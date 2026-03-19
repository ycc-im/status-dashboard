export interface Status {
  id: number;
  name: string;
  avatar_url: string | null;
  title: string | null;
  status: 'working' | 'resting';
  working: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | null;
}

export type NewStatus = Omit<Status, 'id' | 'created_at' | 'updated_at'>;
