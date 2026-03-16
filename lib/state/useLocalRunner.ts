import { useState, useEffect, useCallback } from 'react';

export interface RunnerStatus {
    status: 'ready' | 'error' | 'disconnected';
    platforms: string[];
    simulators: string[];
    version: string;
    runnerId?: string;
    capabilities?: {
        mirror: string[];
        logs: string[];
    };
    error?: {
        code: string;
        message: string;
        action?: string;
    };
}

export function useLocalRunner() {
    const [status, setStatus] = useState<RunnerStatus>({
        status: 'disconnected',
        platforms: [],
        simulators: [],
        version: ''
    });
    const [token, setToken] = useState<string | null>(null);
    const [pairingRequired, setPairingRequired] = useState(false);
    const [runnerRestarted, setRunnerRestarted] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const isConnected = status.status !== 'disconnected';

    // Initialize/Load Session ID
    useEffect(() => {
        let sid = sessionStorage.getItem('runner_session_id');
        if (!sid) {
            sid = Math.random().toString(36).substring(2, 11);
            sessionStorage.setItem('runner_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    const RUNNER_URL = 'http://127.0.0.1:3001';

    const checkHealth = useCallback(async () => {
        try {
            const res = await fetch(`${RUNNER_URL}/health`);
            if (res.ok) {
                const data = await res.json();

                // Token validation: token is ONLY valid if we have matching runnerId
                const storedRunnerId = localStorage.getItem('runner_id');
                const storedToken = localStorage.getItem('runner_token');
                const currentRunnerId = data.runnerId;

                // Token is valid ONLY if both runnerId match
                const tokenIsValid = storedToken && storedRunnerId && currentRunnerId && storedRunnerId === currentRunnerId;

                if (storedToken && !tokenIsValid) {
                    // We have a token but it's invalid (no runnerId stored, or runnerId mismatch)
                    localStorage.removeItem('runner_token');
                    localStorage.removeItem('runner_id');
                    setToken(null);
                    setPairingRequired(true);
                    // Only show "restarted" message if we had a previous runnerId (not first-time pairing)
                    setRunnerRestarted(!!storedRunnerId);
                } else if (tokenIsValid) {
                    // Token is valid - use it
                    setToken(storedToken);
                    setPairingRequired(false);
                    setRunnerRestarted(false);
                } else {
                    // No stored token - need pairing
                    setPairingRequired(true);
                    setRunnerRestarted(false);
                }

                // Map runner health response to status
                setStatus({
                    status: data.ok ? 'ready' : 'error',
                    platforms: [data.platform || 'ios'],
                    simulators: data.simulator === 'booted' ? [data.simulatorName || 'iOS Simulator'] : [],
                    version: data.runnerVersion || '0.2.0',
                    runnerId: currentRunnerId,
                    capabilities: {
                        mirror: ['screenshot'],
                        logs: ['websocket']
                    }
                });
            } else {
                setStatus(prev => ({ ...prev, status: 'disconnected' }));
            }
        } catch {
            // Silently handle - runner not running is expected
            setStatus(prev => ({ ...prev, status: 'disconnected' }));
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(checkHealth, 5000);
        checkHealth();
        return () => clearInterval(interval);
    }, [checkHealth]);

    // WebSocket Log Stream
    useEffect(() => {
        if (!isConnected || !token || !sessionId) return;

        const ws = new WebSocket(`ws://127.0.0.1:3001/logs?sessionId=${sessionId}`);

        ws.onmessage = (event) => {
            try {
                const log = JSON.parse(event.data);
                console.log(`[Runner Log]`, log);
            } catch {
                console.log(`[Runner Raw]`, event.data);
            }
        };

        return () => ws.close();
    }, [isConnected, token, sessionId]);

    /**
     * Pair with the runner using the displayed token.
     * Stores both token AND runnerId to detect future restarts.
     */
    const pair = (newToken: string) => {
        localStorage.setItem('runner_token', newToken);
        // Store current runnerId with the token
        if (status.runnerId) {
            localStorage.setItem('runner_id', status.runnerId);
        }
        setToken(newToken);
        setPairingRequired(false);
        setRunnerRestarted(false);
    };

    const runOnLocal = async (files: Record<string, string>) => {
        if (!token) return;

        try {
            // 1. Sync files
            const syncRes = await fetch(`${RUNNER_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Runner-Token': token
                },
                body: JSON.stringify({ sessionId, files })
            });
            if (!syncRes.ok) throw await syncRes.json();

            // 2. Run
            const runRes = await fetch(`${RUNNER_URL}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Runner-Token': token
                },
                body: JSON.stringify({ sessionId })
            });
            const data = await runRes.json();
            if (!runRes.ok) throw data;

            return data;
        } catch (error) {
            console.error('Local run failed:', error);
            throw error;
        }
    };

    return {
        status,
        token,
        sessionId,
        pairingRequired,
        runnerRestarted,
        pair,
        runOnLocal,
        isConnected: status.status !== 'disconnected'
    };
}
