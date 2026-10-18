# WonderKids

An interactive, educational, and fully responsive digital playground for kids. This application is crafted with **React, TypeScript, Tailwind CSS, and Framer Motion**, featuring delightful animations, micro-interactions, and sound synthesis designed to keep children engaged while they learn.

---

## 🎨 Core Features

1. **🎨 Color Sorting** – Interactive drag-and-drop mechanics to group objects by color.
2. **📐 Shape Matching** – Cognitive exercises to align shapes with their correct slots.
3. **✨ Pattern Completion** – Logic puzzles prompting children to complete sequences.
4. **🌻 Counting Garden** – Interactive visualization where kids plant, count, and watch flowers grow.
5. **🔤 Phonics Spelling** – Interactive letter-matching with high-contrast text and sound synthesis.
6. **➕ Math Adventure** – Gamified addition and subtraction exercises.
7. **📖 Storybook Reader** – Interactive story reading exercises complete with voice synthesis (TTS) to read stories aloud.

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build for Production
To generate static production files:
```bash
npm run build
```
The output will be generated inside the `./dist` folder.

---

## 📦 How to Deploy to GitHub Pages (Perfect Setup)

This repository is pre-configured with a modern, official **GitHub Actions** workflow to automatically build and deploy the playground on every push to the `main` branch.

### Setup Instructions
1. Go to your repository settings on GitHub: **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions** from the dropdown menu.
3. Push or sync your latest changes (including `.github/workflows/deploy.yml`) to your `main` branch.
4. Go to the **Actions** tab on your repository to watch your deployment run. It will be live in seconds at `https://<your-username>.github.io/<your-repo-name>/`!

---

---

## 📱 iOS Releases

The iOS build runs in GitHub Actions (see `IOS_DEPLOYMENT_GUIDE.md`). It no longer runs on every push: push a version tag (for example `git tag v1.1.0 && git push origin v1.1.0`) or start it manually from the Actions tab to upload a build to TestFlight.
