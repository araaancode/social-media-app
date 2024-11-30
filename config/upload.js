const multer = require('multer')
const path = require('path');
const mkdirp = require('mkdirp');
const imagesDir = path.join(__dirname, './uploads/');


module.exports = {
    imageUpload: multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const made = mkdirp.sync(imagesDir);
                cb(null, imagesDir)
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        })
    }),
}

