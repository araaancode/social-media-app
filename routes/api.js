const express = require("express")
const router = express.Router()

const apiControllers = require("../controllers/api")

const { imageUpload } = require("../config/upload")


// authentication
router.post('/users', apiControllers.register)
router.get('/login', apiControllers.checkLogin)
router.post('/login', apiControllers.login)
router.delete('/login', apiControllers.logout)

// posts
router.post('/contents', imageUpload.fields([{ name: "image", maxCount: 1 }]), apiControllers.createPost)
router.get('/contents', apiControllers.getAllPosts)

// follow - unfollow
router.post('/follow', apiControllers.follow)
router.delete('/follow', apiControllers.unfollow)

// search
router.get('/users/search', apiControllers.searchUsers)
router.get('/contents/search', apiControllers.searchContents)

module.exports = router