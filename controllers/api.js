// MongoDB URI
const uri = 'mongodb://localhost:27017';
const dbName = 'socialmedia';
const { MongoClient, ObjectId } = require('mongodb');
const colors = require("colors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// MongoDB client
let db;
let usersCollection;

// Connect to MongoDB
MongoClient.connect(uri)
    .then(client => {
        console.log('Connected to MongoDB'.cyan);
        db = client.db(dbName);
        usersCollection = db.collection('users');
        postsCollection = db.collection('posts');
    })
    .catch(err => {
        console.error('MongoDB connection error', err);
    });



// test api
// route -> /
// method -> GET
exports.testApi = (req, res) => {
    res.send("test api")
}

// register user
// route -> /users
// method -> POST
exports.register = async (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
        return res.status(400).send('name and phone and password are required.');
    }

    try {
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ phone });
        if (existingUser) {
            return res.status(400).send('phone is already taken.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({ name, phone, password: hashedPassword });
        res.redirect('/');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
}

// check login status
// route -> /login
// method -> GET
exports.checkLogin = (req, res) => {
    res.send("check login")
}


// login user
// route -> /login
// method -> POST
exports.login = async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).send('phone and password are required.');
    }

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ phone });
        if (!user) {
            return res.status(401).send('Invalid credentials.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid credentials.');
        }

        req.session.userId = user._id;
        req.session.phone = user.phone;
        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
}

// logout user
// route -> /login
// method -> DELETE
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
}

// *********************************** ***** ***********************************
// *********************************** posts ***********************************
// *********************************** ***** ***********************************

// create posts
// route -> /contents
// method -> POST
exports.createPost = async (req, res) => {
    try {
        const { userId, content, title } = req.body;
        if (!userId || !content) {
            return res.status(400).json({ message: 'userId and content are required' });
        }

        // Add post to the database
        const postCollection = db.collection("posts");
        const result = await postCollection.insertOne({
            userId,
            content,
            title,
            image: req.files.image[0].filename,
            createdAt: new Date(),
        });

        res.status(201).json({ message: "Post created", postId: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating post" });
    }
};


// get all posts from followings
// route -> /contents
// method -> GET
exports.getAllPosts = async (req, res) => {
    try {
        const postCollection = db.collection("posts");
        const posts = await postCollection.find().toArray();

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching posts" });
    }
}

// follow 
// route -> /follow
// method -> POST
exports.follow = async (req, res) => {
    const { followerId, followeeId } = req.body;

    if (!ObjectId.isValid(followerId) || !ObjectId.isValid(followeeId)) {
        return res.status(400).json({ error: 'Invalid user IDs' });
    }

    if (followerId === followeeId) {
        return res.status(400).json({ error: 'Users cannot follow themselves' });
    }

    try {
        // Add followeeId to the following list of followerId
        const updateFollower = await usersCollection.updateOne(
            { _id: new ObjectId(followerId) },
            { $addToSet: { following: followeeId } }
        );

        // Add followerId to the followers list of followeeId
        const updateFollowee = await usersCollection.updateOne(
            { _id: new ObjectId(followeeId) },
            { $addToSet: { followers: followerId } }
        );

        if (updateFollower.modifiedCount > 0 && updateFollowee.modifiedCount > 0) {
            res.status(200).json({ message: 'Followed successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// unfollow 
// route -> /follow
// method -> DELETE
exports.unfollow = async (req, res) => {
    const { followerId, followeeId } = req.body;

    if (!ObjectId.isValid(followerId) || !ObjectId.isValid(followeeId)) {
        return res.status(400).json({ error: 'Invalid user IDs' });
    }

    try {
        // Remove followeeId from the following list of followerId
        const updateFollower = await usersCollection.updateOne(
            { _id: new ObjectId(followerId) },
            { $pull: { following: followeeId } }
        );

        // Remove followerId from the followers list of followeeId
        const updateFollowee = await usersCollection.updateOne(
            { _id: new ObjectId(followeeId) },
            { $pull: { followers: followerId } }
        );

        if (updateFollower.modifiedCount > 0 && updateFollowee.modifiedCount > 0) {
            res.status(200).json({ message: 'Unfollowed successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}


// search users 
// route -> /users/search
// method -> POST
exports.searchUsers = async (req, res) => {
    try {
        const { name } = req.query;

        // Build the query object dynamically based on provided parameters
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive name search

        // Fetch users from the database
        const users = await db.collection('users').find(query).toArray();

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// search contents 
// route -> /contents/search
// method -> POST
exports.searchContents = async (req, res) => {
    try {
        const { title, content } = req.query;

        // Build the query object dynamically based on provided parameters
        const query = {};
        if (title) query.title = { $regex: title, $options: 'i' }; // Case-insensitive name search
        if (content) query.content = { $regex: content, $options: 'i' }; // Case-insensitive name search

        // Fetch posts from the database
        const posts = await db.collection('posts').find(query).toArray();

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

