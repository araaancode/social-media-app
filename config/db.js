// MongoDB URI
const uri = 'mongodb://localhost:27017';
const dbName = 'socialmedia';
const { MongoClient } = require('mongodb');
const colors = require("colors")

// MongoDB client
let db;

// Connect to MongoDB
const connect = () => MongoClient.connect(uri)
    .then(client => {
        console.log('Connected to MongoDB'.cyan);
        db = client.db(dbName);
    })
    .catch(err => {
        console.error('MongoDB connection error', err);
    });

module.exports = connect