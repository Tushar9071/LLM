# 🌐 AI-Powered Language Learning Companion

## Project Overview

Welcome to the AI-Powered Language Learning Companion! This project aims to create an innovative application that revolutionizes language learning through conversational AI, voice recognition, and intelligent grammar correction. Our goal is to provide a dynamic and interactive platform where users can practice a new language in real-time, receive immediate feedback, and gain cultural insights. [cite_start]The application will be accessible via both web and mobile, making language practice convenient anywhere, anytime[cite: 3, 5].

## Key Features (Must-Haves for Hackathon)

* [cite_start]**User Management:** Secure sign-up/login, comprehensive user profiles (avatar, display name, native/target language, proficiency, learning goals), and essential privacy options[cite: 9, 10, 11, 49].
* **Conversational Practice:**
    * [cite_start]**AI Text Chat Mode:** A GPT-style conversational partner that adapts difficulty to the user's proficiency level[cite: 13].
    * [cite_start]**Voice Chat Mode:** Press-to-talk or continuous listening with real-time speech-to-text transcription[cite: 13, 14].
    * [cite_start]**Scenario Selector:** Users can engage in everyday topics (e.g., ordering food, booking travel) or custom prompts, and even select roles for role-playing[cite: 15, 16].
* **Pronunciation Feedback:**
    * [cite_start]Utilizes speech-to-text for phoneme-level analysis[cite: 18, 52].
    * [cite_start]Highlights mispronounced words in real-time (e.g., in red)[cite: 19, 52].
    * [cite_start]Allows users to tap mispronounced words to hear native audio[cite: 19].
* **Grammar & Vocabulary Correction:**
    * [cite_start]Provides inline corrections with errors highlighted in red and corrected forms in green[cite: 22, 54].
    * [cite_start]Offers one-sentence rule explanations with quick examples[cite: 22].
    * [cite_start]Clickable corrected words open a dictionary entry displaying definition, part of speech, and an example sentence[cite: 23, 54].
* [cite_start]**Security & Privacy:** Ensures encrypted communications (HTTPS), hashed passwords (bcrypt/argon2), and options for data export/deletion[cite: 38, 39, 56].
* [cite_start]**Admin Panel (Basic):** A dashboard for content moderation (e.g., reported chat content) and viewing basic usage analytics[cite: 34, 35, 59].
* [cite_start]**Cross-Platform UX:** Responsive web application and a mobile build (Flutter/React Native) to provide a seamless experience across devices[cite: 41, 60]. [cite_start]Includes basic offline support for review decks and syncing when online[cite: 42].

## Optional Enhancements (Stretch Goals for Hackathon)

* [cite_start]**Accent Coach:** Advanced feedback on mouth/tongue positioning and minimal-pair drills[cite: 20, 62].
* [cite_start]**OCR "Scan & Learn":** Scan real-world text (menus, signs), get instant translations and pronunciation, and add words to a personal vocabulary list[cite: 27, 28, 29].
* [cite_start]**Daily Challenges & Streaks:** Gamified mini-missions to encourage consistent practice[cite: 24, 25, 26].

## Technical Stack

The following technologies are recommended for building this application:

* [cite_start]**Front-end (Web):** `React` with `Vite` [cite: 72]
* [cite_start]**Front-end (Mobile):** `React Native` [cite: 72]
* [cite_start]**Back-end:** `Node.js` with `Express` [cite: 74]
* [cite_start]**Database:** `PostgreSQL` [cite: 74]
* **AI/NLP:**
    * [cite_start]`OpenAI Chat Completion API` for text-based conversational AI [cite: 76]
    * [cite_start]`Whisper` / `Mozilla DeepSpeech` for voice-to-text conversion and analysis [cite: 76]
* [cite_start]**OCR (for Scan & Learn):** `Tesseract-ocr` + `OpenCV wrapper` [cite: 78]
* [cite_start]**Hosting:** `Render` / `Railway` (for free tiers during development) or `Firebase Hosting` [cite: 80]
* [cite_start]**CI/CD:** `GitHub Actions` (for automated builds and deployments), `expo-go` (for quick mobile testing) [cite: 82]

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn
* PostgreSQL
* Git

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd ai-powered-language-learning-companion
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd backend # Assuming you'll have a 'backend' folder
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory with your database connection string and any API keys (e.g., OpenAI API key).
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    OPENAI_API_KEY="your_openai_api_key"
    ```
5.  **Run database migrations (if any):**
    ```bash
    # Example using a migration tool like Knex or TypeORM
    npm run migrate
    ```
6.  **Start the backend server:**
    ```bash
    npm start
    # or
    npm run dev # For development with hot reloading
    ```

### Frontend Setup (Web)

1.  **Navigate to the web frontend directory:**
    ```bash
    cd ../frontend-web # Assuming a 'frontend-web' folder
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The web app should now be running at `http://localhost:5173` (or similar, depending on Vite's default port).

### Frontend Setup (Mobile - React Native)

1.  **Navigate to the mobile frontend directory:**
    ```bash
    cd ../frontend-mobile # Assuming a 'frontend-mobile' folder
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Start the Expo development server:**
    ```bash
    npx expo start
    ```
    Follow the instructions in your terminal to open the app on an emulator/simulator or your physical device using the Expo Go app.

## Project Structure (Proposed)