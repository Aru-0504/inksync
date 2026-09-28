'use client'

import { ConnectionStatusType } from '@/hooks/useYjsRoom'

interface ConnectionStatusProps {
  status: ConnectionStatusType
  isSynced?: boolean
  collaboratorCount?: number
}

export default function ConnectionStatus({
  status,
  isSynced = true,
  collaboratorCount = 1,
}: ConnectionStatusProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'connected':
        return {
          dotClass: isSynced ? 'bg-[#96B3CE] shadow-[#96B3CE]/50' : 'bg-[#F6DF88] animate-pulse',
          textClass: 'text-[#2D2327]',
          bgClass: 'bg-white border-[#EDE8E1]',
          label: isSynced ? 'Synced live' : 'Syncing...',
          tooltip: 'Connected to WebSocket relay. Operations are converging in real-time.',
        }
      case 'connecting':
        return {
          dotClass: 'bg-[#F6DF88] animate-pulse',
          textClass: 'text-[#8C5D14]',
          bgClass: 'bg-[#F6DF88]/20 border-[#F6DF88]',
          label: 'Connecting...',
          tooltip: 'Reconnecting to relay server...',
        }
      case 'disconnected':
      default:
        return {
          dotClass: 'bg-[#D48C70]',
          textClass: 'text-[#9A4C32]',
          bgClass: 'bg-[#D48C70]/15 border-[#D48C70]/40',
          label: 'Offline (Local CRDT)',
          tooltip: 'Changes are cached in IndexedDB and will merge automatically upon reconnecting.',
        }
    }
  }

  const config = getBadgeConfig()

  return (
    <div
      title={config.tooltip}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${config.bgClass} ${config.textClass}`}
    >
      <span className={`w-2 h-2 rounded-full shadow-xs ${config.dotClass}`} />
      <span>{config.label}</span>
      {status === 'connected' && collaboratorCount > 1 && (
        <span className="ml-1 px-1.5 py-0.2 bg-[#96B3CE]/30 rounded-md text-[10px] font-bold text-[#2D2327]">
          {collaboratorCount} online
        </span>
      )}
    </div>
  )
}