
Conversation with Gemini
tremble/

├── client/ # Next.js Frontend

│ ├── components/ # Reusable UI components (Monochrome UI)

│ ├── store/ # Zustand global state (Audio Player)

│ └── pages/ # App routing & Discovery Engine

├── server/ # Express.js Backend

│ ├── controllers/ # API route logic (Uploads, Fetching)

│ ├── services/ # External API aggregation jobs

│ └── routes/ # v1 REST Endpoints

└── docs/ # Additional architecture documentation

the project will contain images gifs make a proper github project structure with all the front end as well as backend and whatever else and tell me what to add in it like what should be there

To scale your project tremble into a production-ready, clean, and professional GitHub repository, you should structure it as a monorepo or a clearly separated full-stack workspace. This structure ensures clean asset management (for your images and GIFs), reliable environment configurations, CI/CD pipelines, and solid developer workflows.

Here is the complete, production-grade project architecture followed by a detailed breakdown of what to include in each directory.

Complete Directory Architecture
Plaintext
tremble/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml       # Automated Next.js testing & linting
│       └── backend-ci.yml        # Automated Express.js testing & linting
├── client/                       # Next.js Frontend (App Router / Pages)
│   ├── public/                   # Static client assets
│   │   ├── icons/                # SVG icons
│   │   └── images/               # App UI images & placeholder GIFs
│   ├── src/                      # Source code isolation
│   │   ├── components/           # Reusable UI elements (Buttons, Cards, Inputs)
│   │   ├── hooks/                # Custom React hooks (useAudio, useAuth)
│   │   ├── layouts/              # Wrapper structures (DashboardLayout, AuthLayout)
│   │   ├── pages/                # File-based routing & Discovery Engine pages
│   │   ├── store/                # Zustand global state (audioPlayerStore.ts)
│   │   ├── styles/               # Global CSS / Tailwind configurations
│   │   └── utils/                # Frontend helper functions (formatTime, API clients)
│   ├── .env.example              # Client-side environment template
│   ├── next.config.js            # Next.js configuration (configured for GIF/Image optimization)
│   ├── package.json
│   └── tsconfig.json
├── server/                       # Express.js Backend
│   ├── src/
│   │   ├── config/               # Database and environment initialization
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Authguards, error handlers, rate-limiters
│   │   ├── models/               # Database schemas (Mongoose or Prisma Client)
│   │   ├── routes/               # Express router endpoints split by resource (v1)
│   │   ├── services/             # Audio processing, CDN uploads, API aggregations
│   │   └── app.ts                # Express application bootstrap
│   ├── .env.example              # Server-side environment template
│   ├── package.json
│   └── tsconfig.json
├── shared/                       # Optional: Shared TypeScript types/interfaces
│   └── index.ts
├── assets/                       # Global repository documentation assets
│   ├── brand/                    # Logos, banners
│   └── mockups/                  # Readme demo GIFs and screenshots
├── .gitignore                    # Global git ignore file
├── docker-compose.yml            # Multi-container orchestration (Local DB, Redis, etc.)
├── package.json                  # Root workspace configurations
└── README.md                     # Documentation hub for onboarding
Key Additions & What to Put in Them
1. Asset Management (/assets vs /client/public)
client/public/: This is exclusively for assets served by the web app at runtime (e.g., UI icons, placeholder profile images, or animated loading GIFs inside the client app).

Root /assets/: Use this folder to store structural repository images, architecture diagrams, promotional banners, or walkthrough GIFs that you embed directly inside your README.md file. Keeping these out of the client directory prevents production builds from bloating.

2. Configuration & Orchestration
.env.example Files: Always commit an environment template in both client/ and server/. Never check in raw .env files containing actual tokens or database credentials.

docker-compose.yml: Configure this at the root level to fire up dependent local infrastructure instantly, such as a local PostgreSQL/MongoDB instance or a Redis cache for your audio streaming features.

3. Frontend Architecture Refinements (/client)
store/: Keep your Zustand stores clean by splitting concerns (e.g., useAudioStore.ts handling track state, queues, volume, and playback state; useAuthStore.ts handling session tokens).

components/: Standardize on a layout methodology. Group components by modularity (e.g., components/ui/ for raw primitive elements like buttons, and components/features/ for high-level features like the player drawer or track carousel).

4. Backend Scalability (/server)
services/: Move all heavy lifting away from controllers. If an endpoint uploads an audio file or processes a third-party aggregation job, the controller should only handle the request/response cycle, while a dedicated service handles the data execution.

middleware/: Implement explicit error handling, authentication checkers, and payload validation (using libraries like Zod) here to secure your v1 REST endpoints.

Interactive Architecture Explorer
To understand how data flows through this configuration and what rules each specific file must obey, explore the interactive configuration directory tree below.


Was this visual helpful?

What database paradigm or ODM (such as Prisma or Mongoose) are you planning to integrate into the server layer for tracking user data and audio metadata?

will the github automatically make folders in the github

