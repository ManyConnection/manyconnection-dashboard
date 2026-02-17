'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { App, ReleaseIntent } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import AppCard from './AppCard'
import FilterBar from './FilterBar'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apps, setApps] = useState<App[]>([])
  const [filter, setFilter] = useState<ReleaseIntent | 'all' | 'unchecked'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingUpdates, setPendingUpdates] = useState<Map<number, App>>(new Map())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load apps from Supabase
  const loadApps = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('id')
    
    if (error) {
      console.error('Error loading apps:', error)
    } else {
      setApps(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  // Save pending updates
  const savePendingUpdates = useCallback(async () => {
    if (pendingUpdates.size === 0) return
    
    setSaving(true)
    const updates = Array.from(pendingUpdates.values())
    
    for (const app of updates) {
      const { error } = await supabase
        .from('apps')
        .update({
          release_intent: app.release_intent,
          fix_notes: app.fix_notes,
          check_launch: app.check_launch,
          check_main_feature: app.check_main_feature,
          check_ui: app.check_ui,
          check_crash_free: app.check_crash_free,
          test_notes: app.test_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', app.id)
      
      if (error) {
        console.error('Error updating app:', error)
      }
    }
    
    setPendingUpdates(new Map())
    setSaving(false)
  }, [pendingUpdates])

  // Debounced auto-save
  useEffect(() => {
    if (pendingUpdates.size > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(savePendingUpdates, 1500)
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [pendingUpdates, savePendingUpdates])

  const handleAppUpdate = (updatedApp: App) => {
    // Update local state immediately
    setApps((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    )
    // Queue for save
    setPendingUpdates((prev) => {
      const next = new Map(prev)
      next.set(updatedApp.id, updatedApp)
      return next
    })
  }

  // Filter apps
  const filteredApps = apps.filter((app) => {
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
      return !(app.check_launch && app.check_main_feature && app.check_ui && app.check_crash_free)
    }
    return app.release_intent === filter
  })

  // Calculate counts
  const counts = {
    all: apps.length,
    ready: apps.filter((a) => a.release_intent === 'ready').length,
    'needs-fix': apps.filter((a) => a.release_intent === 'needs-fix').length,
    hold: apps.filter((a) => a.release_intent === 'hold').length,
    released: apps.filter((a) => a.release_intent === 'released').length,
    unchecked: apps.filter(
      (a) => !(a.check_launch && a.check_main_feature && a.check_ui && a.check_crash_free)
    ).length,
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
                {apps.length}個のアプリ
                {saving && <span className="ml-2 text-yellow-500">保存中...</span>}
                {pendingUpdates.size > 0 && !saving && (
                  <span className="ml-2 text-zinc-400">未保存: {pendingUpdates.size}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={loadApps}
            disabled={loading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '読込中...' : '🔄 更新'}
          </button>
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
