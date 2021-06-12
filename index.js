require('dotenv-defaults').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const imgModel = require('./model');

if (!process.env.MONGO_URL) {
    console.error('Missing MONGO_URL!!!');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error(error)
});

db.once('open', () => {
  console.log('MongoDB connected!')});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
const upload = multer({ storage: storage });

// displays an HTML page showing all the images stored in the database, and provides a UI for uploading new images.
app.get('/', (req, res)=> {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    })
});

// Handle the POST request that processes the form data submitted by the user from our HTML UI.  This request will have the new images being uploaded.
app.post('/', upload.single('image'), (req, res, next)=> {
    const item = {
        name: req.body.name,
        desc: req.body.desc,
        image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }

    imgModel.create(item, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            //item.save();
            res.redirect('/');
        }
    })

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
    if(err) {
        throw err;
    }
    console.log('Server listening on port', PORT);
});