# Web Authentication API

This project is a Node.js application that implements authentication APIs using Express and MongoDB, including features such as login, signup, user details, and protected routes using JWT tokens for authentication.

## Installation

1. Clone the repository.
2. Install dependencies using `npm install`.

## Usage

1. Start the server using `npm start`.
2. Access the API endpoints using a tool like Postman.

### MongoDB Atlas Configuration

This project uses MongoDB Atlas for the database. The URL of the deployed cluster is `mongodb+srv://admin:12345@webauth.ttqs2k0.mongodb.net/`.

### JWT Secret

The JWT secret key is `mysecretkey123`.

## API Endpoints

### Signup

- **Endpoint:** POST `/api/signup`
- **Body JSON Format:**
  ```json
  {
    "firstName": "FIRST_NAME",
    "lastName": "LAST_NAME",
    "email": "ENTER EMAIL",
    "phoneNumber": "PHONE NUMBER",
    "password": "PASSWORD",
    "address": {
      "street": "STREET",
      "city": "TOWN",
      "state": "STATE",
      "country": "COUNTRY",
      "postalCode": "PINCODE"
    }
  }
