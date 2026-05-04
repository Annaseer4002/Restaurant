# Restaurants Management API

A RESTful Node.js API for managing a restaurant platform. The project covers user authentication, restaurant records, menu management, order processing, and payment flows in a single Express and MongoDB backend.

## Features

- User registration, login, password reset, and protected user management
- Restaurant creation, listing, update, and deletion
- Menu creation, browsing, filtering by restaurant, update, and deletion
- Order placement, tracking, status updates, cancellation, and deletion
- Payment initiation and verification endpoints
- JWT-based authorization for protected routes

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- nodemailer
- cors

## Project Structure

```text
index.js
controllers/
middlewares/
models/
routes/
utils/
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- Gmail account or SMTP-compatible email credentials for password reset emails

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root and add the following values:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
ACCESS_TOKEN=your_jwt_secret
USER_EMAIL=your_email_address
USER_PASSWORD=your_email_password_or_app_password
```

### Run the Project

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The server starts on `PORT` or defaults to `8000`.

## API Base Path

All routes are mounted under `/api`.

## Main Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgotPassword`
- `PATCH /api/auth/resetPassword`
- `GET /api/auth/users`
- `DELETE /api/auth/deleteUser/:id`

### Restaurants

- `POST /api/restaurant/createRestaurant`
- `GET /api/restaurant/getRestaurants`
- `GET /api/restaurant/getOneRestaurant/:id`
- `PATCH /api/restaurant/updateRestaurant/:id`
- `DELETE /api/restaurant/deleteRestaurant/:id`

### Menu

- `POST /api/menu/createMenu`
- `GET /api/menu/getMenus`
- `GET /api/menu/getMenu/:id`
- `GET /api/menu/getMenusByRestaurant/:id`
- `PATCH /api/menu/updateMenu/:id`
- `DELETE /api/menu/deleteMenu/:id`

### Orders

- `POST /api/order/placeOrder`
- `GET /api/order/getOrders`
- `GET /api/order/getOrder/:id`
- `GET /api/order/myOrders`
- `GET /api/order/restaurantOrders/:id`
- `PATCH /api/order/updateOrderStatus/:id`
- `PATCH /api/order/cancelOrder/:id`
- `GET /api/order/orderStatus/:id`
- `DELETE /api/order/deleteOrder/:id`

### Payments

- `POST /api/payments/initiate/:orderId`
- `GET /api/payments/verify/:reference`

## Authentication

Protected endpoints expect an `Authorization` header in the format:

```http
Authorization: Bearer <token>
```

## Health Check

The root route returns a simple status response:

```http
GET /
```

## Notes

- The application connects to MongoDB during startup and only begins listening after a successful database connection.
- Email functionality is configured through Nodemailer and is used for password reset workflows.

## License

ISC