'use client'

import { useState } from 'react'
import { App, ReleaseIntent } from '@/lib/types'

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
  const [iconError, setIconError] = useState(false)

  const getIconUrl = () => {
    if (!app.github_url) return null
    return `https://raw.githubusercontent.com/${app.github_url.replace('https://github.com/', '')}/main/assets/icon.png`
  }

  const handleCheckChange = (key: 'check_launch' | 'check_main_feature' | 'check_ui' | 'check_crash_free') => {
    onUpdate({
      ...app,
      [key]: !app[key],
    })
  }

  const handleIntentChange = (intent: ReleaseIntent) => {
    onUpdate({
      ...app,
      release_intent: intent,
    })
  }

  const handleNotesChange = (field: 'fix_notes' | 'test_notes', value: string) => {
    onUpdate({
      ...app,
      [field]: value,
    })
  }

  const allChecksPassed = app.check_launch && app.check_main_feature && app.check_ui && app.check_crash_free

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIconUrl() && !iconError ? (
            <img 
              src={getIconUrl()!}
              alt={app.name} 
              className="w-12 h-12 rounded-xl object-cover"
              onError={() => setIconError(true)}
            />
          ) : (
            <span className="text-3xl">{app.emoji}</span>
          )}
          <div>
            <h3 className="font-semibold text-lg">{app.name}</h3>
            <p className="text-zinc-500 text-sm">{app.slug}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs border ${intentColors[app.release_intent]}`}>
          {intentLabels[app.release_intent]}
        </div>
      </div>

      {/* Release Intent Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(intentLabels) as ReleaseIntent[]).map((intent) => (
          <button
            key={intent}
            onClick={() => handleIntentChange(intent)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              app.release_intent === intent
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
            { key: 'check_launch' as const, label: '起動確認' },
            { key: 'check_main_feature' as const, label: '主要機能' },
            { key: 'check_ui' as const, label: 'UI確認' },
            { key: 'check_crash_free' as const, label: 'クラッシュなし' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={app[key]}
                onChange={() => handleCheckChange(key)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500/50"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Fix Notes */}
      {app.release_intent === 'needs-fix' && (
        <div className="mb-4">
          <label className="text-sm text-zinc-400 block mb-1">修正メモ</label>
          <textarea
            value={app.fix_notes || ''}
            onChange={(e) => handleNotesChange('fix_notes', e.target.value)}
            placeholder="修正が必要な内容..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none h-20 focus:border-zinc-600 focus:outline-none"
          />
        </div>
      )}

      {/* Test Notes */}
      <div className="mb-4">
        <label className="text-sm text-zinc-400 block mb-1">テストメモ</label>
        <textarea
          value={app.test_notes || ''}
          onChange={(e) => handleNotesChange('test_notes', e.target.value)}
          placeholder="テスト結果のメモ..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      {/* Links */}
      <div className="flex gap-2 flex-wrap text-xs">
        {app.github_url && (
          <a
            href={app.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            GitHub
          </a>
        )}
        {app.testflight_url && (
          <a
            href={app.testflight_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
          >
            TestFlight
          </a>
        )}
        {app.appstore_url && (
          <a
            href={app.appstore_url}
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
