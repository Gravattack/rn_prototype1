import Link from 'next/link';
import { ArrowRight, Check, Terminal, AlertCircle } from 'lucide-react';

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <Link href="/" className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                        RN Playground
                    </span>
                </Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <h1 className="text-headline text-gray-900 dark:text-white mb-2">
                    Get Started
                </h1>
                <p className="text-body text-gray-600 dark:text-gray-400 mb-8">
                    Set up your local environment in under 2 minutes.
                </p>

                {/* Prerequisites */}
                <section className="mb-10">
                    <h2 className="text-title text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">1</span>
                        Prerequisites
                    </h2>
                    <div className="card">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">macOS</span>
                                    <p className="text-caption">Required for iOS Simulator</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">Xcode</span>
                                    <p className="text-caption">Install from the App Store. Open it once to accept the license.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">Node.js 18+</span>
                                    <p className="text-caption">Check with <code className="text-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">node --version</code></p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* What's Automatic */}
                <section className="mb-10">
                    <h2 className="text-title text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">2</span>
                        What's Automatic
                    </h2>
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <p className="text-body text-gray-700 dark:text-gray-300 mb-3">
                            The runner handles these automatically on first start:
                        </p>
                        <ul className="space-y-2 text-caption">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Expo CLI installation
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                iOS Simulator boot
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Native workspace setup (<code className="text-mono">~/.rn-playground/native</code>)
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Install & Run */}
                <section className="mb-10">
                    <h2 className="text-title text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">3</span>
                        Install & Run
                    </h2>
                    <div className="card">
                        <p className="text-caption mb-3">Run this command in your terminal:</p>
                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <code className="text-green-400 text-sm font-mono">
                                npx sim-bridge
                            </code>
                        </div>
                        <p className="text-caption">
                            The runner will start and display a token. Copy it.
                        </p>
                    </div>
                </section>

                {/* First Run Notes */}
                <section className="mb-10">
                    <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                    First Run Notes
                                </h3>
                                <ul className="text-caption space-y-1">
                                    <li>• The first run may take 1-2 minutes to set up</li>
                                    <li>• macOS may ask for permissions to control Simulator</li>
                                    <li>• The token rotates every time you restart the runner</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center pt-4">
                    <p className="text-caption mb-4">
                        Started the runner and copied the token?
                    </p>
                    <Link href="/playground" className="btn btn--primary text-base px-6 py-3">
                        Open Playground
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
