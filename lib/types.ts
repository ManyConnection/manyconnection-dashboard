export type ReleaseIntent = 'ready' | 'needs-fix' | 'hold' | 'released'

export interface AppChecks {
  launch: boolean
  mainFeature: boolean
  ui: boolean
  crashFree: boolean
}

export interface App {
  id: number
  name: string
  slug: string
  emoji: string
  bundleId?: string
  githubUrl?: string
  testflightUrl?: string
  appStoreUrl?: string
  releaseIntent: ReleaseIntent
  fixNotes?: string
  checks: AppChecks
  testNotes?: string
  lastUpdated?: string
}

export interface AppsData {
  version: number
  lastUpdated: string
  apps: App[]
}
