# ECExplain Social Automation Dashboard

A mobile-first, high-performance Progressive Web App (PWA) and curriculum visualizer for the **ECExplain 730-day automated publishing pipeline**.

## Features

- 📱 **Mobile-First Responsive PWA**: Designed for smartphone screens with iOS/Android "Install to Home Screen" support.
- ⏳ **Real-Time Countdown**: Countdown to the official daily 10:00 AM IST release slot.
- 🖼️ **Interactive Slide Viewer**: 1080×1350 resolution card viewer with swipeable 5-slide preview for all 209 educational carousels.
- 📚 **Full 730-Day Curriculum**: Instant search and filtering across all topics (Semiconductors, Analog Circuits, BJT, MOSFET, Op-Amps, Digital Logic, DSP, Control Systems, Communications, Electromagnetics, Network Analysis).
- 📋 **1-Click Copy**: Copy complete formatted captions and hashtag blocks with one tap.
- 📊 **Cloudflare Live Diagnostics**: Live ping to the Cloudflare Worker API, D1 database stats, and R2 media asset verification (1,566/1,566 verified).
- ⚡ **Zero Cost ($0.00/mo)**: Hosted on Vercel's Edge Network connected to Cloudflare Workers, D1, and R2.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide Icons & Custom SVG
- **Hosting**: Vercel
- **Data Source**: Cloudflare D1 & Cloudflare R2 CDN
