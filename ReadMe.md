
# StockPilot – Inventory Management System

A web-based inventory management application designed to help businesses manage products, monitor stock levels, track sales, and maintain inventory efficiently.

## 🚀 Live Demo

- **Frontend:** https://stock-pilot-beta-ten.vercel.app/
- **Backend:** https://stockpilot-backend-l6ns.onrender.com/

## ✨ Features

- **Dashboard:** View inventory summaries and important stock information.
- **Product Management:** Add, edit, view, and delete products.
- **Stock Tracking:** Monitor available product quantities.
- **Low Stock Alerts:** Identify products at or below their calculated reorder points.
- **Inventory Insights:** Calculate estimated days remaining, reorder points, and suggested order quantities.
- **Sales Management:** Record product sales, automatically update stock, and track average daily sales from recorded sale history.
- **Orders Management:** Manage inventory-related orders.
- **Store Accounts:** Create an account for each store and sign in from any device. Products, sales, and orders are kept separate for each store.
- **Password Recovery:** Request a single-use password reset link by email if you forget your password.
- **Settings:** Access application settings.
- **Responsive Design:** Use the application across desktop and mobile devices.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- CSS
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```text
StockPilot/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── ...
│   └── package.json
│
└── README.md
```

*Note: This is a simplified overview of the project structure.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yashvi-2289/StockPilot.git
```

### 2. Navigate to the Project

```bash
cd StockPilot
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
MAIL_FROM=StockPilot <no-reply@example.com>
```

Start the backend server:

```bash
npm start
```

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on the local Vite development URL, usually:

```text
http://localhost:5173
```

## 🏪 Store Accounts

1. Open StockPilot and choose **Create account**.
2. Enter the store name, your name, an email address, and a password of at least 8 characters.
3. Use that account to sign in on the other devices used by the same store. Each store should create its own account.

New store accounts start with an empty inventory. The first account created after this update will receive the existing unassigned products, sales, and orders in the database; later accounts will not see that data. Keep the account email and password available to the store team.

Store account passwords are stored as salted password hashes. Sign-in sessions expire after seven days and are stored as hashes in MongoDB.

To change a password, sign in, open **Settings**, and submit the current password and a new password of 8 to 128 characters. Changing the password signs out other devices; the device used to change it stays signed in.

To recover a forgotten password, select **Forgot password?** on the sign-in form and enter the account email. The link sent to that email expires after one hour and can only be used once. Resetting the password signs out all devices. Configure `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM` in the backend environment before enabling this feature. Use your deployed frontend URL for `FRONTEND_URL` in production.

## 🔗 API Configuration

The frontend communicates with the backend through Axios.

For local development, the frontend uses `http://localhost:5000/api` by default. Start the backend and frontend in separate terminals:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

The backend needs a valid `MONGO_URI` in `backend/.env`. To override the frontend API URL, set `VITE_API_BASE_URL`. In production, the default is the deployed backend URL:

```text
https://stockpilot-backend-l6ns.onrender.com/api
```

## 🔐 Environment Variables

Never upload your `.env` file or database credentials to GitHub.

Make sure `.env` is included in `.gitignore`.

## 🎯 Project Objective

The main objective of StockPilot is to simplify inventory management by providing a centralized platform for product management, stock monitoring, sales tracking, and restocking decisions.

## 👩‍💻 Author

**Yashvi**

Computer Engineering Student

- GitHub: https://github.com/Yashvi-2289
- LinkedIn: https://linkedin.com/in/gecr-comp230200107126

---



