# webiLink – Real-Time Video Collaboration Platform

**webiLink** is a full-stack, real-time video collaboration platform built with **Next.js**, **Node.js**, **Express**, and **MongoDB**. It supports authenticated video sessions, live chat, session tools, and subscription-based access control — all with a clean separation between user and admin roles.

---

## 🌐 Live Demo  
https://webi-link.vercel.app/

---

## 👨‍💻 Developed by  
**Muhammed Shuraif**

---

## 🚀 Features

### 👥 User-Side Functionality

- **Authentication**
  - Google Sign-in
  - OTP-based signup, login, password reset
- **Profile Management**
  - View and edit user details
- **Plans & Subscriptions**
  - View subscription plans
  - Subscribe via Stripe
  - Feature access based on plan tier
- **Meeting Management**
  - Create rooms and invite participants via email (with scheduled time)
- **Live Session Tools**
  - Real-time video conferencing
  - Group chat and DMs with emoji reactions
  - Raise hand, mute/unmute
  - Screen sharing and whiteboard tools
  - Session recording
  - Timer inside meeting
  - QA & Poll
  - Note taking and downloading
  - Caption recording and downloading
- **User Experience**
  - Responsive UI
  - Dark/light mode toggle

---

### 🛠️ Admin-Side Functionality

- **Authentication**
  - Secure admin login
- **User Management**
  - View, block, and force logout users
- **Plan Management**
  - Create, update, and archive (soft delete) subscription plans

---

## 🧰 Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS  
- **Backend**: Node.js, Express.js, MongoDB  
- **Real-Time Communication**: Socket.io, SDK-based video integration (replacable with WebRTC)
- **Authentication**: JWT, Refresh Tokens, Google OAuth, OTP  
- **Payments**: Stripe  
- **Deployment & DevOps**: Docker, CI/CD (GitHub Actions), AWS S3/EC2 , Vercel 

---

## 📁 Project Structure

```
webiLink/
├── frontend/             # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
├── backend/             # Express backend
│   ├── config/
│   ├── controllers/
│   ├── dto/
│   ├── interfaces/
│   ├── mappers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── types/
│   ├── utils/
│   ├── docker/         # Docker & deployment configs
│          
├── .github/            # GitHub Actions (CI/CD)
├── .env
└── README.md
```

---

## 🧪 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Shuraifp/webiLink.git
cd webiLink
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
MONGO_URI=<your_mongo_connection_string>
ACCESS_TOKEN_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
JWT_SECRET=<your_jwt_secret>
PORT=5000
NODEMAILER_EMAIL_USER=<user_mail>
NODEMAILER_EMAIL_PASS=<pass>
FRONTEND_URL=http://localhost:3000
ZEGO_APP_ID=<app_id>
ZEGO_SERVER_SECRET=<find_in_your_zegoDashboard>
STRIPE_SECRET_KEY=<find_in_your_account>
STRIPE_WEBHOOK_SECRET=<find_in_your_account>
AWS_S3_BUCKET=<folder_name>
AWS_ACCESS_KEY_ID=<find_in_your_account>
AWS_SECRET_ACCESS_KEY=<find_in_your_account>
```

Start the backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

The app will run at: `http://localhost:3000`

Create a `.env.local` file in `frontend/` with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<find_in_your_dashboard>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<find_in_your_dashboard>
NEXT_PUBLIC_FIREBASE_APP_ID=<find_in_your_dashboard>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<find_in_your_dashboard>
NEXT_PUBLIC_DOMAIN=webiLink.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=muhammedshuraif
NEXT_PUBLIC_ZEGO_APP_ID=<find_in_your_zego_dashboard>
NEXT_PUBLIC_ZEGO_SERVER_SECRET=find_in_your_zego_dashboard>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<find_in_your_dashboard>

```
---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB Atlas or local instance
- Google OAuth credentials
- Stripe test keys
- Docker (optional)
- CI/CD with github workflows (optional)
- AWS (for production deployment)

---

## 📌 Note

The real-time communication system is powered by zegocloud integration, making it easier to ship features quickly while leaving the door open for a future transition to a custom WebRTC stack.

---

## 📝 License

This project is open-source under the [MIT License](LICENSE).
