'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { App, AppsData, ReleaseIntent } from '@/lib/types'
import { getAppsFromGitHub, saveAppsToGitHub } from '@/lib/github'
import AppCard from './AppCard'
import FilterBar from './FilterBar'
import GitHubSetup from './GitHubSetup'

const DEFAULT_APPS_DATA: AppsData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  apps: [],
}

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [appsData, setAppsData] = useState<AppsData>(DEFAULT_APPS_DATA)
  const [sha, setSha] = useState<string | null>(null)
  const [filter, setFilter] = useState<ReleaseIntent | 'all' | 'unchecked'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Load apps from GitHub
  const loadApps = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    const result = await getAppsFromGitHub(token)
    
    if (result) {
      try {
        const data = JSON.parse(result.content) as AppsData
        setAppsData(data)
        setSha(result.sha)
      } catch {
        console.error('Failed to parse apps.json')
      }
    }
    
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (token) {
      loadApps()
    }
  }, [token, loadApps])

  // Auto-save with debounce
  const saveApps = useCallback(async () => {
    if (!token || !hasChanges) return
    
    setSaving(true)
    const content = JSON.stringify(appsData, null, 2)
    const success = await saveAppsToGitHub(
      token,
      content,
      sha,
      `Update apps.json - ${new Date().toLocaleString('ja-JP')}`
    )
    
    if (success) {
      // Refresh to get new SHA
      const result = await getAppsFromGitHub(token)
      if (result) {
        setSha(result.sha)
      }
      setHasChanges(false)
    }
    
    setSaving(false)
  }, [token, appsData, sha, hasChanges])

  // Debounced auto-save
  useEffect(() => {
    if (hasChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(saveApps, 2000) // 2秒後に自動保存
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasChanges, saveApps])

  const handleAppUpdate = (updatedApp: App) => {
    setAppsData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      apps: prev.apps.map((app) =>
        app.id === updatedApp.id ? updatedApp : app
      ),
    }))
    setHasChanges(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('github_token')
    setToken(null)
    setAppsData(DEFAULT_APPS_DATA)
    setSha(null)
  }

  // Filter apps
  const filteredApps = appsData.apps.filter((app) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !app.name.toLowerCase().includes(query) &&
        !app.slug.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // Status filter
    if (filter === 'all') return true
    if (filter === 'unchecked') {
      return !Object.values(app.checks).every(Boolean)
    }
    return app.releaseIntent === filter
  })

  // Calculate counts
  const counts = {
    all: appsData.apps.length,
    ready: appsData.apps.filter((a) => a.releaseIntent === 'ready').length,
    'needs-fix': appsData.apps.filter((a) => a.releaseIntent === 'needs-fix').length,
    hold: appsData.apps.filter((a) => a.releaseIntent === 'hold').length,
    released: appsData.apps.filter((a) => a.releaseIntent === 'released').length,
    unchecked: appsData.apps.filter(
      (a) => !Object.values(a.checks).every(Boolean)
    ).length,
  }

  if (!token) {
    return <GitHubSetup onTokenSave={setToken} />
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🐊</span>
            <div>
              <h1 className="text-2xl font-bold">ManyConnection Dashboard</h1>
              <p className="text-zinc-500">
                {appsData.apps.length}個のアプリ
                {saving && <span className="ml-2 text-yellow-500">保存中...</span>}
                {hasChanges && !saving && <span className="ml-2 text-zinc-400">未保存の変更あり</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadApps}
              disabled={loading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '読込中...' : '🔄 更新'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 アプリを検索..."
            className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-zinc-600 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        {/* App Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500">読み込み中...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            アプリが見つかりません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} onUpdate={handleAppUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
