import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spppohwfcmeqqlehkppw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcHBvaHdmY21lcXFsZWhrcHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTc0MzMsImV4cCI6MjA4Njg5MzQzM30.wJoQue_EzqCfddRU1cUdm93fSXKh1D9s9T6etwixhIk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AppRow {
  id: number
  name: string
  slug: string
  emoji: string
  bundle_id?: string
  github_url?: string
  testflight_url?: string
  appstore_url?: string
  release_intent: 'ready' | 'needs-fix' | 'hold' | 'released'
  fix_notes?: string
  check_launch: boolean
  check_main_feature: boolean
  check_ui: boolean
  check_crash_free: boolean
  test_notes?: string
  created_at?: string
  updated_at?: string
}

export async function getApps(): Promise<AppRow[]> {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('id')
  
  if (error) {
    console.error('Error fetching apps:', error)
    return []
  }
  
  return data || []
}

export async function updateApp(id: number, updates: Partial<AppRow>): Promise<boolean> {
  const { error } = await supabase
    .from('apps')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating app:', error)
    return false
  }
  
  return true
}

export async function createApp(app: Omit<AppRow, 'id' | 'created_at' | 'updated_at'>): Promise<AppRow | null> {
  const { data, error } = await supabase
    .from('apps')
    .insert(app)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating app:', error)
    return null
  }
  
  return data
}
