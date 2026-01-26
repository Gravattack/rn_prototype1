import { useState, useEffect, useCallback } from 'react';

export interface RunnerStatus {
    status: 'ready' | 'error' | 'disconnected';
    platforms: string[];
    simulators: string[];
    version: string;
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
                setStatus(data);

                // If we have a token in localStorage, we consider it connected
                const storedToken = localStorage.getItem('runner_token');
                if (storedToken) {
                    setToken(storedToken);
                    setPairingRequired(false);
                } else {
                    setPairingRequired(true);
                }
            } else {
                setStatus(prev => ({ ...prev, status: 'disconnected' }));
            }
        } catch (e) {
            console.error('[Helper] Local Runner connection failed:', e);
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
            } catch (e) {
                console.log(`[Runner Raw]`, event.data);
            }
        };

        return () => ws.close();
    }, [isConnected, token, sessionId]);

    const pair = (newToken: string) => {
        localStorage.setItem('runner_token', newToken);
        setToken(newToken);
        setPairingRequired(false);
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
        pair,
        runOnLocal,
        isConnected: status.status !== 'disconnected'
    };
}
