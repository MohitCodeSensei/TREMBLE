import './globals.css'
import { PlayerProvider } from '../context/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomPlayer from '../components/BottomPlayer';
import NowPlaying from '../components/NowPlaying';
import MainLayoutWrapper from '../components/MainLayoutWrapper';
import PointerTrail from '../components/PointerTrail';
import SplashScreen from '../components/SplashScreen';

export const metadata = {
  title: 'TREMBLE',
  description: 'Ad-free high quality music streaming with a glassmorphism UI.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlayerProvider>
          <div className="relative min-h-screen w-full bg-black font-sans selection:bg-indigo-500/30 text-white">
            
            {/* The Boot Splash Screen */}
            <SplashScreen />

            {/* Animated Vibrant Mesh Background */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
              <div className="mesh-bg">
                <div className="mesh-blob blob-1"></div>
                <div className="mesh-blob blob-2"></div>
                <div className="mesh-blob blob-3"></div>
              </div>
              {/* Additional subtle floating particles */}
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
            </div>
            
            {/* Overlay gradient for depth */}
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-0"></div>

            <Sidebar />
            <TopBar />

            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>

            <BottomPlayer />
            <NowPlaying />
            <PointerTrail />
          </div>
        </PlayerProvider>
      </body>
    </html>
  )
}
