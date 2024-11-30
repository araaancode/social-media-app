const express = require("express")
const router = express.Router()


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        req.session.message = 'All fields are required.';
        return res.redirect('/register');
    }

    try {
        const user = await db.collection('users').findOne({ username });
        if (user) {
            req.session.message = 'Username already exists.';
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({ username, password: hashedPassword });
        req.session.message = 'Registration successful. Please log in.';
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.session.message = 'Something went wrong. Please try again.';
        res.redirect('/register');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        req.session.message = 'All fields are required.';
        return res.redirect('/login');
    }

    try {
        const user = await db.collection('users').findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.session.message = 'Invalid username or password.';
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.message = 'Login successful.';
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.session.message = 'Something went wrong. Please try again.';
        res.redirect('/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            req.session.message = 'Error logging out. Please try again.';
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

module.exports = router