"use client";

import { useEffect, useRef, useCallback } from "react";
import { Challenge } from "@/services/challenges";

import { API_BASE } from "@/config/api";

// Convert http(s) URL to ws(s) URL
const getWebSocketUrl = (apiUrl: string): string => {
  const wsUrl = apiUrl.replace(/^http/, "ws");
  return `${wsUrl}/challenges/ws`;
};

interface WebSocketMessage {
  type: string;
  challenge_id?: number;
  is_active?: boolean;
  challenge?: Challenge;
}

interface UseChallengeWebSocketOptions {
  onChallengeToggled?: (challengeId: number, isActive: boolean, challenge: Challenge) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Custom hook to manage WebSocket connection for real-time challenge updates
 * 
 * @param options - Callback functions for different WebSocket events
 * @returns WebSocket connection state
 */
export function useChallengeWebSocket(options: UseChallengeWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const { onChallengeToggled, onError, onConnect, onDisconnect } = options;

  const connect = useCallback(() => {
    try {
      const wsUrl = getWebSocketUrl(API_BASE);
      console.log("Connecting to WebSocket:", wsUrl);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        onConnect?.();
        
        // Send periodic pings to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 30000); // Every 30 seconds

        // Store interval ID to clear it later
        (ws as any).pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data.type) {
            case "challenge_toggled":
              if (data.challenge_id !== undefined && data.is_active !== undefined && data.challenge) {
                onChallengeToggled?.(data.challenge_id, data.is_active, data.challenge);
              }
              break;
            case "pong":
              // Connection alive confirmation
              break;
            default:
              console.log("Unknown WebSocket message type:", data.type);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        
        // Clear ping interval
        if ((ws as any).pingInterval) {
          clearInterval((ws as any).pingInterval);
        }
        
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error("Max reconnect attempts reached. Please refresh the page.");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
    }
  }, [onChallengeToggled, onError, onConnect, onDisconnect]);

  useEffect(() => {
    // Only connect if in browser environment
    if (typeof window !== "undefined") {
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        // Clear ping interval
        if ((wsRef.current as any).pingInterval) {
          clearInterval((wsRef.current as any).pingInterval);
        }
        
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}
