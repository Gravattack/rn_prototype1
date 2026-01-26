'use client';

import React from 'react';

export type DeviceType = 'iphone-14' | 'pixel-7' | 'ipad';

export type DeviceOrientation = 'portrait' | 'landscape';

interface DeviceFrameProps {
    children: React.ReactNode;
    device: DeviceType;
    scale?: number;
    orientation?: DeviceOrientation;
}

export default function DeviceFrame({ children, device, scale = 1, orientation = 'portrait' }: DeviceFrameProps) {
    const rotation = orientation === 'landscape' ? ' rotate(90deg)' : '';
    const style = {
        transform: `scale(${scale})${rotation}`,
        transformOrigin: orientation === 'landscape' ? 'center center' : 'top center',
    };

    if (device === 'iphone-14') {
        return (
            <div style={style} className="relative mx-auto h-[844px] w-[390px] rounded-[55px] border-[14px] border-gray-900 bg-gray-900 shadow-xl ring-1 ring-gray-900/50 transition-transform">
                <div className="absolute left-1/2 top-0 z-10 h-[32px] w-[120px] -translate-x-1/2 rounded-b-[18px] bg-gray-900"></div>
                {/* Safe Area / Screen */}
                <div className="h-full w-full overflow-hidden rounded-[42px] bg-white dark:bg-white">
                    {children}
                </div>
                {/* Buttons */}
                <div className="absolute -left-[17px] top-[100px] h-[32px] w-[3px] rounded-l-lg bg-gray-800"></div>
                <div className="absolute -left-[17px] top-[145px] h-[64px] w-[3px] rounded-l-lg bg-gray-800"></div>
                <div className="absolute -right-[17px] top-[120px] h-[96px] w-[3px] rounded-r-lg bg-gray-800"></div>
            </div>
        );
    }

    if (device === 'pixel-7') {
        return (
            <div style={style} className="relative mx-auto h-[860px] w-[400px] rounded-[24px] border-[12px] border-gray-900 bg-gray-900 shadow-xl ring-1 ring-gray-900/50 transition-transform">
                <div className="absolute left-1/2 top-4 z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-black"></div>
                <div className="h-full w-full overflow-hidden rounded-[12px] bg-white dark:bg-white">
                    {children}
                </div>
                <div className="absolute -right-[15px] top-[100px] h-[40px] w-[3px] rounded-r-lg bg-gray-800"></div>
                <div className="absolute -right-[15px] top-[160px] h-[80px] w-[3px] rounded-r-lg bg-gray-800"></div>
            </div>
        );
    }

    // Fallback / iPad (Simple)
    return (
        <div style={style} className="relative mx-auto h-[90%] w-full max-w-2xl rounded-xl border-[12px] border-gray-800 bg-gray-800 shadow-2xl transition-transform">
            <div className="h-full w-full overflow-hidden rounded-md bg-white dark:bg-white">
                {children}
            </div>
        </div>
    );
}
