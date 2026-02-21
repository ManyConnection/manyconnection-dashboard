'use client'

import { useState, useEffect } from 'react'

interface E2ETest {
  passed: number
  failed: number
  total: number
  lastRun: string
  status: 'passed' | 'failed' | 'pending'
  githubResultsUrl?: string
}

interface AppTest {
  id: number
  name: string
  emoji: string
  githubUrl?: string
  checks: {
    launch: boolean
    mainFeature: boolean
    ui: boolean
    crashFree: boolean
  }
  e2eTests?: E2ETest
}

export default function TestsPage() {
  const [apps, setApps] = useState<AppTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/apps.json')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        const transformed = (data.apps || []).map((app: any) => ({
          id: app.id,
          name: app.name,
          emoji: app.emoji,
          githubUrl: app.githubUrl,
          checks: app.checks || {
            launch: false,
            mainFeature: false,
            ui: false,
            crashFree: false
          },
          e2eTests: app.e2eTests
        }))
        setApps(transformed)
      } catch (err) {
        console.error('Failed to load apps:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const appsWithTests = apps.filter(app => app.e2eTests)
  const appsWithoutTests = apps.filter(app => !app.e2eTests)
  
  const totalPassed = appsWithTests.reduce((sum, app) => sum + (app.e2eTests?.passed || 0), 0)
  const totalFailed = appsWithTests.reduce((sum, app) => sum + (app.e2eTests?.failed || 0), 0)
  const totalTests = appsWithTests.reduce((sum, app) => sum + (app.e2eTests?.total || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">🧪</span>
          <div>
            <h1 className="text-2xl font-bold">E2E テスト結果</h1>
            <p className="text-zinc-500">
              {apps.length}個のアプリ • {appsWithTests.length}個テスト済み
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-sm">総テスト数</p>
            <p className="text-3xl font-bold">{totalTests}</p>
          </div>
          <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4">
            <p className="text-green-400 text-sm">成功</p>
            <p className="text-3xl font-bold text-green-400">{totalPassed}</p>
          </div>
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
            <p className="text-red-400 text-sm">失敗</p>
            <p className="text-3xl font-bold text-red-400">{totalFailed}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-sm">テスト済みアプリ</p>
            <p className="text-3xl font-bold">{appsWithTests.length}/{apps.length}</p>
          </div>
        </div>

        {/* Apps with Tests */}
        {appsWithTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">✅ テスト済みアプリ</h2>
            <div className="space-y-3">
              {appsWithTests.map(app => (
                <div 
                  key={app.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.emoji}</span>
                    <div>
                      <h3 className="font-semibold">{app.name}</h3>
                      <p className="text-zinc-500 text-sm">
                        最終実行: {app.e2eTests?.lastRun ? new Date(app.e2eTests.lastRun).toLocaleString('ja-JP') : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Test Results */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        app.e2eTests?.status === 'passed' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {app.e2eTests?.passed || 0} passed
                      </span>
                      {(app.e2eTests?.failed || 0) > 0 && (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400">
                          {app.e2eTests?.failed} failed
                        </span>
                      )}
                    </div>

                    {/* Checks */}
                    <div className="flex gap-1">
                      <span title="起動確認" className={app.checks.launch ? 'text-green-400' : 'text-zinc-600'}>🚀</span>
                      <span title="主要機能" className={app.checks.mainFeature ? 'text-green-400' : 'text-zinc-600'}>⚡</span>
                      <span title="UI確認" className={app.checks.ui ? 'text-green-400' : 'text-zinc-600'}>🎨</span>
                      <span title="クラッシュなし" className={app.checks.crashFree ? 'text-green-400' : 'text-zinc-600'}>🛡️</span>
                    </div>

                    {/* Links */}
                    <div className="flex gap-2">
                      {app.e2eTests?.githubResultsUrl && (
                        <a
                          href={app.e2eTests.githubResultsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                        >
                          📄 結果XML
                        </a>
                      )}
                      {app.githubUrl && (
                        <a
                          href={`${app.githubUrl}/tree/main/e2e`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                        >
                          🧪 テストコード
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apps without Tests */}
        {appsWithoutTests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-zinc-500">⏳ 未テスト ({appsWithoutTests.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {appsWithoutTests.map(app => (
                <div 
                  key={app.id}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 text-center opacity-60"
                >
                  <span className="text-2xl">{app.emoji}</span>
                  <p className="text-sm text-zinc-500 mt-1 truncate">{app.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← ダッシュボードに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