No, GitHub will not automatically create those folders for you. When you create a new repository on GitHub, it starts as a completely blank slate (unless you specifically click the buttons to generate a basic README.md or .gitignore during setup).

To get that structure onto GitHub, you have to build it on your own computer first and then upload it. Here is how it actually works:

1. You Build It Locally
You need to create the folders and files on your own computer using your terminal or a code editor like VS Code.

2. The "Empty Folder" Rule (Crucial)
Git (the system that powers GitHub) does not track empty folders.
If you create a folder on your computer called /client/components but you don't put any files inside it, Git will completely ignore it. When you push your code to GitHub, that folder won't show up.

To make a folder appear on GitHub, it must have at least one file inside it. Developers often create a blank file named .gitkeep inside empty directories just to force Git to upload the folder.

3. You Push It to GitHub
Once you have your folders created and your initial files (like package.json, app.ts, or basic components) inside them, you will use Git commands in your terminal to send everything up to GitHub:

Bash
git add .
git commit -m "Initial project structure setup"
git push origin main
Only after running those commands will GitHub mirror the exact folder structure you built on your machine.

TREMBLE - Full Stack Music Streaming Application Roadmap

Goal Description

The goal is to build TREMBLE, a full-stack open-source music streaming web application. It will act as an ad-free alternative featuring YouTube Music API integration and support for high-quality audio formats (FLAC, WAV). The application requires distinct User and Artist roles, allowing artists to upload their own music and users to listen, view lyrics, and download high-quality tracks. The UI will strictly feature a premium, dynamic Glassmorphism aesthetic, far surpassing the design of standard music players like Spotify.



Approved Tech Stack

Frontend (User Interface)

Framework: Next.js (highly recommended for route management, performance, and SEO).

Styling: Vanilla CSS or Tailwind CSS, focusing heavily on Glassmorphism (translucent frosted glass panels, vibrant animated mesh gradient backgrounds, deep shadows).

State Management: Zustand or Redux Toolkit (crucial for keeping the music player active while the user navigates between pages).

Audio Playback: Native HTML5 <audio> API combined with the Web Audio API for custom visualizations and equalizer effects.

Backend (Server & API)

Framework: Node.js with Express.js. Node is non-blocking and handles continuous data streams (like music playback and YouTube proxying) extremely efficiently, making it the perfect choice over PHP.

Database: MySQL (perfect for managing structured data like Users, Artists, Playlists, and Track metadata).

YouTube Integration: Unofficial Node.js libraries (e.g., youtube-music-api or similar proxies) to fetch streams for educational use.

Server Storage (High-Quality Audio - FLAC/WAV)

Cloud Object Storage: Cloudflare R2.

CDN: Cloudflare.

How Cloudflare R2 Storage Works

Since you asked about Cloudflare R2, here is a simple breakdown of what it is and how it will manage your music files:

What is Cloud Object Storage? Unlike a standard hard drive on your computer or a traditional server where files are stored in folders, Object Storage stores files as "objects" in a giant cloud "bucket." It is specifically designed to hold massive amounts of media (like thousands of huge FLAC and WAV audio files) securely and cheaply.

Why Cloudflare R2? When someone streams or downloads a file from the cloud, cloud providers (like Amazon AWS or Google Cloud) usually charge you a "bandwidth egress fee" (a cost for the data leaving their servers). High-quality audio files are massive, so if many users stream your music, these egress fees can become incredibly expensive. Cloudflare R2 is unique because it charges $0 for egress (bandwidth). You only pay a very small amount for the raw storage space itself (and the first 10 GB is usually free). This makes it the absolute best choice for a media streaming app.

How it will work inside TREMBLE:

Upload: An Artist logs into TREMBLE, selects a high-quality FLAC song, and clicks upload.

Backend Processing: Your Node.js backend receives the file. Instead of saving it locally (which would crash your server over time), it securely sends the file straight to your Cloudflare R2 "Bucket".

Database Linking: Cloudflare R2 gives your Node.js server a specific URL for that file. Your server then saves this URL into your MySQL database attached to that song's details.

Streaming: When a User clicks play, the Next.js frontend asks the backend for the song. The backend sends back the Cloudflare URL. The frontend audio player then streams the music directly from Cloudflare's lightning-fast global servers. This takes the heavy streaming load completely off your Node.js server!

Full-Fledged Roadmap

Phase 1: Project Setup & Design (Weeks 1-2)

Define the MySQL database schema (Tables: Users, Artists, Tracks, Playlists, Likes, Downloads).

Setup the Node.js backend environment and initialize the database.

Setup the Next.js frontend project.

Create the Glassmorphism UI/UX design system (defining color palettes, blur tokens, typography, and layout).

Phase 2: Core Backend & Authentication (Weeks 3-4)

Implement User and Artist registration/login using JWT (JSON Web Tokens).

Set up MySQL database connection and create CRUD API endpoints.

Integrate Cloudflare R2 via the AWS SDK (S3 compatible) for secure FLAC/WAV uploads from artists.

Build APIs for fetching and managing track metadata.

Phase 3: Frontend Foundation & Global Player (Weeks 5-6)

