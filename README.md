<h1>Web-Technologies, Back-End</h1>
Adilet Kabiyev

SE-2433

Link: https://backendtest-5a11.onrender.com/frontend/main.html 


<h2>Overview</h2>
This final project is a fullstack web app about book store and book store management

Tech stack:

Frontend: HTML, CSS, JS

Backend: Node.js, Express.js, MongoDB, dotenv, CORS, qrcode, speakeasy, JWT


Features

Relational Data Model: Books, Publishers, Orders, Users

JWT Authentication: Secure login/registration flow

Role-based access control (RBAC): guest, customer user, admin

Google Authenitcator-based OTP 2 factor authentication

Password hashing using bcrypt


<h2>Run project locally</h2>

Download the project as a zip, unpack it

Install all dependencies

Create .env file and add your own MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN

Run the project using npm start

<h2>API Documentation</h2>

<h3>Books</h3>

GET /book/ - get all books

GET /book/:id - get book by id

POST /book/ - create a new book


PUT /book/:id - update book information, access by id

DELETE /book/:id - delete a book, access by id


<h3>Publishers</h3>

GET /publisher/ - get all publishers

GET /publisher/:id - get publisher by id

POST /publisher/ - create a new publisher


PUT /publisher/:id - update publisher information, access by id

DELETE /publisher/:id - delete publisher, access by id


<h3>Users</h3>

GET /user/ - get all users

GET /user/:id - get a specific user by id

PUT /user/:id/role - update a specific user information, access by id

DELETE /user/:id - delete a user, access by id


<h3>Authorization and Authentication</h3>

POST /signup - user registration

POST /login - user login

GET /me - get user id


GET /totp/setup - make sure only admins can setup OTP

POST /totp/verify-setup - setup OTP by generating QR code or manual code

POST /totp/verify-login - OTP was set, now it will ask for Google Authenticator codes
