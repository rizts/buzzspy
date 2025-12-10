import { Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from '../types';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800">
      {status.connected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-sm text-green-400">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-400">
            Disconnected
            {status.reconnectAttempts > 0 && (
              <span className="ml-1 text-gray-400">
                (retry {status.reconnectAttempts})
              </span>
            )}
          </span>
        </>
      )}
      
      {status.clientId && (
        <span className="text-xs text-gray-500 ml-2">
          ID: {status.clientId.slice(0, 8)}
        </span>
      )}
    </div>
  );
}