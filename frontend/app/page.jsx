export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="backdrop-blur-xl bg-white/10 p-12 rounded-3xl border border-white/20 shadow-2xl text-center">
          <h1 className="text-6xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            TREMBLE
          </h1>
          <p className="text-xl mb-8 text-gray-300">Phase 1: Glassmorphism UI Initialized</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 transition-all font-semibold">
              Log In
            </button>
            <button className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50 transition-all font-semibold">
              Start Listening
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
