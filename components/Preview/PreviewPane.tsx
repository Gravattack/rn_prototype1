'use client';

import { Smartphone, Monitor, Wifi, Loader2, RotateCw, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLocalRunner } from '@/lib/state/useLocalRunner';
import DeviceFrame, { DeviceOrientation, DeviceType } from './DeviceFrame';

interface PreviewPaneProps {
    iframeContent: string;
}

export default function PreviewPane({ iframeContent }: PreviewPaneProps) {
    const hasContent = iframeContent.length > 0;
    const [mode, setMode] = useState<'web' | 'native'>('web');
    const [device, setDevice] = useState<DeviceType>('iphone-14');
    const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
    const [scale, setScale] = useState<number>(0.75);

    useEffect(() => {
        const updateScale = () => {
            const w = window.innerWidth;
            if (w < 480) return setScale(0.55);
            if (w < 768) return setScale(0.65);
            if (w < 1024) return setScale(0.7);
            return setScale(0.75);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);



    const [nativeMode, setNativeMode] = useState<'local' | 'appetize' | 'runner'>('runner');
    const [tunnelUrl, setTunnelUrl] = useState('');

    return (
        <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-950">
            {/* Preview Header */}
            <div className="flex h-12 flex-none items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {mode === 'web' ? (
                            <Monitor className="h-4 w-4 text-blue-500" />
                        ) : (
                            <Smartphone className="h-4 w-4 text-purple-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {mode === 'web' ? 'Web Preview' : 'Native Preview'}
                        </span>
                    </div>

                    <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800">
                        <button
                            onClick={() => setMode('web')}
                            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === 'web'
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Web
                        </button>
                        <button
                            onClick={() => setMode('native')}
                            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${mode === 'native'
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Native
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
                        className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Rotate"
                    >
                        <RotateCw className="h-4 w-4" />
                    </button>
                    <select
                        value={device}
                        onChange={(e) => setDevice(e.target.value as DeviceType)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <option value="iphone-14">iPhone 14</option>
                        <option value="pixel-7">Pixel 7</option>
                        <option value="ipad">iPad Air</option>
                    </select>
                </div>
            </div>

            {/* Sub-header for Native Mode */}
            {mode === 'native' && (
                <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex gap-4 text-xs font-medium">
                        <button
                            onClick={() => setNativeMode('appetize')}
                            className={`${nativeMode === 'appetize' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}
                        >
                            Online Simulator
                        </button>
                        <button
                            onClick={() => setNativeMode('runner')}
                            className={`${nativeMode === 'runner' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}
                        >
                            Local Runner
                        </button>
                        <button
                            onClick={() => setNativeMode('local')}
                            className={`${nativeMode === 'local' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}
                        >
                            Legacy Mirror
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="flex h-full min-w-0 items-start justify-center overflow-x-auto">
                    {mode === 'web' ? (
                        <DeviceFrame device={device} scale={scale} orientation={orientation}>
                            {hasContent ? (
                                <iframe
                                    title="preview"
                                    srcDoc={iframeContent}
                                    className="h-full w-full bg-white"
                                    sandbox="allow-scripts allow-same-origin"
                                    style={{ border: 'none', backgroundColor: '#ffffff' }}
                                />
                            ) : (
                                <EmptyState />
                            )}
                        </DeviceFrame>
                    ) : nativeMode === 'appetize' ? (
                        <DeviceFrame device={device} scale={scale} orientation={orientation}>
                            <AppetizePreview
                                tunnelUrl={tunnelUrl}
                                onTunnelUrlChange={setTunnelUrl}
                                device={device}
                            />
                        </DeviceFrame>
                    ) : nativeMode === 'runner' ? (
                        <DeviceFrame device={device} scale={scale} orientation={orientation}>
                            <LocalRunnerPreview />
                        </DeviceFrame>
                    ) : (
                        <DeviceFrame device={device} scale={scale} orientation={orientation}>
                            <NativePreview />
                        </DeviceFrame>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 p-4 text-center dark:bg-gray-900 md:p-8">
            <div className="mb-3 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30 md:mb-4 md:p-4">
                <Monitor className="h-7 w-7 text-blue-600 dark:text-blue-400 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white md:mb-2 md:text-lg">Ready to Run</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                Click the &quot;Run&quot; button to see your changes locally.
            </p>
        </div>
    );
}

function AppetizePreview({
    tunnelUrl,
    onTunnelUrlChange,
    device
}: {
    tunnelUrl: string,
    onTunnelUrlChange: (url: string) => void,
    device: DeviceType
}) {
    const [isRunning, setIsRunning] = useState(false);

    // Expo Go Public Key (Standard one often used for demos)
    // Note: This often requires a paid plan for extended usage, or might hit limits.
    // For V1 we use the generic one.
    const PUBLIC_KEY = '8bnmkzafhkebytxaq5wbhh8d90';

    const appetizeDevice = device === 'iphone-14' ? 'iphone14pro' : device === 'pixel-7' ? 'pixel7' : 'ipadair';
    const osVersion = device === 'iphone-14' ? '16.2' : '15.0';

    const launchUrl = isRunning && tunnelUrl ? tunnelUrl : '';

    // Construct Embed URL
    // https://appetize.io/embed/<public-key>?device=<device>&osVersion=<version>&launchUrl=<exp_url>&autoplay=true
    const embedUrl = `https://appetize.io/embed/${PUBLIC_KEY}?device=${appetizeDevice}&osVersion=${osVersion}&scale=100&autoplay=true&orientation=portrait&deviceColor=black&launchUrl=${encodeURIComponent(launchUrl)}`;

    if (isRunning && tunnelUrl) {
        return (
            <div className="relative h-full w-full bg-black">
                <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-black/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-white">Appetize Cloud</span>
                    </div>
                    <button
                        onClick={() => setIsRunning(false)}
                        className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20"
                    >
                        Stop
                    </button>
                </div>
                <iframe
                    title="appetize"
                    src={embedUrl}
                    className="h-full w-full bg-black"
                    frameBorder="0"
                    scrolling="no"
                />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-950 p-6 text-center">
            <div className="mb-4 rounded-full bg-purple-900/30 p-4">
                <Smartphone className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">Appetize.io Simulator</h3>
            <p className="mb-6 text-sm text-gray-400">
                Stream an iOS/Android device in the browser.
                <br />
                Requires <b>Expo Tunnel URL</b> to reach your local code.
            </p>

            <div className="w-full max-w-xs space-y-3">
                <div className="text-left">
                    <label className="text-xs font-medium text-gray-400">1. Run with Tunnel</label>
                    <code className="mt-1 block rounded bg-gray-900 px-2 py-1 text-xs text-green-400">
                        npx expo start --tunnel
                    </code>
                </div>

                <div className="text-left">
                    <label className="text-xs font-medium text-gray-400">2. Paste Expo URL (exp://...)</label>
                    <input
                        type="text"
                        value={tunnelUrl}
                        onChange={(e) => onTunnelUrlChange(e.target.value)}
                        placeholder="exp://..."
                        className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={() => setIsRunning(true)}
                    disabled={!tunnelUrl.startsWith('exp://')}
                    className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Launch Simulator
                </button>
            </div>
        </div>
    );
}

const NativePreview = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [mirrorEnabled, setMirrorEnabled] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const startCoords = useRef<{ x: number, y: number } | null>(null);



    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        startCoords.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseUp = async (e: React.MouseEvent) => {
        if (!imgRef.current || !startCoords.current) return;

        const img = imgRef.current;
        const rect = img.getBoundingClientRect();

        // Logical resolution for iPhone 16 Plus (430x932)
        const SIM_WIDTH = 430;
        const SIM_HEIGHT = 932;

        const containerWidth = rect.width;
        const containerHeight = rect.height;
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        if (!imageWidth || !imageHeight) return;

        const containerRatio = containerWidth / containerHeight;
        const imageRatio = imageWidth / imageHeight;

        let actualWidth, actualHeight, offsetX, offsetY;

        if (imageRatio > containerRatio) {
            actualWidth = containerWidth;
            actualHeight = containerWidth / imageRatio;
            offsetX = 0;
            offsetY = (containerHeight - actualHeight) / 2;
        } else {
            actualHeight = containerHeight;
            actualWidth = containerHeight * imageRatio;
            offsetY = 0;
            offsetX = (containerWidth - actualWidth) / 2;
        }

        const getSimCoords = (clientX: number, clientY: number) => {
            const relX = clientX - rect.left - offsetX;
            const relY = clientY - rect.top - offsetY;

            return {
                x: (relX / actualWidth) * SIM_WIDTH,
                y: (relY / actualHeight) * SIM_HEIGHT
            };
        };

        const endX = e.clientX;
        const endY = e.clientY;

        const dx = endX - (startCoords.current.x + rect.left);
        const dy = endY - (startCoords.current.y + rect.top);

        if (Math.sqrt(dx * dx + dy * dy) > 10) {
            const start = getSimCoords(startCoords.current.x + rect.left, startCoords.current.y + rect.top);
            const end = getSimCoords(endX, endY);

            try {
                const res = await fetch('/api/native/gesture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'swipe', x1: start.x, y1: start.y, x2: end.x, y2: end.y }),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error('Failed to send swipe:', errorData);
                }
            } catch (err) {
                console.error('Failed to send swipe:', err);
            }
        } else {
            const tap = getSimCoords(endX, endY);
            try {
                const res = await fetch('/api/native/gesture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'tap', x: tap.x, y: tap.y }),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error('Failed to send tap:', errorData);
                }
            } catch (err) {
                console.error('Failed to send tap:', err);
            }
        }

        startCoords.current = null;
    };

    useEffect(() => {
        if (!mirrorEnabled) return;

        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const fetchScreenshot = async () => {
            try {
                // Add timestamp to bust cache
                const res = await fetch(`/api/native/screenshot?t=${Date.now()}`);
                if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);

                    if (isMounted) {
                        setImageUrl((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return url;
                        });
                        // Poll every 1000ms (1 fps) to balance load
                        timeoutId = setTimeout(fetchScreenshot, 1000);
                    }
                } else {
                    // If error (e.g., sim not found), retry slower
                    if (isMounted) timeoutId = setTimeout(fetchScreenshot, 3000);
                }
            } catch (e) {
                if (isMounted) timeoutId = setTimeout(fetchScreenshot, 3000);
            }
        };

        fetchScreenshot();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [mirrorEnabled]);

    if (mirrorEnabled) {
        return (
            <div className="relative h-full w-full bg-black">
                <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-black/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-white">Local Mirror (Active)</span>
                    </div>
                    <button
                        onClick={() => setMirrorEnabled(false)}
                        className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20"
                    >
                        Stop
                    </button>
                </div>

                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        ref={imgRef}
                        src={imageUrl}
                        alt="Simulator Mirror"
                        className="h-full w-full object-contain bg-black cursor-pointer select-none"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onDragStart={(e) => e.preventDefault()}
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <p className="mt-4 text-xs text-gray-400">Connecting to Simulator...</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 p-6 text-center">
            <div className="mb-4 rounded-full bg-purple-900/30 p-4">
                <Smartphone className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">Local Native Mirror</h3>
            <p className="mb-6 text-sm text-gray-400">
                Mirror your local iOS Simulator to this window.
                <br />
                Requires running <code>npm run ios</code> locally.
            </p>
            <button
                onClick={() => setMirrorEnabled(true)}
                className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
                Start Mirroring
            </button>
        </div>
    );
};

function LocalRunnerPreview() {
    const { status, pairingRequired, pair, isConnected, token } = useLocalRunner();
    const [inputToken, setInputToken] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const RUNNER_URL = process.env.NEXT_PUBLIC_RUNNER_URL || 'http://127.0.0.1:3001';

    useEffect(() => {
        if (!isConnected || pairingRequired || !token) return;

        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const fetchScreenshot = async () => {
            try {
                const res = await fetch(`${RUNNER_URL}/screenshot?t=${Date.now()}`, {
                    headers: { 'X-Runner-Token': token }
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);

                    if (isMounted) {
                        setImageUrl((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return url;
                        });
                        // 1 FPS (1000ms) is plenty for most dev tasks and reduces CPU
                        timeoutId = setTimeout(fetchScreenshot, 1000);
                    }
                } else {
                    // Back off if runner is busy or errored
                    if (isMounted) timeoutId = setTimeout(fetchScreenshot, 2000);
                }
            } catch (e) {
                if (isMounted) timeoutId = setTimeout(fetchScreenshot, 5000);
            }
        };

        fetchScreenshot();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [isConnected, pairingRequired, token, RUNNER_URL]);

    if (!isConnected) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-950 p-6 text-center">
                <div className="mb-4 rounded-full bg-red-900/30 p-4">
                    <Wifi className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">Runner Disconnected</h3>
                <p className="mb-6 text-sm text-gray-400">
                    The Local Runner is not running on your machine.
                    <br />
                    Run the following command in your terminal:
                </p>
                <code className="block w-full rounded bg-gray-900 px-4 py-3 text-left text-xs text-green-400">
                    npx @rn-playground/runner
                </code>
            </div>
        );
    }

    if (status.error) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-950 p-6 text-center">
                <div className="mb-4 rounded-full bg-red-900/30 p-4">
                    <Settings className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">{status.error.message}</h3>
                {status.error.action && (
                    <p className="mb-6 text-sm text-gray-400">
                        <b>Suggestion:</b> {status.error.action}
                    </p>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (pairingRequired) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-950 p-6 text-center">
                <div className="mb-4 rounded-full bg-yellow-900/30 p-4">
                    <Smartphone className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">Pair with Runner</h3>
                <p className="mb-6 text-sm text-gray-400">
                    Enter the token displayed in your terminal to securely connect.
                </p>
                <div className="w-full max-w-xs space-y-3">
                    <input
                        type="text"
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        placeholder="Paste token here..."
                        className="block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                        onClick={() => pair(inputToken)}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Connect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-black">
            <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-black/70 px-3 py-2">
                <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-white">Local Runner (Active)</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{status.simulators[0]}</span>
            </div>

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Simulator Mirror"
                    className="h-full w-full object-contain bg-black select-none pointer-events-none"
                    onDragStart={(e) => e.preventDefault()}
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="mt-4 text-xs text-gray-400">Connecting to Simulator screen...</p>
                </div>
            )}
        </div>
    );
}