Build the main UI layout: Sidebar navigation, Main content area, and a persistent Bottom Player.

Implement the custom audio player UI with play, pause, shuffle, skip, seek bar, and volume controls.

Integrate frontend state management (Zustand) so the player persists across page changes without stopping the music.

Implement the Glassmorphism aesthetic on all components.

Phase 4: YouTube Music & Lyrics Integration (Weeks 7-8)

Setup backend proxies to securely interact with the YouTube Music API and extract audio streams.

Create global search functionality combining Artist-uploaded tracks and YouTube tracks.

Integrate a lyrics API (e.g., LRCLIB or Musixmatch) and build a synchronized, scrolling lyrics UI.

Phase 5: Advanced Features & Artist Dashboard (Weeks 9-10)

Build the Artist Dashboard: UI for uploading music, adding metadata, and viewing play statistics.

Implement high-quality download functionality for authorized users (FLAC/WAV).

Add user-generated playlists, "Liked Songs," and history features.

Phase 6: Polish, Animations & Deployment (Weeks 11-12)

Refine the Glass UI: add micro-animations, hover states, and smooth page transitions.

Optimize performance: implement lazy loading for images and audio chunking.

Deploy the frontend to Vercel or Netlify.

Deploy the Node.js backend and MySQL database to a production server (VPS like DigitalOcean or AWS EC2). Make an SRS for the above project implementation plan introduction the contributors are Mohit Mahajan Shivam Punde Pranit Dhumal Aadit Patki Varun Sargam and have a scope, system features, requrements sub topic functional and non functional and then technology in which contains database front end back end and future enhancement then it contains the later given information.

Software Requirements Specification (SRS) for TREMBLE

Contributors: Mohit Mahajan, Shivam Punde, Pranit Dhumal, Aadit Patki, Varun Sargam

1. Introduction
TREMBLE is a full-stack, open-source music streaming web application designed to serve as a premium, ad-free alternative to mainstream platforms. It bridges the gap between commercial streaming and audiophile communities by natively supporting high-fidelity audio formats (FLAC, WAV) alongside YouTube Music API integration. The platform offers a visually striking, strictly Glassmorphism-based user interface, delivering an immersive, dynamic aesthetic that surpasses standard music players.

2. Scope
The scope of TREMBLE encompasses a dual-role ecosystem catering to both listeners (Users) and creators (Artists). Artists are provided with a dedicated dashboard to upload high-fidelity music securely to cloud storage. Users can stream these high-quality tracks, stream an endless catalog via YouTube Music proxies, view synchronized lyrics, and download premium files. The system is designed for high performance and low operational costs by leveraging modern cloud object storage mechanisms to eliminate bandwidth egress fees.

3. System Features
Dual-Role Authentication: Distinct access levels and dashboards for standard Users and Artists.

Persistent Global Audio Player: Continuous, uninterrupted music playback powered by HTML5 and Web Audio API that persists across all route navigations.

High-Fidelity Audio Hosting: Direct support for uploading, storing, and streaming FLAC and WAV formats using zero-egress cloud object storage.

Unified Search & Discovery: A hybrid catalog aggregating artist-uploaded tracks and third-party YouTube Music streams.

Synchronized Lyrics: Real-time scrolling lyrics integration.

Artist Analytics: A dedicated dashboard for artists to track metadata, uploads, and playback statistics.

4. Requirements
4.1 Functional Requirements
User Management: The system shall allow Users and Artists to register, authenticate via JWT, and manage their profiles.

Media Upload: The backend shall receive audio files from Artists and securely route them directly to Cloudflare R2 storage without retaining local copies.

Media Playback: The frontend shall request track metadata from the database and stream the raw audio URL directly from the CDN to the client.

Downloads: Authorized users shall be able to download lossless audio files directly from the cloud bucket.

Library Management: Users shall be able to create playlists, save "Liked Songs," and view their listening history.

4.2 Non-Functional Requirements
Aesthetic Constraints: The UI must strictly utilize a Glassmorphism design system, characterized by translucent frosted glass panels, vibrant animated mesh gradient backgrounds, and deep shadows.

Performance: Audio streaming must begin within 1 second of user interaction. The frontend must utilize state management to ensure zero audio dropping during page transitions.

Cost-Efficiency: The architecture must utilize Cloudflare R2 to ensure zero egress fees on large audio file transfers.

Scalability: The backend proxy handling YouTube API requests must be non-blocking to manage thousands of concurrent streams.

5. Technology Stack
5.1 Frontend
Framework: Next.js (App/Pages Router for SEO and rapid navigation)

Styling: Tailwind CSS or Vanilla CSS (Strict Glassmorphism design tokens)

State Management: Zustand or Redux Toolkit

Audio Engine: Native HTML5 <audio> API and Web Audio API

5.2 Backend
Framework: Node.js with Express.js

Authentication: JSON Web Tokens (JWT)

External APIs: youtube-music-api (or equivalent proxy), LRCLIB/Musixmatch (Lyrics)

5.3 Database & Storage
Relational Database: MySQL (Users, Artists, Tracks, Playlists, Metadata)

