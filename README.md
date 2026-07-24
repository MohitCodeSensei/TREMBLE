<div align="center">

  <img src="https://github.com/MohitCodeSensei/TREMBLE/blob/main/frontend/app/icon.png" width="64" alt="Tremble Logo" />

  <h1>Tremble</h1>

  <p><strong>Feel Every Frequency. Pure Sound. Zero Interruptions.</strong></p>

  <p>
    <a href="#about"><kbd>About</kbd></a> •
    <a href="#features"><kbd>Features</kbd></a> •
    <a href="#visualizer-modes"><kbd>Visualizers</kbd></a> •
    <a href="#tech-stack"><kbd>Tech Stack</kbd></a> •
    <a href="#quick-start"><kbd>Quick Start</kbd></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Audio-24--Bit%2F192kHz%20FLAC-ff0055?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Lossless Audio">
    <img src="https://img.shields.io/badge/Ads-Zero%20Commercials-00f2fe?style=for-the-badge&logo=adguard&logoColor=white" alt="Ad-Free">
    <img src="https://img.shields.io/badge/UI-Immersive%203D%20%26%20WebGL-7928CA?style=for-the-badge&logo=opengl&logoColor=white" alt="Immersive UI">
  </p>

</div>

<hr />

<h2 id="about">🎧 What is Tremble?</h2>

<p>
  <strong>Tremble</strong> is an open-source, next-generation music streaming experience engineered for audiophiles and digital purists. Standard streaming platforms compress audio into muddy frequencies while bombarding users with ads and algorithms. <b>Tremble strips away the noise.</b>
</p>

<p>
  Built on a custom Web Audio DSP pipeline and WebGL visual shaders, Tremble delivers <strong>100% ad-free 24-bit Hi-Res audio</strong> paired with real-time, audio-reactive 3D visual environments.
</p>

<hr />

<h2 id="features">✨ Core Pillars</h2>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🚫 100% Ad-Free Pure Flow</h3>
      <ul>
        <li>Zero audio interruptions, banners, or pop-ups.</li>
        <li>Unrestricted background playback & infinite skips.</li>
        <li>Native offline playback caching built-in.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>💎 24-Bit / 192kHz Lossless Quality</h3>
      <ul>
        <li>Bit-for-bit accurate digital audio via FLAC master streaming.</li>
        <li>Preserved full dynamic range for deep bass and ultra-crisp highs.</li>
        <li>Integrated 10-band parametric equalizer with zero-latency crossfade.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Dynamic Ambient UI</h3>
      <ul>
        <li>Fluid color engine that continuously morphs the glassmorphic interface based on album artwork.</li>
        <li>Distraction-free, minimal edge-to-edge typography mode.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🌌 Audio-Reactive 3D Visualizer</h3>
      <ul>
        <li>GPU-accelerated WebGL / Three.js shader pipelines.</li>
        <li>Real-time frequency splitting (Sub-bass, Mids, Highs).</li>
        <li>Full mouse and touch orbit controls for interactive visuals.</li>
      </ul>
    </td>
  </tr>
</table>

<hr />

<h2 id="visualizer-modes">🎛 Visualizer Modes</h2>

<details open>
  <summary><b>Click to toggle Visual Experience Matrix</b></summary>
  <br />
  <table>
    <thead>
      <tr>
        <th align="left">Visual Mode</th>
        <th align="left">Experience Description</th>
        <th align="center">Audio Trigger</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Neon Nebula</b></td>
        <td>Ethereal particle storm expanding through deep space.</td>
        <td align="center"><code>Sub-Bass (20 - 80 Hz)</code></td>
      </tr>
      <tr>
        <td><b>Cyber Grid</b></td>
        <td>Retro synthwave terrain deforming dynamically to rhythm.</td>
        <td align="center"><code>Drum Transients / Snares</code></td>
      </tr>
      <tr>
        <td><b>Quantum Wave</b></td>
        <td>Fluid dynamic liquid simulations tracking harmonic vocals.</td>
        <td align="center"><code>Mid Harmonics (500 - 2000 Hz)</code></td>
      </tr>
      <tr>
        <td><b>Geometric Pulse</b></td>
        <td>Crystalline 3D polyhedrons oscillating with high-end detail.</td>
        <td align="center"><code>Treble & Hi-Hats</code></td>
      </tr>
    </tbody>
  </table>
</details>

<hr />

<h2 id="tech-stack">🛠 Tech Stack</h2>

<div align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Audio%20Engine-Web%20Audio%20API%20%2B%20WASM-orange?style=flat-square&logo=webassembly" alt="WASM Audio" />
  <img src="https://img.shields.io/badge/Graphics-Three.js%20%2F%20WebGL-blueviolet?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Backend-Go%20%2F%20gRPC-00ADD8?style=flat-square&logo=go" alt="Go" />
</div>

<hr />

<h2 id="quick-start">🚀 Quick Start</h2>

<p>To run Tremble locally with WebGL hardware acceleration enabled:</p>

<pre>
<code>
<span style="color: #6a9955;"># 1. Clone the repository</span>
git clone https://github.com/your-username/tremble.git

<span style="color: #6a9955;"># 2. Enter project folder</span>
cd tremble

<span style="color: #6a9955;"># 3. Install dependencies</span>
pnpm install

<span style="color: #6a9955;"># 4. Start development server</span>
pnpm dev
</code>
</pre>

<p>Open <code>http://localhost:3000</code> in your browser to experience Tremble.</p>

<hr />

<div align="center">
  <p><sub>Crafted with 🔊 for music purists worldwide.</sub></p>
</div>
