'use client'

import { useState } from 'react'

interface GitHubSetupProps {
  onTokenSave: (token: string) => void
}

export default function GitHubSetup({ onTokenSave }: GitHubSetupProps) {
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      localStorage.setItem('github_token', token.trim())
      onTokenSave(token.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-5xl">🐊</span>
          <h1 className="text-2xl font-bold mt-4">ManyConnection Dashboard</h1>
          <p className="text-zinc-500 mt-2">GitHub Personal Access Tokenを設定</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">
              GitHub Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxx..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-zinc-600 focus:outline-none"
              autoFocus
            />
          </div>

          <p className="text-xs text-zinc-500 mb-4">
            リポジトリへの読み書き権限が必要です。
            <a
              href="https://github.com/settings/tokens/new?scopes=repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline ml-1"
            >
              Token作成
            </a>
          </p>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-lg transition-colors"
          >
            保存して開始
          </button>
        </form>
      </div>
    </div>
  )
}
