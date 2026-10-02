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
          dotClass: isSynced ? 'bg-[#919D85] shadow-[#919D85]/50' : 'bg-[#8E88A3] animate-pulse',
          textClass: 'text-[#382D27]',
          bgClass: 'bg-[#FFF9EB] border-[#E5DAC2]',
          label: isSynced ? 'Synced live' : 'Syncing...',
          tooltip: 'Connected to WebSocket relay. Operations are converging in real-time.',
        }
      case 'connecting':
        return {
          dotClass: 'bg-[#8E88A3] animate-pulse',
          textClass: 'text-[#81785A]',
          bgClass: 'bg-[#EBE1C6]/30 border-[#E5DAC2]',
          label: 'Connecting...',
          tooltip: 'Reconnecting to relay server...',
        }
      case 'disconnected':
      default:
        return {
          dotClass: 'bg-[#5D0D18]',
          textClass: 'text-[#5D0D18]',
          bgClass: 'bg-[#C496A1]/15 border-[#C496A1]/40',
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
        <span className="ml-1 px-1.5 py-0.2 bg-[#C496A1]/25 rounded-md text-[10px] font-bold text-[#5D0D18]">
          {collaboratorCount} online
        </span>
      )}
    </div>
  )
}