Cloud Object Storage: Cloudflare R2 (Audio file hosting)

CDN: Cloudflare (Global asset delivery)

6. Implementation Roadmap
Phase	Duration	Key Milestones
1. Setup & Design	Weeks 1-2	Define MySQL schema; initialize Node.js/Next.js environments; establish Glassmorphism design system.
2. Core Backend	Weeks 3-4	Implement JWT Auth; build CRUD endpoints; integrate AWS SDK for Cloudflare R2 uploads.
3. UI & Player	Weeks 5-6	Build main layout; construct custom audio player; integrate Zustand for persistent global playback.
4. Integrations	Weeks 7-8	Setup YouTube Music proxy; build unified search; integrate scrolling lyrics API.
5. Advanced Features	Weeks 9-10	Develop Artist Dashboard; enable FLAC/WAV downloads; build playlists and history features.
6. Polish & Deploy	Weeks 11-12	Refine micro-animations; optimize chunking/lazy-loading; deploy frontend to Vercel/Netlify; deploy backend/DB to VPS.
Copy KV
Copy Table
7. Future Enhancements
Mobile Application: Porting the Next.js web experience to a native mobile application using React Native to support offline downloads and background listening.

Social Listening: Real-time collaborative playlists and "listen-along" sessions using WebSockets.

AI Recommendations: Implementing a machine learning layer to analyze listening history and suggest hybrid tracks from both indie artists and the YouTube catalog.

Advanced Audio Visualizers: Expanding the Web Audio API integration to allow users to select dynamic, real-time visualizers that react to specific frequency bands of the playing track.

format in for the md file in github

Your Markdown file is ready.
MD icon
TREMBLE_SRS
 MD 
Open

This file is pre-formatted with GitHub markdown syntax, including structural tables, stylized technology badges, and clean spacing. You can drop this directly into your repository as SRS.md or use it as your core README.md.




Gemini is AI and can make mistakes.

<div align="center">
  <h1>🎵 TREMBLE</h1>
  <p><b>Software Requirements Specification (SRS)</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare" />
  </p>
</div>

---

## 👥 Contributors
- **Mohit Mahajan** - **Shivam Punde**
- **Pranit Dhumal**
- **Aadit Patki**
- **Varun Sargam**

---

## 1. 📖 Introduction
**TREMBLE** is a full-stack, open-source music streaming web application designed to serve as a premium, ad-free alternative to mainstream platforms. It bridges the gap between commercial streaming and audiophile communities by natively supporting high-fidelity audio formats (FLAC, WAV) alongside YouTube Music API integration. The platform offers a visually striking, strictly Glassmorphism-based user interface, delivering an immersive, dynamic aesthetic that surpasses standard music players.

## 2. 🎯 Scope
The scope of TREMBLE encompasses a dual-role ecosystem catering to both listeners (Users) and creators (Artists). 
- **Artists** are provided with a dedicated dashboard to upload high-fidelity music securely to cloud storage. 
- **Users** can stream these high-quality tracks, stream an endless catalog via YouTube Music proxies, view synchronized lyrics, and download premium files. 

The system is designed for high performance and low operational costs by leveraging modern cloud object storage mechanisms to eliminate bandwidth egress fees.

---

## 3. ✨ System Features
- 🔐 **Dual-Role Authentication:** Distinct access levels and dashboards for standard Users and Artists.
- 🎧 **Persistent Global Audio Player:** Continuous, uninterrupted music playback powered by HTML5 and Web Audio API that persists across all route navigations.
- 💽 **High-Fidelity Audio Hosting:** Direct support for uploading, storing, and streaming FLAC and WAV formats using zero-egress cloud object storage.
- 🔍 **Unified Search & Discovery:** A hybrid catalog aggregating artist-uploaded tracks and third-party YouTube Music streams.
- 🎤 **Synchronized Lyrics:** Real-time scrolling lyrics integration.
- 📊 **Artist Analytics:** A dedicated dashboard for artists to track metadata, uploads, and playback statistics.

---

## 4. 📋 Requirements

### 4.1 Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **User Management** | The system shall allow Users and Artists to register, authenticate via JWT, and manage their profiles. |
| **Media Upload** | The backend shall receive audio files from Artists and securely route them directly to Cloudflare R2 storage without retaining local copies. |
| **Media Playback** | The frontend shall request track metadata from the database and stream the raw audio URL directly from the CDN to the client. |
| **Downloads** | Authorized users shall be able to download lossless audio files directly from the cloud bucket. |
| **Library Management** | Users shall be able to create playlists, save "Liked Songs," and view their listening history. |

### 4.2 Non-Functional Requirements
- **Aesthetic Constraints:** The UI must strictly utilize a Glassmorphism design system, characterized by translucent frosted glass panels, vibrant animated mesh gradient backgrounds, and deep shadows.
- **Performance:** Audio streaming must begin within 1 second of user interaction. The frontend must utilize state management to ensure zero audio dropping during page transitions.
- **Cost-Efficiency:** The architecture must utilize Cloudflare R2 to ensure zero egress fees on large audio file transfers.
- **Scalability:** The backend proxy handling YouTube API requests must be non-blocking to manage thousands of concurrent streams.

