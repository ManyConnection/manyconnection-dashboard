'use client'

import { useState, useEffect } from 'react'

interface TestCase {
  id: string
  name: string
  category: string
  status: 'passed' | 'failed'
  duration: string
  screenshot?: string
}

interface E2ETest {
  passed: number
  failed: number
  total: number
  lastRun: string
  status: 'passed' | 'failed' | 'pending'
  testCases?: TestCase[]
}

interface AppTest {
  id: number
  name: string
  slug: string
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
  const [selectedApp, setSelectedApp] = useState<AppTest | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/apps.json')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const transformed = (data.apps || []).map((app: any) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
          emoji: app.emoji,
          githubUrl: app.githubUrl,
          checks: app.checks || { launch: false, mainFeature: false, ui: false, crashFree: false },
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-zinc-950 text-white">
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
            <p className="text-zinc-500 text-sm">テスト済み</p>
            <p className="text-3xl font-bold">{appsWithTests.length}/{apps.length}</p>
          </div>
        </div>

        {/* Apps with Tests */}
        {appsWithTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">✅ テスト済みアプリ</h2>
            <div className="space-y-4">
              {appsWithTests.map(app => (
                <div 
                  key={app.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                >
                  {/* App Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50"
                    onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
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
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        app.e2eTests?.status === 'passed' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {app.e2eTests?.passed}/{app.e2eTests?.total} passed
                      </span>
                      <span className="text-zinc-500">
                        {selectedApp?.id === app.id ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Test Cases Detail */}
                  {selectedApp?.id === app.id && app.e2eTests?.testCases && (
                    <div className="border-t border-zinc-800 p-4">
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3">テストケース一覧</h4>
                      <div className="space-y-3">
                        {app.e2eTests.testCases.map(tc => (
                          <div 
                            key={tc.id}
                            className="bg-zinc-800/50 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`w-2 h-2 rounded-full ${
                                    tc.status === 'passed' ? 'bg-green-400' : 'bg-red-400'
                                  }`} />
                                  <span className="text-xs text-zinc-500">{tc.id}</span>
                                  <span className="text-xs text-zinc-600">|</span>
                                  <span className="text-xs text-zinc-500">{tc.category}</span>
                                </div>
                                <p className="font-medium">{tc.name}</p>
                                <p className="text-xs text-zinc-500 mt-1">実行時間: {tc.duration}</p>
                              </div>
                              {tc.screenshot && (
                                <button
                                  onClick={() => setSelectedScreenshot(tc.screenshot!)}
                                  className="ml-4 flex-shrink-0"
                                >
                                  <img 
                                    src={tc.screenshot} 
                                    alt={`${tc.id} screenshot`}
                                    className="w-16 h-28 object-cover rounded border border-zinc-700 hover:border-zinc-500 transition-colors"
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apps without Tests */}
        {appsWithoutTests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-zinc-500">⏳ 未テスト ({appsWithoutTests.length})</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {appsWithoutTests.map(app => (
                <div 
                  key={app.id}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 text-center opacity-60"
                >
                  <span className="text-2xl">{app.emoji}</span>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{app.name}</p>
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

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-md max-h-full">
            <img 
              src={selectedScreenshot} 
              alt="Screenshot"
              className="max-h-[80vh] rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
