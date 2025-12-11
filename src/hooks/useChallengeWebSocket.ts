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
  onParticipantJoined?: (challengeId: number, challenge: Challenge) => void;
  onChallengeCreated?: (challenge: Challenge) => void;
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
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const { onChallengeToggled, onParticipantJoined, onChallengeCreated, onError, onConnect, onDisconnect } = options;

  const connect = useCallback((retryCount = 0) => {
    try {
      // Don't create a new connection if one already exists and is open
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }
      
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const wsUrl = getWebSocketUrl(API_BASE);
      console.log("Connecting to WebSocket:", wsUrl);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts
        isConnectedRef.current = true;
        
        // Only call onConnect if it's the initial connection, not a reconnect
        if (retryCount === 0) {
          onConnect?.();
        }
        
        // Clear existing ping interval if any
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        // Send periodic pings to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 30000); // Every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data.type) {
            case "challenge_toggled":
            case "challenge_updated":
              if (data.challenge_id !== undefined && data.is_active !== undefined && data.challenge) {
                onChallengeToggled?.(data.challenge_id, data.is_active, data.challenge);
              }
              break;
            case "participant_joined":
              if (data.challenge_id !== undefined && data.challenge) {
                onParticipantJoined?.(data.challenge_id, data.challenge);
              }
              break;
            case "challenge_created":
              if (data.challenge) {
                onChallengeCreated?.(data.challenge);
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
        isConnectedRef.current = false;
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        isConnectedRef.current = false;
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        onDisconnect?.();

        // Clear existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Exponential backoff with jitter (like Chrome extension)
        const baseDelay = Math.min(30000, Math.pow(2, retryCount) * 1000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`Reconnecting in ${Math.round(delay)}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(retryCount + 1);
        }, delay);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      isConnectedRef.current = false;
    }
  }, [onChallengeToggled, onParticipantJoined, onChallengeCreated, onError, onConnect, onDisconnect]);

  useEffect(() => {
    // Only connect if in browser environment
    if (typeof window !== "undefined") {
      connect(0);
    }

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      isConnectedRef.current = false;
    };
  }, [connect]);

  return {
    isConnected: isConnectedRef.current && wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}