---

## 5. 🛠️ Technology Stack

### 5.1 Frontend
- **Framework:** Next.js *(App/Pages Router)*
- **Styling:** Tailwind CSS / Vanilla CSS *(Glassmorphism tokens)*
- **State Management:** Zustand / Redux Toolkit
- **Audio Engine:** Native HTML5 `<audio>` API & Web Audio API

### 5.2 Backend
- **Framework:** Node.js with Express.js
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** `youtube-music-api` *(proxy)*, LRCLIB / Musixmatch *(Lyrics)*

### 5.3 Database & Storage
- **Relational Database:** MySQL 
- **Cloud Object Storage:** Cloudflare R2 *(Audio file hosting)*
- **CDN:** Cloudflare *(Global asset delivery)*

---

## 6. 🗺️ Implementation Roadmap

| Phase | Duration | Key Milestones |
| :---: | :--- | :--- |
| **1. Setup & Design** | `Weeks 1-2` | Define MySQL schema; initialize Node.js/Next.js environments; establish Glassmorphism design system. |
| **2. Core Backend** | `Weeks 3-4` | Implement JWT Auth; build CRUD endpoints; integrate AWS SDK for Cloudflare R2 uploads. |
| **3. UI & Player** | `Weeks 5-6` | Build main layout; construct custom audio player; integrate Zustand for persistent global playback. |
| **4. Integrations** | `Weeks 7-8` | Setup YouTube Music proxy; build unified search; integrate scrolling lyrics API. |
| **5. Advanced Features**| `Weeks 9-10` | Develop Artist Dashboard; enable FLAC/WAV downloads; build playlists and history features. |
| **6. Polish & Deploy** | `Weeks 11-12`| Refine micro-animations; optimize chunking/lazy-loading; deploy frontend to Vercel/Netlify; deploy backend/DB to VPS. |

---

## 7. 🚀 Future Enhancements
- 📱 **Mobile Application:** Porting the Next.js web experience to a native mobile application using React Native to support offline downloads and background listening.
- 🤝 **Social Listening:** Real-time collaborative playlists and "listen-along" sessions using WebSockets.
- 🧠 **AI Recommendations:** Implementing a machine learning layer to analyze listening history and suggest hybrid tracks from both indie artists and the YouTube catalog.
- 🎇 **Advanced Audio Visualizers:** Expanding the Web Audio API integration to allow users to select dynamic, real-time visualizers that react to specific frequency bands of the playing track.
<div align="center">
  <h1>🎵 TREMBLE</h1>
  <p><b>Software Requirements Specification (SRS)</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare" />
  </p>
</div>

---

## 👥 Contributors
- **Mohit Mahajan** - **Shivam Punde**
- **Pranit Dhumal**
- **Aadit Patki**
- **Varun Sargam**

---

## 1. 📖 Introduction
**TREMBLE** is a full-stack, open-source music streaming web application designed to serve as a premium, ad-free alternative to mainstream platforms. It bridges the gap between commercial streaming and audiophile communities by natively supporting high-fidelity audio formats (FLAC, WAV) alongside YouTube Music API integration. The platform offers a visually striking, strictly Glassmorphism-based user interface, delivering an immersive, dynamic aesthetic that surpasses standard music players.

## 2. 🎯 Scope
The scope of TREMBLE encompasses a dual-role ecosystem catering to both listeners (Users) and creators (Artists). 
- **Artists** are provided with a dedicated dashboard to upload high-fidelity music securely to cloud storage. 
- **Users** can stream these high-quality tracks, stream an endless catalog via YouTube Music proxies, view synchronized lyrics, and download premium files. 

The system is designed for high performance and low operational costs by leveraging modern cloud object storage mechanisms to eliminate bandwidth egress fees.

---

## 3. ✨ System Features
- 🔐 **Dual-Role Authentication:** Distinct access levels and dashboards for standard Users and Artists.
- 🎧 **Persistent Global Audio Player:** Continuous, uninterrupted music playback powered by HTML5 and Web Audio API that persists across all route navigations.
- 💽 **High-Fidelity Audio Hosting:** Direct support for uploading, storing, and streaming FLAC and WAV formats using zero-egress cloud object storage.
- 🔍 **Unified Search & Discovery:** A hybrid catalog aggregating artist-uploaded tracks and third-party YouTube Music streams.
- 🎤 **Synchronized Lyrics:** Real-time scrolling lyrics integration.
- 📊 **Artist Analytics:** A dedicated dashboard for artists to track metadata, uploads, and playback statistics.

---

## 4. 📋 Requirements

### 4.1 Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **User Management** | The system shall allow Users and Artists to register, authenticate via JWT, and manage their profiles. |
| **Media Upload** | The backend shall receive audio files from Artists and securely route them directly to Cloudflare R2 storage without retaining local copies. |
| **Media Playback** | The frontend shall request track metadata from the database and stream the raw audio URL directly from the CDN to the client. |
| **Downloads** | Authorized users shall be able to download lossless audio files directly from the cloud bucket. |
| **Library Management** | Users shall be able to create playlists, save "Liked Songs," and view their listening history. |

