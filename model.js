const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    image: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('image', ImageSchema);