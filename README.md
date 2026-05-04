# 💳 Pay Tracker

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Pay Tracker** is a professional, full-stack invoicing and cashflow management platform designed for small businesses and freelancers. It provides a seamless experience for creating invoices, tracking payments, and getting paid faster through integrated UPI and Razorpay support.

---

## ✨ Key Features

- **📊 Dynamic Dashboard**: Real-time analytics of revenue, total users, and invoice status using Recharts.
- **📄 Invoice Management**: Create, view, and manage professional invoices with automatic GST/Tax calculations (CGST, SGST, IGST).
- **💸 Instant Payments**: 
  - Dynamic **UPI QR Code** generation for every invoice.
  - **Razorpay** integration for online credit/debit card payments.
- **🔔 Notification System**: In-app notifications for payment receipts, overdue invoices, and system updates.
- **🛡️ Secure Authentication**: JWT-based authentication with Access & Refresh tokens stored in secure `httpOnly` cookies.
- **🎨 Premium UI/UX**: Built with a "glassmorphism" aesthetic, featuring mesh gradients, smooth Framer Motion transitions, and a fully responsive design.
- **🔑 Admin Panel**: Specialized dashboard for system administrators to monitor platform-wide activity.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **Payments**: Razorpay Node SDK
- **Task Scheduling**: Node-cron
- **Email**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Razorpay API Keys (Optional for online payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pay-tracker.git
   cd pay-tracker
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your MongoDB URI, JWT Secret, and Port
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and add VITE_API_URL=http://localhost:8000/api/v1
   npm run dev
   ```

---

## 📁 Project Structure

```text
Pay-Tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middlewares/     # Auth & Error handlers
│   │   └── utils/           # Helper functions
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Shadcn/Custom)
│   │   ├── routes/          # TanStack Router pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── context/         # React Context providers
```

---

## 🔒 Security Features
- **JWT Refresh Tokens**: Long-lived sessions without compromising security.
- **CORS Protection**: Whitelisted origins for API security.
- **Cookie-based Auth**: `httpOnly` and `Secure` flags to prevent XSS attacks.
- **Sensitive Data Filtering**: Passwords and tokens are excluded from API responses.

---

## 📝 License
This project is licensed under the ISC License.

---
*Created with ❤️ by Parth Sata*
