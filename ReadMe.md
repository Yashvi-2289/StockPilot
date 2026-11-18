
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

## 🔗 API Configuration

The frontend communicates with the backend through Axios.

For local development, configure the API base URL as:

```javascript
http://localhost:5000/api
```

For production, use your deployed backend URL:

```javascript
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



