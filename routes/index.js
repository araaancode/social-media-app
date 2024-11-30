const express = require("express")
const router = express.Router()

// dashboard page
router.get('/', (req, res) => {
    if (req.session.userId) {
        return res.render('dashboard', { username: req.session.username });
    }
    res.render('index');
});

// dashboard page
router.get('/register', (req, res) => {
    res.render('register');
});


router.get('/login', (req, res) => {
    res.render('login');
});



module.exports = router
