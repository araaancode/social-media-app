// Import required packages
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize the app
const app = express();
const PORT = 8080;
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'auth_system';

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoutes = require("./routes/index")

// MongoDB client
let db;
MongoClient.connect(MONGO_URI)
    .then(client => {
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error(err));

// Middleware to pass session messages to templates
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


// mount Routes
app.use('/M00964713', indexRoutes)


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/M00964713`);
});
