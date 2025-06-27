# Netflix_MVP

_Empowering seamless streaming experiences, effortlessly connected._

<p align="center">
  <img alt="last-commit" src="https://img.shields.io/github/last-commit/Prashamtogadiya/Netflix?style=flat&logo=git&logoColor=white&color=E50914" />
  <img alt="repo-top-language" src="https://img.shields.io/github/languages/top/Prashamtogadiya/Netflix?style=flat&color=E50914" />
  <img alt="repo-language-count" src="https://img.shields.io/github/languages/count/Prashamtogadiya/Netflix?style=flat&color=E50914" />
</p>

<p align="center">
  <em>Built with:</em><br/>
  <img alt="Express" src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" />
  <img alt="Mongoose" src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=flat&logo=Mongoose&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" />
  <img alt="Redux" src="https://img.shields.io/badge/Redux-764ABC.svg?style=flat&logo=Redux&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4.svg?style=flat&logo=TailwindCSS&logoColor=white" />
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" />
  <img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" />
  <img alt="Radix UI" src="https://img.shields.io/badge/RadixUI-18181b.svg?style=flat&logo=react&logoColor=white" />
  <img alt="MUI" src="https://img.shields.io/badge/MUI-007FFF.svg?style=flat&logo=mui&logoColor=white" />
  <img alt="Lottie" src="https://img.shields.io/badge/Lottie-00BFFF.svg?style=flat&logo=lottie&logoColor=white" />
  <img alt="PostCSS" src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white" />
  <img alt="Autoprefixer" src="https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=flat&logo=Autoprefixer&logoColor=white" />
  <img alt=".ENV" src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" />
</p>

---

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Netflix_MVP** is a robust full-stack streaming MVP inspired by Netflix, featuring a modern React + Redux frontend and a secure Express/MongoDB backend. It is designed for rapid development, maintainability, and a seamless user experience.

### Why Netflix_MVP?
- **Modern UI/UX:** Netflix-style layouts, responsive design, and reusable React components.
- **Robust Authentication:** Secure login/signup, JWT-based authentication, protected routes, and error handling.
- **Profile Management:** Multiple profiles per user, profile selection, and avatar support.
- **Movie Management:** Browse, search, add, edit, and delete movies (admin features included).
- **Centralized State:** Redux for authentication, profiles, and movies, with clear separation of concerns.
- **API Management:** Axios for all API calls, with a single configuration point.
- **Admin Panel:** Manage movies with advanced search, edit, and delete capabilities.
- **Reviews:** Users can add and view reviews for each movie.
- **My List:** Save favorite movies to a personal list per profile.
- **Infinite Scroll & Carousels:** Modern browsing experience with carousels and infinite scroll.

---

## Getting Started

### Prerequisites
- **Node.js** (v16+ recommended)
- **npm** (v8+ recommended)
- **MongoDB** (local or Atlas cluster)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Prashamtogadiya/Netflix
   cd Netflix
   ```
2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```
3. **Install frontend dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```

### Usage

- **Start the backend server:**
  ```sh
  cd backend
  npm run dev
  ```
- **Start the frontend dev server:**
  ```sh
  cd frontend
  npm run dev
  ```
- Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- **Netflix-style responsive UI** (React + Tailwind CSS)
- **Authentication** (signup, login, JWT, protected routes)
- **Profile management** (create, select, delete profiles, avatar selection)
- **Movie management** (add, update, delete, browse movies, admin panel)
- **"My List" feature** for profiles
- **Movie reviews** (add/view reviews per movie)
- **Advanced search** (search by title, genre, actor)
- **Infinite scroll & carousels** for browsing movies
- **Centralized API and state management** (Axios, Redux)
- **Error handling and user feedback dialogs** (Radix UI, MUI)
- **Modular, maintainable codebase**

---

## Screenshots

> _Add screenshots here for: Home, Movie Detail, Admin Panel, My List, etc._

---

## Project Structure
````markdown
backend
├── config
│   └── db.js
├── controllers
│   ├── auth.controller.js
│   ├── movie.controller.js
│   ├── profile.controller.js
│   └── review.controller.js
├── middlewares
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models
│   ├── Movie.js
│   ├── User.js
│   └── Profile.js
├── routes
│   ├── auth.routes.js
│   ├── movie.routes.js
│   ├── profile.routes.js
│   └── review.routes.js
├── .env
├── .gitignore
├── package.json
└── server.js

frontend
├── public
│   ├── index.html
│   └── vite.svg
├── src
│   ├── api
│   │   └── index.jsx
│   ├── app
│   │   └── store.js
│   ├── components
│   │   ├── AdminNavbar.jsx
│   │   ├── ActorCarousel.jsx
│   │   ├── CreateProfileForm.jsx
│   │   ├── HeroCarousel.jsx
│   │   ├── MovieCarousel.jsx
│   │   ├── MovieForm.jsx
│   │   ├── MyListCarousel.jsx
│   │   ├── Navbar.jsx
│   │   ├── NetflixLoader.jsx
│   │   ├── ReviewSection.jsx
│   │   ├── SearchBar.jsx
│   │   └── ui
│   │       ├── button.jsx
│   │       └── dialog.jsx
│   ├── features
│   │   ├── profiles
│   │   │   └── profileSlice.js
│   │   └── user
│   │       └── userSlice.js
│   ├── pages
│   │   ├── AdminPanelPage.jsx
│   │   ├── AllMoviesPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MakeNewProfile.jsx
│   │   ├── MovieDetailPage.jsx
│   │   ├── Movies.jsx
│   │   ├── MyListPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── SignupPage.jsx
│   ├── App.jsx
│   ├── index.js
│   └── styles
│       └── tailwind.css
├── package.json
└── vite.config.js
```

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeatureName`.
3. Make your changes and commit them: `git commit -m 'Add your feature'`.
4. Push to your forked repository: `git push origin feature/YourFeatureName`.
5. Create a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.