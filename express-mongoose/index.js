const path = require('path');
const express = require('express');
var methodOverride = require('method-override')

// Models
const Product = require('./models/product');

// Connect MongoDb
const mongoose = require('mongoose');
const { resolveSoa } = require('dns');
mongoose.connect('mongodb://127.0.0.1:27017/shop_db')
    .then(() => {
        console.log('Connect to MongoDB');
    }).catch((err) => {
        console.log(err);
    });

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))


app.get('/', (req,res) => {
    res.send('hello world')
})

app.get('/products', async (req,res) => {
    const products = await Product.find({});
    res.render('products/index', {products})
})

app.get('/products/create', (req,res) => {
    res.render('products/create');
})

app.post('/products', async (req, res) => {
    const product = new Product(req.body);
    try {
        await product.save();
        res.redirect('/products');
    } catch (error) {
        res.send(error)
    }
})

app.get('/products/:id', async (req,res) => {
    const {id} = req.params;
    try {
        const product = await Product.findById(id);
        res.render('products/detail', {product})
    } catch (error) {
        res.send('Product tidak ditemukan')
    }
})

app.get('/products/:id/edit', async (req,res) => {
    const {id} = req.params;
    try {
        const product = await Product.findById(id);
        res.render('products/edit', {product})
    } catch (error) {
        res.send('Product tidak ditemukan')
    }
})

app.put('/products/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await Product.findByIdAndUpdate(id, req.body, {runValidators: true});
        res.redirect('/products');
    } catch (error) {
        res.send(error)
    }
})

app.listen(3000, () => {
    console.log('App running in port http://localhost:3000');
})

