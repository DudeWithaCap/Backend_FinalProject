<h1>Web-Technologies, Back-End</h1>
Adilet Kabiyev

SE-2433

Link: https://backend-finalproject-3ggk.onrender.com/frontend/main.html  


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

GET /books/ - get all books

GET /books/:id - get book by id

POST /books/ - create a new book


PUT /books/:id - update book information, access by id

DELETE /books/:id - delete a book, access by id


<h3>Publishers</h3>

GET /publishers/ - get all publishers

GET /publishers/:id - get publisher by id

POST /publishers/ - create a new publisher


PUT /publishers/:id - update publisher information, access by id

DELETE /publishers/:id - delete publisher, access by id


<h3>Orders</h3>

POST /cart - add books to cart

GET /my - get all books from cart (if added)

DELETE /cart/:BookId - delete a book from cart by BookId

GET order/ - for admins in dashboard to see all orders





<h3>Users</h3>

GET /users/ - get all users

GET /users/:id - get a specific user by id

PUT /users/:id/role - update a specific user information, access by id

DELETE /users/:id - delete a user, access by id



<h3>Authorization and Authentication</h3>

POST /signup - user registration

POST /login - user login

GET /me - get user id


GET /totp/setup - make sure only admins can setup OTP

POST /totp/verify-setup - setup OTP by generating QR code or manual code

POST /totp/verify-login - OTP was set, now it will ask for Google Authenticator codes

<h3>Postman testing collection</h3>

Checking if user exists in database

<img width="856" height="650" alt="image" src="https://github.com/user-attachments/assets/08558ece-a1b8-47ee-aca6-8f5637bf589e" />

Creating a new user

<img width="881" height="659" alt="image" src="https://github.com/user-attachments/assets/ddd72c6b-9f44-40d3-8541-bc8dfaa6fe2f" />

Getting all books

<img width="887" height="613" alt="image" src="https://github.com/user-attachments/assets/ad9f77e4-296b-43f1-a487-bcc246f65fbb" />

Creating a new book

<img width="895" height="657" alt="image" src="https://github.com/user-attachments/assets/4240cd03-2ba3-47f2-9ae5-d46cfeedc896" />

Updating book information

<img width="887" height="669" alt="image" src="https://github.com/user-attachments/assets/0bf9954e-1d31-4ec1-af7e-2c3df366a53e" />

Deleted a book

<img width="883" height="476" alt="image" src="https://github.com/user-attachments/assets/67d1be2d-48cc-4639-8576-cd4186c4717e" />

Get all users

<img width="888" height="654" alt="image" src="https://github.com/user-attachments/assets/56b58da3-9613-424e-aeee-8a2605069e10" />

Adding a book to the cart

<img width="902" height="653" alt="image" src="https://github.com/user-attachments/assets/92e2bdf9-cb23-4f24-9bf2-ace0fb3203d1" />






