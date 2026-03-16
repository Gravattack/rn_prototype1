import Link from 'next/link';
import { ArrowRight, Terminal, Smartphone, Zap, Code2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">
            RN Playground
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/get-started"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Get Started
          </Link>
          <Link
            href="/playground"
            className="btn btn--primary text-sm"
          >
            Open Playground
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-display text-gray-900 dark:text-white mb-6">
          React Native Playground
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Write React Native code in your browser.
          Run it on your local iOS Simulator instantly.
          Zero cloud. Zero config.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/get-started" className="btn btn--primary text-base px-6 py-3">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/playground" className="btn btn--secondary text-base px-6 py-3">
            Open Playground
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-headline text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-600 mb-2">Step 1</div>
            <h3 className="text-title text-gray-900 dark:text-white mb-2">
              Start the Runner
            </h3>
            <p className="text-caption">
              Run <code className="text-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">npx sim-bridge</code> in your terminal.
              It handles everything automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Code2 className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-sm font-medium text-amber-600 mb-2">Step 2</div>
            <h3 className="text-title text-gray-900 dark:text-white mb-2">
              Write Your Code
            </h3>
            <p className="text-caption">
              Use the web editor to write React Native components.
              Full syntax highlighting and multi-file support.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600 mb-2">Step 3</div>
            <h3 className="text-title text-gray-900 dark:text-white mb-2">
              Run on Simulator
            </h3>
            <p className="text-caption">
              Click Run. Your code syncs to the local runner
              and launches on the iOS Simulator.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Zap className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-title text-gray-900 dark:text-white mb-1">
                  Zero Configuration
                </h3>
                <p className="text-caption">
                  The runner automatically installs Expo CLI, creates workspaces, and boots the simulator.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Terminal className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-title text-gray-900 dark:text-white mb-1">
                  Local Execution
                </h3>
                <p className="text-caption">
                  All code runs on your machine. No cloud servers, no accounts, no data leaves your computer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-headline text-gray-900 dark:text-white mb-4">
            Ready to start?
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-6">
            You'll need a Mac with Xcode installed. That's it.
          </p>
          <Link href="/get-started" className="btn btn--primary text-base px-6 py-3">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-caption">
          Built for developers who want to prototype React Native fast.
        </p>
      </footer>
    </div>
  );
}
