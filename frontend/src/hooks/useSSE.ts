import { useEffect, useState, useCallback, useRef } from 'react';
import type { StreamEvent, ConnectionStatus } from '../types';

interface UseSSEOptions {
  url: string;
  onEvent?: (event: StreamEvent) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useSSE({
  url,
  onEvent,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
}: UseSSEOptions) {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    clientId: null,
    reconnectAttempts: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔌 Connecting to SSE:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setStatus((prev) => ({
        ...prev,
        connected: true,
        reconnectAttempts: 0,
      }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        
        // Handle connection event
        if (data.type === 'connected') {
          setStatus((prev) => ({
            ...prev,
            clientId: data.data?.client_id || null,
          }));
          console.log('🆔 Client ID:', data.data?.client_id);
          return;
        }

        // Call event handler
        onEvent?.(data);
      } catch (error) {
        console.error('❌ Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      
      setStatus((prev) => ({
        ...prev,
        connected: false,
      }));

      onError?.(error);

      // Auto-reconnect
      if (autoReconnect) {
        setStatus((prev) => {
          const attempts = prev.reconnectAttempts + 1;
          console.log(`🔄 Reconnecting... (attempt ${attempts})`);
          return { ...prev, reconnectAttempts: attempts };
        });

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };
  }, [url, onEvent, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting SSE');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStatus({
      connected: false,
      clientId: null,
      reconnectAttempts: 0,
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
  };
}