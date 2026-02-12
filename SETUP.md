# Exam Hall Allocation System - Setup Instructions

Follow these steps to set up and run the application locally.

## Prerequisite
- Node.js installed
- MongoDB installed and running (default: `localhost:27017`)

## 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Open the `.env` file in the `backend` folder and ensure it has:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/exam_hall_db
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```
4. Seed Admin Account:
   Run the seed script to create the initial admin user:
   ```bash
   node seed.js
   ```
   *Initial Admin Credentials:*
   - **Email:** `admin@example.com`
   - **Password:** `admin123`

5. Start the Backend Server:
   ```bash
   npm start
   ```

## 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 3. Usage Guide
### Admin Flow
1. Login with `admin@example.com` / `admin123`.
2. Manage Halls: Add exam halls and their capacities.
3. Manage Exams: Add exam schedules for specific departments and years.
4. Auto Allocate: Go to the "Allocate" page and select an exam to automatically assign students to halls.
5. Export: Download the full allocation list as a PDF.

### Student Flow
1. Register a new student account (select department and year).
2. Login to view your dashboard.
3. View your assigned hall and seat number.
4. Download your PDF hall ticket for the exam.

## Technologies Used
- **Frontend:** React (Vite), Tailwind CSS, Lucide React, Axios, React Router, React Hot Toast.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, PDFKit.
