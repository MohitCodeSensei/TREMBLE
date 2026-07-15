# TREMBLE.
TREMBLE 🎛️
A hyper-fast, open-source music streaming and distribution platform.

About The Project
TREMBLE is built for people who just want to listen to music without the clutter.

Most modern music apps are heavy, full of ads, and make it hard for independent artists to share their work. TREMBLE solves this by offering a completely free, open-source platform. It features a striking, minimalist black-and-white interface designed for speed. Listeners get instant access to streaming and DRM-free downloads, while artists get a simple drag-and-drop studio to share their tracks directly with the world.

Key Features
Monochromatic UI: A strict black-and-white design that removes visual distractions, saves system resources, and puts the focus entirely on the music.

Open Discovery Engine: Automatically pulls and organizes free, open-source music from various web APIs into a clean, easy-to-browse library.

Direct DRM-Free Downloads: Listeners can download high-quality audio files (MP3/FLAC) directly to their devices with a single click.

The Artist Studio: A built-in portal where independent musicians can upload their tracks directly to the platform for free, bypassing record labels and corporate middlemen.

Lightweight Audio Player: Gapless playback, global state persistence, and keyboard media controls that run perfectly in the background.

Tech Stack
We chose modern, fast, and scalable tools to keep TREMBLE lightweight and responsive.

Frontend: Next.js (React), Tailwind CSS (for the monochromatic theme), Zustand (state management)

Backend: Node.js, Express.js

Database: PostgreSQL (User & Artist data), Redis (Fast caching for trending songs)

Storage: Cloudflare Stream / AWS S3 (Audio file hosting)

Getting Started
To get a local copy of TREMBLE up and running on your machine, follow these simple steps.

Prerequisites
Node.js (v18.0 or higher)

npm (v9.0 or higher)

PostgreSQL running locally

Installation
Clone the repository:

Bash
git clone https://github.com/your-username/tremble.git
Navigate into the project directory:

Bash
cd tremble
Install the NPM packages:

Bash
npm install
Set up your environment variables (copy the example file and add your database details):

Bash
cp .env.example .env
Start the development server:

Bash
npm run dev
Contributing
TREMBLE is an open-source community project. We welcome contributions from developers, designers, and music lovers!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
Distributed under the License. See the LICENSE file for more information.
