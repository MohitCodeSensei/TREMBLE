import './globals.css'
import { PlayerProvider } from '../context/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomPlayer from '../components/BottomPlayer';
import NowPlaying from '../components/NowPlaying';

export const metadata = {
  title: 'TREMBLE | Premium Music Streaming',
  description: 'Ad-free high quality music streaming with a glassmorphism UI.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        <PlayerProvider>
          <div className="relative min-h-screen w-full overflow-hidden">
            {/* Dynamic Mesh Background */}
            <div className="mesh-bg">
              <div className="mesh-blob blob-1"></div>
              <div className="mesh-blob blob-2"></div>
              <div className="mesh-blob blob-3"></div>
            </div>

            <Sidebar />
            <TopBar />

            <main className="pl-0 md:pl-64 pt-20 pb-24 min-h-screen transition-all duration-300">
              {children}
            </main>

            <BottomPlayer />
            <NowPlaying />
          </div>
        </PlayerProvider>
      </body>
    </html>
  )
}