### 4.2 Non-Functional Requirements
- **Aesthetic Constraints:** The UI must strictly utilize a Glassmorphism design system, characterized by translucent frosted glass panels, vibrant animated mesh gradient backgrounds, and deep shadows.
- **Performance:** Audio streaming must begin within 1 second of user interaction. The frontend must utilize state management to ensure zero audio dropping during page transitions.
- **Cost-Efficiency:** The architecture must utilize Cloudflare R2 to ensure zero egress fees on large audio file transfers.
- **Scalability:** The backend proxy handling YouTube API requests must be non-blocking to manage thousands of concurrent streams.

---

## 5. 🛠️ Technology Stack

### 5.1 Frontend
- **Framework:** Next.js *(App/Pages Router)*
- **Styling:** Tailwind CSS / Vanilla CSS *(Glassmorphism tokens)*
- **State Management:** Zustand / Redux Toolkit
- **Audio Engine:** Native HTML5 `<audio>` API & Web Audio API

### 5.2 Backend
- **Framework:** Node.js with Express.js
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** `youtube-music-api` *(proxy)*, LRCLIB / Musixmatch *(Lyrics)*

### 5.3 Database & Storage
- **Relational Database:** MySQL 
- **Cloud Object Storage:** Cloudflare R2 *(Audio file hosting)*
- **CDN:** Cloudflare *(Global asset delivery)*

---

## 6. 🗺️ Implementation Roadmap

| Phase | Duration | Key Milestones |
| :---: | :--- | :--- |
| **1. Setup & Design** | `Weeks 1-2` | Define MySQL schema; initialize Node.js/Next.js environments; establish Glassmorphism design system. |
| **2. Core Backend** | `Weeks 3-4` | Implement JWT Auth; build CRUD endpoints; integrate AWS SDK for Cloudflare R2 uploads. |
| **3. UI & Player** | `Weeks 5-6` | Build main layout; construct custom audio player; integrate Zustand for persistent global playback. |
| **4. Integrations** | `Weeks 7-8` | Setup YouTube Music proxy; build unified search; integrate scrolling lyrics API. |
| **5. Advanced Features**| `Weeks 9-10` | Develop Artist Dashboard; enable FLAC/WAV downloads; build playlists and history features. |
| **6. Polish & Deploy** | `Weeks 11-12`| Refine micro-animations; optimize chunking/lazy-loading; deploy frontend to Vercel/Netlify; deploy backend/DB to VPS. |

---

## 7. 🚀 Future Enhancements
- 📱 **Mobile Application:** Porting the Next.js web experience to a native mobile application using React Native to support offline downloads and background listening.
- 🤝 **Social Listening:** Real-time collaborative playlists and "listen-along" sessions using WebSockets.
- 🧠 **AI Recommendations:** Implementing a machine learning layer to analyze listening history and suggest hybrid tracks from both indie artists and the YouTube catalog.
- 🎇 **Advanced Audio Visualizers:** Expanding the Web Audio API integration to allow users to select dynamic, real-time visualizers that react to specific frequency bands of the playing track.
<div align="center">
  <h1>🎵 TREMBLE</h1>
  <p><b>Software Requirements Specification (SRS)</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare" />
  </p>
</div>

---

## 👥 Contributors
- **Mohit Mahajan** - **Shivam Punde**
- **Pranit Dhumal**
- **Aadit Patki**
- **Varun Sargam**

---

## 1. 📖 Introduction
**TREMBLE** is a full-stack, open-source music streaming web application designed to serve as a premium, ad-free alternative to mainstream platforms. It bridges the gap between commercial streaming and audiophile communities by natively supporting high-fidelity audio formats (FLAC, WAV) alongside YouTube Music API integration. The platform offers a visually striking, strictly Glassmorphism-based user interface, delivering an immersive, dynamic aesthetic that surpasses standard music players.

## 2. 🎯 Scope
The scope of TREMBLE encompasses a dual-role ecosystem catering to both listeners (Users) and creators (Artists). 
- **Artists** are provided with a dedicated dashboard to upload high-fidelity music securely to cloud storage. 
- **Users** can stream these high-quality tracks, stream an endless catalog via YouTube Music proxies, view synchronized lyrics, and download premium files. 

The system is designed for high performance and low operational costs by leveraging modern cloud object storage mechanisms to eliminate bandwidth egress fees.

---

## 3. ✨ System Features
- 🔐 **Dual-Role Authentication:** Distinct access levels and dashboards for standard Users and Artists.
- 🎧 **Persistent Global Audio Player:** Continuous, uninterrupted music playback powered by HTML5 and Web Audio API that persists across all route navigations.
- 💽 **High-Fidelity Audio Hosting:** Direct support for uploading, storing, and streaming FLAC and WAV formats using zero-egress cloud object storage.
- 🔍 **Unified Search & Discovery:** A hybrid catalog aggregating artist-uploaded tracks and third-party YouTube Music streams.
- 🎤 **Synchronized Lyrics:** Real-time scrolling lyrics integration.
- 📊 **Artist Analytics:** A dedicated dashboard for artists to track metadata, uploads, and playback statistics.

