import "./globals.css";
import { PlayerProvider } from "../context/PlayerContext";

export const metadata = {
  title: "TREMBLE — Feel the Music",
  description: "Open-source, ad-free glassmorphism music streaming.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
