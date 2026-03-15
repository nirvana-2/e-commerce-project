# MyShop E-Commerce Platform 🛒

A full-stack e-commerce application featuring an Admin Dashboard for inventory management, a User Dashboard, and integrated eSewa payment processing.

## 🌐 Live Demo

👉 **[https://e-commerce-project-eta-dun.vercel.app](https://e-commerce-project-eta-dun.vercel.app)**

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@myshop.com | admin123 |
| User  | saman@example.com | user1234 |

---

## 🚀 Features
* **Authentication**: Secure JWT-based Login/Register for Users and Admins.
* **Inventory Management**: Full CRUD operations for products (Admin only).
* **Payment Integration**: Seamless checkout using eSewa.
* **User Dashboard**: View orders, manage profile, and check reviews.
* **Admin Dashboard**: Manage users, orders, and products.
* **Cart Management**: Add, remove, and clear items from the cart.
* **Product Reviews**: Leave reviews for products.
* **Order Management**: Track order status and manage order history.
* **Forgot Password**: Reset password functionality.
* **User Profile**: Update user profile information.
* **Reward Points**: Get reward points on purchase and redeem them for discounts.
* **API Documentation**: Interactive documentation powered by Swagger.
* **Category Management**: Add, remove, and update categories (Admin only).
* **Sub-category Management**: Add, remove, and update sub-categories (Admin only).

---

## 🛠️ Tech Stack
* **Frontend**: React.js / Vite / Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas
* **Deployment**: Vercel (Frontend) + Render (Backend)
* **API Docs**: Swagger JSDoc & Swagger UI

---

## 📖 API Documentation
Once the server is running, access the full API documentation at:
`http://localhost:3000/api-docs`

---

## ⚙️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone <your-repo-link>
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Variables** — Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   PORT=3000
   ESEWA_PRODUCT_CODE=EPAYTEST
   ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
   ```

4. **Run the app**
   ```bash
   # Backend
   cd backend && node index.js

   # Frontend
   cd frontend && npm run dev
   ```

5. **Seed the database** (optional)
   ```bash
   cd backend
   node -e "require('./utils/seed.js')" 2>&1
   ```