---

## 4. 📋 Requirements

### 4.1 Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **User Management** | The system shall allow Users and Artists to register, authenticate via JWT, and manage their profiles. |
| **Media Upload** | The backend shall receive audio files from Artists and securely route them directly to Cloudflare R2 storage without retaining local copies. |
| **Media Playback** | The frontend shall request track metadata from the database and stream the raw audio URL directly from the CDN to the client. |
| **Downloads** | Authorized users shall be able to download lossless audio files directly from the cloud bucket. |
| **Library Management** | Users shall be able to create playlists, save "Liked Songs," and view their listening history. |

### 4.2 Non-Functional Requirements
- **Aesthetic Constraints:** The UI must strictly utilize a Glassmorphism design system, characterized by translucent frosted glass panels, vibrant animated mesh gradient backgrounds, and deep shadows.
- **Performance:** Audio streaming must begin within 1 second of user interaction. The frontend must utilize state management to ensure zero audio dropping during page transitions.
- **Cost-Efficiency:** The architecture must utilize Cloudflare R2 to ensure zero egress fees on large audio file transfers.
- **Scalability:** The backend proxy handling YouTube API requests must be non-blocking to manage thousands of concurrent streams.

---

## 5. 🛠️ Technology Stack

### 5.1 Frontend
- **Framework:** Next.js *(App/Pages Router)*
- **Styling:** Tailwind CSS / Vanilla CSS *(Glassmorphism tokens)*
- **State Management:** Zustand / Redux Toolkit
- **Audio Engine:** Native HTML5 `<audio>` API & Web Audio API

### 5.2 Backend
- **Framework:** Node.js with Express.js
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** `youtube-music-api` *(proxy)*, LRCLIB / Musixmatch *(Lyrics)*

### 5.3 Database & Storage
- **Relational Database:** MySQL 
- **Cloud Object Storage:** Cloudflare R2 *(Audio file hosting)*
- **CDN:** Cloudflare *(Global asset delivery)*

---

## 6. 🗺️ Implementation Roadmap

| Phase | Duration | Key Milestones |
| :---: | :--- | :--- |
| **1. Setup & Design** | `Weeks 1-2` | Define MySQL schema; initialize Node.js/Next.js environments; establish Glassmorphism design system. |
| **2. Core Backend** | `Weeks 3-4` | Implement JWT Auth; build CRUD endpoints; integrate AWS SDK for Cloudflare R2 uploads. |
| **3. UI & Player** | `Weeks 5-6` | Build main layout; construct custom audio player; integrate Zustand for persistent global playback. |
| **4. Integrations** | `Weeks 7-8` | Setup YouTube Music proxy; build unified search; integrate scrolling lyrics API. |
| **5. Advanced Features**| `Weeks 9-10` | Develop Artist Dashboard; enable FLAC/WAV downloads; build playlists and history features. |
| **6. Polish & Deploy** | `Weeks 11-12`| Refine micro-animations; optimize chunking/lazy-loading; deploy frontend to Vercel/Netlify; deploy backend/DB to VPS. |

---

## 7. 🚀 Future Enhancements
- 📱 **Mobile Application:** Porting the Next.js web experience to a native mobile application using React Native to support offline downloads and background listening.
- 🤝 **Social Listening:** Real-time collaborative playlists and "listen-along" sessions using WebSockets.
- 🧠 **AI Recommendations:** Implementing a machine learning layer to analyze listening history and suggest hybrid tracks from both indie artists and the YouTube catalog.
- 🎇 **Advanced Audio Visualizers:** Expanding the Web Audio API integration to allow users to select dynamic, real-time visualizers that react to specific frequency bands of the playing track.
<div align="center">
  <h1>🎵 TREMBLE</h1>
  <p><b>Software Requirements Specification (SRS)</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare" />
  </p>
</div>

---

## 👥 Contributors
- **Mohit Mahajan** - **Shivam Punde**
- **Pranit Dhumal**
- **Aadit Patki**
- **Varun Sargam**

---

## 1. 📖 Introduction
**TREMBLE** is a full-stack, open-source music streaming web application designed to serve as a premium, ad-free alternative to mainstream platforms. It bridges the gap between commercial streaming and audiophile communities by natively supporting high-fidelity audio formats (FLAC, WAV) alongside YouTube Music API integration. The platform offers a visually striking, strictly Glassmorphism-based user interface, delivering an immersive, dynamic aesthetic that surpasses standard music players.

## 2. 🎯 Scope
The scope of TREMBLE encompasses a dual-role ecosystem catering to both listeners (Users) and creators (Artists). 
- **Artists** are provided with a dedicated dashboard to upload high-fidelity music securely to cloud storage. 
- **Users** can stream these high-quality tracks, stream an endless catalog via YouTube Music proxies, view synchronized lyrics, and download premium files. 

