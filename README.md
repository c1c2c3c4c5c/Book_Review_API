# Book Review API

A RESTful API for managing books and reviews, built with **Node.js**, **Express**, and **MongoDB**.

## Features

* **JWT Authentication** (Signup/Login)
* **Book Management**: Create, view, search, and paginate books
* **Review System**: One review per user per book (add/update/delete)
* **Search**: Title & author (partial + case-insensitive)
* **Validation & Error Handling**: Using `express-validator`

## Tech Stack

* **Backend**: Node.js + Express.js
* **Database**: MongoDB + Mongoose
* **Auth**: JWT
* **Validation**: express-validator

## Setup Instructions

1. **Clone & Install**:

   ```bash
   git clone https://github.com/yourname/book-review-api
   cd book-review-api
   npm install
   ```

2. **Create `.env`**:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bookreviews
   JWT_SECRET=your-secure-secret
   ```

3. **Run the server**:

   ```bash
   npm run dev  # for development
   ```

4. **API Base URL**:

   ```
   http://localhost:3000/api
   ```

---

### 1. Project Setup

```bash
# Create project directory
mkdir book-review-api && cd book-review-api

# Initialize npm project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv express-validator cors helmet express-rate-limit

# Install development dependencies
npm install --save-dev nodemon jest supertest
```

### 2. Create Project Structure

```bash
# Create directories
mkdir models routes middleware

# Create main files
touch server.js
touch .env
touch .gitignore
```

The project structure should look like:
```
book-review-api/
├── models/
│   ├── User.js
│   ├── Book.js
│   └── Review.js
├── routes/
│   ├── auth.js
│   ├── books.js
│   ├── reviews.js
│   └── search.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── .env
├── .gitignore
├── server.js
├── package.json
└── README.md
```

## Core Endpoints

* `POST /auth/signup` – Register
* `POST /auth/login` – Login
* `POST /books` – Add book (auth required)
* `GET /books` – List/search books
* `GET /books/:id` – Book with reviews
* `POST /books/:id/reviews` – Add review
* `PUT /reviews/:id` – Update review
* `DELETE /reviews/:id` – Delete review
* `GET /search?q=term` – Search books
* `GET /health` – Server status

