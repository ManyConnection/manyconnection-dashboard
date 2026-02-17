export type ReleaseIntent = 'ready' | 'needs-fix' | 'hold' | 'released'

export interface App {
  id: number
  name: string
  slug: string
  emoji: string
  icon_url?: string
  bundle_id?: string
  github_url?: string
  testflight_url?: string
  appstore_url?: string
  release_intent: ReleaseIntent
  fix_notes?: string
  check_launch: boolean
  check_main_feature: boolean
  check_ui: boolean
  check_crash_free: boolean
  test_notes?: string
  created_at?: string
  updated_at?: string
}
