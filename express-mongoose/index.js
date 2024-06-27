const path = require('path');
const express = require('express');
var methodOverride = require('method-override')

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

// Error
const errorHandler = require('./ErrorHandler');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))


app.get('/', (req,res) => {
    res.send('hello world')
})

app.get('/products', async (req,res) => {
    const {category} = req.query;
    if (category) {
        const products = await Product.find({category});
        res.render('products/index', {products, category})
    } else {
        const products = await Product.find({});
        res.render('products/index', {products, category: "All"})
    }
})

app.get('/products/create', (req,res) => {
    res.render('products/create');
})

app.post('/products', async (req, res, next) => {
    const product = new Product(req.body);
    try {
        await product.save();
        res.redirect('/products');
    } catch (error) {
        next(new errorHandler('Failed to create', 424))
        // res.status(424).send('Failed to create')
    }
})

app.get('/products/:id', async (req,res, next) => {
    const {id} = req.params;
    try {
        const product = await Product.findById(id);
        res.render('products/detail', {product})
    } catch (error) {
        next(new errorHandler('Product not found', 404));
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
        res.redirect(`/products/${id}`);
    } catch (error) {
        res.send(error)
    }
})

app.delete('/products/:id', async (req, res) => {
    const {id} = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.use((err, req, res, next) => {
    const {status = 500 , message = 'Something went wrong'} = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('App running in port http://localhost:3000');
})

