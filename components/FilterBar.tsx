'use client'

import { ReleaseIntent } from '@/lib/types'

interface FilterBarProps {
  activeFilter: ReleaseIntent | 'all' | 'unchecked'
  onFilterChange: (filter: ReleaseIntent | 'all' | 'unchecked') => void
  counts: Record<ReleaseIntent | 'all' | 'unchecked', number>
}

const filters: { key: ReleaseIntent | 'all' | 'unchecked'; label: string; emoji: string }[] = [
  { key: 'all', label: 'すべて', emoji: '📱' },
  { key: 'ready', label: 'リリース準備OK', emoji: '🚀' },
  { key: 'needs-fix', label: '修正必要', emoji: '🔧' },
  { key: 'hold', label: '保留', emoji: '⏸️' },
  { key: 'released', label: '公開済み', emoji: '✅' },
  { key: 'unchecked', label: '未確認あり', emoji: '⚠️' },
]

export default function FilterBar({ activeFilter, onFilterChange, counts }: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {filters.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeFilter === key
              ? 'bg-zinc-700 text-white'
              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>{emoji}</span>
          <span>{label}</span>
          <span className="bg-zinc-900/50 px-2 py-0.5 rounded-full text-xs">
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  )
}
