# Collaborative Task Management System

A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) that allows users to manage projects and tasks collaboratively.

## Features
- **Authentication**: JWT-based user signup and login.
- **Project Management**: Create projects, view projects, and add members.
- **Task Management**: Create, edit, and delete tasks within a project.
- **Drag-and-Drop Task Board**: Interactive Kanban-style board to move tasks between "Todo", "In Progress", and "Done".
- **Dark Mode**: Built-in toggle for light/dark theme.
- **Responsive UI**: Built with Tailwind CSS to ensure mobile and desktop compatibility.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, @dnd-kit (for drag and drop), Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JSONWebToken (JWT), bcryptjs.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB connection URI (e.g., MongoDB Atlas or local MongoDB)

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Open `server/.env` and fill in the values:
   ```env
   PORT="5000"
   MONGODB_URI="your_mongodb_connection_string"
   JWT_SECRET="your_jwt_secret_key"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set the API Base URL. By default, it looks for the backend at `http://localhost:5000/api`. If your backend runs elsewhere, you can configure it in `client/src/App.jsx`.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `server/`: Express application, Mongoose schemas, controllers, and routes.
- `client/`: React application using Vite, configured with Tailwind CSS v4.
