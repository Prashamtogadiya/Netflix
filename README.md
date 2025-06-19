# Netflix Clone MVP

A full-stack Netflix-inspired streaming platform built with **React**, **Redux**, **Express**, **MongoDB**, and **Tailwind CSS**.

---

## 🚀 Features

- **Modern Netflix UI**: Responsive, dark-themed, and visually rich.
- **Authentication**: Secure signup/login with JWT, cookies, and refresh tokens.
- **Multiple Profiles**: Each user can create/manage multiple profiles with avatars.
- **Movie Browsing**: Browse, search, and view detailed movie pages.
- **My List**: Add/remove movies to a personal list per profile.
- **Reviews**: Add and view reviews/comments on movies.
- **Carousels**: Swipeable and button-controlled carousels for movies and actors.
- **Loader**: Netflix-style loader for smooth UX.
- **Protected Routes**: Only authenticated users can access main app features.
- **Maintainable Code**: Modular React components, Redux for state, RESTful backend.

---

## 🏗️ Project Structure

```
backend/
  ├── config/
  ├── controllers/
  ├── middlewares/
  ├── models/
  ├── routes/
  ├── .env
  └── server.js

frontend/
  ├── public/
  ├── src/
  │   ├── api/
  │   ├── app/
  │   ├── components/
  │   ├── features/
  │   ├── pages/
  │   ├── styles/
  │   └── index.css
  ├── tailwind.config.js
  ├── .env
  └── App.jsx
```

---

## 🛠️ Tech Stack

- **Frontend**: React, Redux Toolkit, React Router, Tailwind CSS, Axios, Vite
- **Backend**: Express, MongoDB (Mongoose), JWT, bcryptjs, cookie-parser, dotenv, cors
- **Other**: Swiper (for carousels), shadcn/ui (for dialogs), Lottie (for loader)

---

## 🖥️ Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Prashamtogadiya/Netflix
   cd Netflix
   ```

2. **Backend setup:**
   ```sh
   cd backend
   npm install
   # Create a .env file with your MongoDB URI and JWT secrets
   npm run dev
   ```

3. **Frontend setup:**
   ```sh
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Visit:**  
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 Usage

- **Sign up** and create your account.
- **Create/select a profile** (multiple profiles per user).
- **Browse movies**, add to "My List", and watch trailers.
- **Leave reviews** and see others' comments.
- **Switch profiles** or log out anytime.

---

## 📝 Example .env files

**backend/.env**
```
MONGO_URI=mongodb://localhost:27017/netflix
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License.  
© {new Date().getFullYear()} Prasham Togadiya

---

## 🙏 Credits

- Netflix UI inspiration
- [Tailwind CSS](https://tailwindcss.com/)
- [Swiper.js](https://swiperjs.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [LottieFiles](https://lottiefiles.com/)