The system is designed for high performance and low operational costs by leveraging modern cloud object storage mechanisms to eliminate bandwidth egress fees.

---

## 3. ✨ System Features
- 🔐 **Dual-Role Authentication:** Distinct access levels and dashboards for standard Users and Artists.
- 🎧 **Persistent Global Audio Player:** Continuous, uninterrupted music playback powered by HTML5 and Web Audio API that persists across all route navigations.
- 💽 **High-Fidelity Audio Hosting:** Direct support for uploading, storing, and streaming FLAC and WAV formats using zero-egress cloud object storage.
- 🔍 **Unified Search & Discovery:** A hybrid catalog aggregating artist-uploaded tracks and third-party YouTube Music streams.
- 🎤 **Synchronized Lyrics:** Real-time scrolling lyrics integration.
- 📊 **Artist Analytics:** A dedicated dashboard for artists to track metadata, uploads, and playback statistics.

---

## 4. 📋 Requirements

### 4.1 Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **User Management** | The system shall allow Users and Artists to register, authenticate via JWT, and manage their profiles. |
| **Media Upload** | The backend shall receive audio files from Artists and securely route them directly to Cloudflare R2 storage without retaining local copies. |
| **Media Playback** | The frontend shall request track metadata from the database and stream the raw audio URL directly from the CDN to the client. |
| **Downloads** | Authorized users shall be able to download lossless audio files directly from the cloud bucket. |
| **Library Management** | Users shall be able to create playlists, save "Liked Songs," and view their listening history. |

### 4.2 Non-Functional Requirements
- **Aesthetic Constraints:** The UI must strictly utilize a Glassmorphism design system, characterized by translucent frosted glass panels, vibrant animated mesh gradient backgrounds, and deep shadows.
- **Performance:** Audio streaming must begin within 1 second of user interaction. The frontend must utilize state management to ensure zero audio dropping during page transitions.
- **Cost-Efficiency:** The architecture must utilize Cloudflare R2 to ensure zero egress fees on large audio file transfers.
- **Scalability:** The backend proxy handling YouTube API requests must be non-blocking to manage thousands of concurrent streams.

---

## 5. 🛠️ Technology Stack

### 5.1 Frontend
- **Framework:** Next.js *(App/Pages Router)*
- **Styling:** Tailwind CSS / Vanilla CSS *(Glassmorphism tokens)*
- **State Management:** Zustand / Redux Toolkit
- **Audio Engine:** Native HTML5 `<audio>` API & Web Audio API

### 5.2 Backend
- **Framework:** Node.js with Express.js
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** `youtube-music-api` *(proxy)*, LRCLIB / Musixmatch *(Lyrics)*

### 5.3 Database & Storage
- **Relational Database:** MySQL 
- **Cloud Object Storage:** Cloudflare R2 *(Audio file hosting)*
- **CDN:** Cloudflare *(Global asset delivery)*

---

## 6. 🗺️ Implementation Roadmap

| Phase | Duration | Key Milestones |
| :---: | :--- | :--- |
| **1. Setup & Design** | `Weeks 1-2` | Define MySQL schema; initialize Node.js/Next.js environments; establish Glassmorphism design system. |
| **2. Core Backend** | `Weeks 3-4` | Implement JWT Auth; build CRUD endpoints; integrate AWS SDK for Cloudflare R2 uploads. |
| **3. UI & Player** | `Weeks 5-6` | Build main layout; construct custom audio player; integrate Zustand for persistent global playback. |
| **4. Integrations** | `Weeks 7-8` | Setup YouTube Music proxy; build unified search; integrate scrolling lyrics API. |
| **5. Advanced Features**| `Weeks 9-10` | Develop Artist Dashboard; enable FLAC/WAV downloads; build playlists and history features. |
| **6. Polish & Deploy** | `Weeks 11-12`| Refine micro-animations; optimize chunking/lazy-loading; deploy frontend to Vercel/Netlify; deploy backend/DB to VPS. |

---

## 7. 🚀 Future Enhancements
- 📱 **Mobile Application:** Porting the Next.js web experience to a native mobile application using React Native to support offline downloads and background listening.
- 🤝 **Social Listening:** Real-time collaborative playlists and "listen-along" sessions using WebSockets.
- 🧠 **AI Recommendations:** Implementing a machine learning layer to analyze listening history and suggest hybrid tracks from both indie artists and the YouTube catalog.
- 🎇 **Advanced Audio Visualizers:** Expanding the Web Audio API integration to allow users to select dynamic, real-time visualizers that react to specific frequency bands of the playing track.
TREMBLE_SRS.md
TREMBLE_SRS.md
TREMBLE_SRS.md
TREMBLE_SRS.md
TREMBLE_SRS.md
Loading TREMBLE_SRS.md.Displaying TREMBLE_SRS.md.Displaying TREMBLE_SRS.md.Displaying TREMBLE_SRS.md.Displaying TREMBLE_SRS.md.
