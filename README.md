# 🧠 Mindo

> **A focused cognitive training gym for memory techniques and long-term retention.**  
> Built with React Native, Expo, and TypeScript. Offline-first, distraction-free.

---

## 🎯 About This Document & Review Request

This README is designed as a **comprehensive review overview** for testers, developers, and product advisors. 

It covers:
1. **[Core Product Philosophy](#-product-philosophy)** — How Mindo differs from typical educational apps.
2. **[What Is Built & Working](#-what-is-built-current-features)** — A detailed breakdown of every screen, training module, and retention engine currently in the codebase.
3. **[Architecture & Tech Stack](#-tech-stack--architecture)** — How the app is structured under the hood.
4. **[Review & Feedback Guide](#-review--feedback-guide)** — Key questions and design decisions where your feedback is especially valuable.
5. **[Roadmap & What Can Be Done](#-roadmap--ideas-for-expansion)** — Planned features and potential directions for the product.
6. **[Running Locally](#-getting-started--running-locally)** — How to set up and run the app.

---

## 💡 Product Philosophy

Most memory apps suffer from one of two problems:
- **Course trap**: Walls of text explaining cognitive theories, passive reading with minimal active practice.
- **Gamification trap**: Streaks, coins, gems, and badges that measure *app attendance* rather than genuine memory skill.

Mindo is built around three user sensations:
> **"I know what to do." → "I did it." → "I'm getting better."**

### Core Principles

- **Training app with lessons inside it**: Move from passive reading to active doing. Users immediately encode, place, and retrieve items.
- **One screen = one job**: Zero cognitive clutter. One decision or visualization per screen.
- **Capacity + Retention**: Memorizing 10 items once is encoding; remembering them 7 days later is retention. Mindo tracks both immediate capacity (5 to 20 items) and long-term durability (1d, 3d, 7d, 14d, 30d).
- **Skill Battery instead of Streaks**: Streaks create attendance guilt. Mindo replaces streaks with a **Recall Strength** gauge (with a friendly 10% floor for new users) that reflects active mental fitness.
- **Mental Mode pauses**: Memory techniques require internal visualization. Screens guide users to pause, look away or close their eyes, and mentally rehearse before testing retrieval.
- **Quiet, credible tone**: No pseudo-scientific biological overclaims ("rewiring brain pathways"). The app acts as a calm, encouraging coach.

---

## 🚀 What Is Built (Current Features)

### 1. Onboarding & Raw Baseline Benchmark
- **Streamlined 3-Step Onboarding**: Explains the core purpose immediately ("Train your memory like a muscle") without repetitive wizard screens.
- **Raw Baseline Memory Challenge**: Presents 8 real-world items (Candle, Mirror, Key, Apple, Guitar, Rocket, Banana, Watch) for 20 seconds of unassisted memorization.
- **Benchmark Discovery**: Tests immediate active retrieval without techniques. Most users score 3–5 out of 8, establishing their genuine starting baseline to measure future growth against.

### 2. Technique Training Curricula
Interactive, step-by-step training modules where users practice the technique directly:
- **Memory Palace (Method of Loci)** *(6-step interactive training loop)*:
  1. *Establish Route*: Learn a 4-station home path (Front Door → Sofa → Dining Table → Bed).
  2. *Bizarre Association Drill*: Contrast mundane vs. bizarre, sensory-rich mental anchors (e.g., giant toothbrush covered in sparkly foam).
  3. *Room Placement Picker*: Actively assign an item to a specific station.
  4. *Multi-Item Palette*: Drag/assign items into empty loci slots.
  5. *Active Retrieval Test*: Mental-walk pause ("Put your phone down. Close your eyes and walk through") followed by typed retrieval.
  6. *Milestone Completion*: *"You've learned Memory Palace 🎉 — Now let's train it."*
- **Story Linking**: Narrative association training connecting sequential items through vivid, absurd cause-and-effect chains.
- **Peg System (Rhyme System 1–10)**: Pre-mapped mental pegs (1-Sun, 2-Shoe, 3-Tree, 4-Door, etc.) for ordered, indexed retrieval.

### 3. Custom Palace Builder
- Allows users to create and save personalized spatial routes from their real life (e.g., "My Apartment", "Campus Walk", "Office Floor", "Coffee Shop").
- Define sequential loci names, icons, and room orders.
- Custom palaces are persisted locally and immediately available in gym workouts.

### 4. The Memory Gym (Capacity Training)
- **Progressive Capability Ladder**:
  - **Level 1 (5 items)**: Getting started & technique calibration.
  - **Level 2 (10 items)**: Building core capacity *(requires ≥80% on Level 1)*.
  - **Level 3 (15 items)**: Strong recall & multi-room navigation *(requires ≥80% on Level 2)*.
  - **Level 4 (20 items)**: Advanced challenge *(requires ≥80% on Level 3)*.
- **Focus Workout Flow**:
  - Station-by-station memorization cards with bizarre association hints.
  - **Mental Mode Pause**: Explicit prompt to close eyes and walk through the palace before answering.
  - **Flexible Recall Modes**:
    - *Options Mode*: Quick recognition for beginners.
    - *Type Pro Mode*: True free-recall text entry for deliberate practice.
  - **Personal Best Tracking**: Quietly celebrates new high scores without obnoxious fanfare.

### 5. The Memory Cycle & Spaced Retention Engine
- **Spaced Delayed Recall Intervals**: Every gym workout automatically enrolls the memorized palace into a retention schedule:
  - **Day 1 Check-in** (24 hours later)
  - **Day 3 Check-in** (48 hours later)
  - **Day 7 Check-in** (1 week later)
  - **Day 14 Check-in** (2 weeks later)
  - **Day 30 Check-in** (1 month later)
- **Fading Memory Detection**: Identifies which specific loci or items are slipping from memory.
- **Re-Anchoring Hints**: Offers subtle spatial cues to reinforce weakened associations without spoiling the test.

### 6. Non-Scrollable Dashboard & Recall Strength Engine
- **Zero Vertical Scrolling (`scrollable={false}`)**: The entire home dashboard fits cleanly in a single mobile viewport.
- **Recall Strength Gauge**:
  - Dynamic percentage gauge with smooth visual battery bar.
  - New users start at **10%** (an encouraging baseline rather than an empty 0%).
  - Increases with completed workouts and successful retention check-ins; gently decays if palaces are neglected.
- **Needs Attention Alert Card**: Highlighting when an active palace is due for a retention check.
- **Technique Status Row**: Quick-glance mastery stages (*New → Learning → Building → Skilled → Strong*).

### 7. Progress & Analytics
- **Baseline vs. Current Workout Comparison**: Visualizes items gained since the Day 1 baseline challenge.
- **Personal Best Tracker**: Peak items recalled in a single session.
- **Palace Inventory**: List of built palaces, stations count, and retention statuses.

---

## 🛠 Tech Stack & Architecture

- **Framework**: [React Native](https://reactnative.dev/) (0.86.3) with [Expo](https://expo.dev/) (SDK 57)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero compilation warnings)
- **State & Local Persistence**: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Safe Area Management**: `react-native-safe-area-context`
- **Architecture Highlights**:
  - Fully offline-first: All palaces, retention schedules, and workout histories live on-device.
  - Centralized storage service (`storageService.ts`) with type-safe schema and migration fallbacks.
  - Modular theme system (`theme/index.ts`) using high-contrast, accessible palettes (deep navy typography, violet primary CTA, soft card surfaces).

### Directory Overview

```text
mindo/
├── assets/                # App icons, splash screens, and images
├── src/
│   ├── components/        # Reusable UI (Button, Card, Screen, Header, Battery)
│   ├── data/              # Curricula, default palaces, peg system, practice word banks
│   ├── navigation/        # Bottom tab navigation and stack routing
│   ├── screens/
│   │   ├── home/          # Non-scrollable Recall Strength dashboard
│   │   ├── learn/         # TechniqueLessonScreen, PalaceBuilderScreen, LearnScreen
│   │   ├── onboarding/    # 3-step onboarding & 8-item baseline test
│   │   ├── practice/      # PracticeScreen, PracticeSessionScreen, DelayedRecallScreen
│   │   └── progress/      # Metrics, baseline growth comparison, palace list
│   ├── storage/           # Local storage service & persistence keys
│   ├── theme/             # Colors, typography, spacing, shadows
│   └── types/             # Domain TypeScript interfaces and navigation props
├── App.tsx                # App entry with SafeAreaProvider and Navigation
├── package.json
└── tsconfig.json
```

---

## 📋 Review & Feedback Guide

We are actively seeking feedback on the following aspects of Mindo:

### 1. UX & Cognitive Load
- **Is the transition from learning to practice seamless?** Does the user understand *why* they are creating bizarre mental images?
- **Is the "Mental Mode" pause effective?** Does telling the user to "close your eyes and walk through" feel natural, or does it interrupt flow?
- **Type Pro vs. Multiple Choice**: Is free typing too punishing on mobile keyboards, or is it essential for genuine recall?

### 2. The Retention & Battery Model
- Does the **Recall Strength battery** feel motivating without creating the anxiety/guilt associated with traditional streaks?
- Is the **10% starting floor** clear to brand-new users?
- Are the spaced intervals (1d → 3d → 7d → 14d → 30d) appropriate for casual learners?

### 3. Visual & Aesthetic Polish
- Does the home screen feel complete without requiring vertical scrolling?
- Are the card hierarchies and typography easy to parse at a glance?

---

## 🗺 Roadmap & Ideas for Expansion

Here are directions under consideration where feedback or contributions are welcome:

### 🎯 Applied / Real-World Memory Decks
- **Grocery & Errand Lists**: Quick 5–10 item everyday palace drill.
- **Speeches & Presentations**: Placing talk outline points and key stats across stations.
- **Names & Faces**: Association drills linking distinctive facial features to names.
- **Foreign Language Vocabulary**: Keyword mnemonic system for fast vocabulary acquisition.

### 🔢 Advanced Number & Card Systems
- **The Major System**: Phonetic number-to-consonant mapping (0–9) for phone numbers, dates, and PINs.
- **The Dominic System**: Person-Action (PA) mapping for 2-digit numbers.
- **PAO (Person-Action-Object)**: High-speed memorization for playing cards and 6-digit number chunks.

### 🔔 Local Notifications & Audio
- **Retention Check-in Reminders**: Local, privacy-friendly push notifications when a palace reaches Day 1, Day 3, or Day 7 check-in windows.
- **Guided Audio Palace Walkthroughs**: Gentle voice prompts that guide the user step-by-step through their custom routes with their eyes closed.

### 📊 Cognitive Analytics
- **Forgetting Curve Graph**: Visual plotting of retention percentage over time for each palace.
- **Item Slippage Heatmap**: Pinpoint which stations (e.g., middle vs. ends of a route) suffer the highest error rates (serial position effect).

---

## 💻 Getting Started / Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on iOS or Android (or an emulator/simulator)

### Installation

1. Navigate to the project directory:
   ```bash
   cd mindo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - **Physical Device**: Scan the QR code in your terminal using the Expo Go app (Android) or the Camera app (iOS).
   - **Android Emulator**: Press `a` in the terminal.
   - **iOS Simulator**: Press `i` in the terminal (macOS only).
   - **Web**: Press `w` in the terminal.

### Verifying Types & Quality

To run TypeScript type checks:
```bash
npx tsc --noEmit
```
*(Currently passing with 0 errors).*
