# Children's Activity Playground

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

## 💸 Commercialization & Selling Recommendations

To turn the **Children's Activity Playground** into a profitable business or SaaS, we recommend the following professional upgrades:

### 1. Custom Domain
Set up a custom domain (e.g., `wonderkidsplayground.com`) to establish credibility. You can configure this directly in your repository’s **Pages** settings under **Custom domain**.

### 2. Monetization Model
- **Stripe Checkout**: Integrate Stripe for secure payments. You can offer a one-time lifetime purchase (e.g., $9.99) or a monthly/annual subscription.
- **Paywall / Auth Integration**: Add **Firebase Authentication** and **Firestore** (available natively in this environment) to allow parents to create accounts, save their children's progress, and restrict access to premium games until they subscribe.

### 3. Progressive Web App (PWA) Support
Add a PWA plugin (like `vite-plugin-pwa`) to allow parents to install the application directly onto iPads, tablets, or phones as a native app, which is how most children access digital games.
