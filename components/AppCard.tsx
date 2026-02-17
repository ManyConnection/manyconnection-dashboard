'use client'

import { App, AppChecks, ReleaseIntent } from '@/lib/types'

interface AppCardProps {
  app: App
  onUpdate: (app: App) => void
}

const intentColors: Record<ReleaseIntent, string> = {
  ready: 'bg-green-500/20 text-green-400 border-green-500/50',
  'needs-fix': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  hold: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  released: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
}

const intentLabels: Record<ReleaseIntent, string> = {
  ready: '🚀 リリース準備OK',
  'needs-fix': '🔧 修正必要',
  hold: '⏸️ 保留',
  released: '✅ 公開済み',
}

export default function AppCard({ app, onUpdate }: AppCardProps) {
  const handleCheckChange = (key: keyof AppChecks) => {
    onUpdate({
      ...app,
      checks: {
        ...app.checks,
        [key]: !app.checks[key],
      },
      lastUpdated: new Date().toISOString(),
    })
  }

  const handleIntentChange = (intent: ReleaseIntent) => {
    onUpdate({
      ...app,
      releaseIntent: intent,
      lastUpdated: new Date().toISOString(),
    })
  }

  const handleNotesChange = (field: 'fixNotes' | 'testNotes', value: string) => {
    onUpdate({
      ...app,
      [field]: value,
      lastUpdated: new Date().toISOString(),
    })
  }

  const allChecksPassed = Object.values(app.checks).every(Boolean)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{app.emoji}</span>
          <div>
            <h3 className="font-semibold text-lg">{app.name}</h3>
            <p className="text-zinc-500 text-sm">{app.slug}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs border ${intentColors[app.releaseIntent]}`}>
          {intentLabels[app.releaseIntent]}
        </div>
      </div>

      {/* Release Intent Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(intentLabels) as ReleaseIntent[]).map((intent) => (
          <button
            key={intent}
            onClick={() => handleIntentChange(intent)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              app.releaseIntent === intent
                ? intentColors[intent]
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            {intentLabels[intent]}
          </button>
        ))}
      </div>

      {/* Checks */}
      <div className="mb-4">
        <p className="text-sm text-zinc-400 mb-2">動作確認チェック {allChecksPassed ? '✅' : ''}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'launch' as const, label: '起動確認' },
            { key: 'mainFeature' as const, label: '主要機能' },
            { key: 'ui' as const, label: 'UI確認' },
            { key: 'crashFree' as const, label: 'クラッシュなし' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={app.checks[key]}
                onChange={() => handleCheckChange(key)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500/50"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Fix Notes */}
      {app.releaseIntent === 'needs-fix' && (
        <div className="mb-4">
          <label className="text-sm text-zinc-400 block mb-1">修正メモ</label>
          <textarea
            value={app.fixNotes || ''}
            onChange={(e) => handleNotesChange('fixNotes', e.target.value)}
            placeholder="修正が必要な内容..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none h-20 focus:border-zinc-600 focus:outline-none"
          />
        </div>
      )}

      {/* Test Notes */}
      <div className="mb-4">
        <label className="text-sm text-zinc-400 block mb-1">テストメモ</label>
        <textarea
          value={app.testNotes || ''}
          onChange={(e) => handleNotesChange('testNotes', e.target.value)}
          placeholder="テスト結果のメモ..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      {/* Links */}
      <div className="flex gap-2 flex-wrap text-xs">
        {app.githubUrl && (
          <a
            href={app.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            GitHub
          </a>
        )}
        {app.testflightUrl && (
          <a
            href={app.testflightUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
          >
            TestFlight
          </a>
        )}
        {app.appStoreUrl && (
          <a
            href={app.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-colors"
          >
            App Store
          </a>
        )}
      </div>
    </div>
  )
}
