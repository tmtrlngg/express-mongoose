const path = require('path');
const express = require('express');

// Models
const Product = require('./models/product');

// Connect MongoDb
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/shop_db')
    .then(() => {
        console.log('Connect to MongoDB');
    }).catch((err) => {
        console.log(err);
    });

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/', (req,res) => {
    res.send('hello world')
})

app.listen(3000, () => {
    console.log('App running in port http://localhost:3000');
})

