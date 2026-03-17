export interface Status {
  id: number
  name: string
  avatar_url: string | null
  title: string | null
  status: 'working' | 'resting'
  working: string | null
  created_at: string
  updated_at: string
}

export type NewStatus = Omit<Status, 'id' | 'created_at' | 'updated_at'>
