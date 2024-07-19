const path = require('path');
const express = require('express');
var methodOverride = require('method-override')
const session = require('express-session');
const flash = require('connect-flash');

// Models
const Product = require('./models/product');
const Garment = require('./models/garment');

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
const { wrap } = require('module');

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err));
    }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

// Session dan Flash
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/garments', wrapAsync(async (req,res) => {
    const garments = await Garment.find({});
    res.render('garment/index', {garments, message: req.flash('success')});
}))

app.get('/garments/create',(req,res) => {
    res.render('garment/create');
})

app.post('/garments', wrapAsync(async (req,res) => {
    const garment = new Garment(req.body) 
    await garment.save();
    req.flash('success', 'Berhasil menambahkan Garment!');
    res.redirect('/garments');
}))

app.get('/garments/:id', wrapAsync(async(req,res) => {
    const { id } = req.params;
    const garment = await Garment.findById(id).populate('products')
    // res.send(garment)
    res.render('garment/detail', {garment});
}))

app.get('/garments/:garment_id/products/create',(req,res) => {
    const {garment_id} = req.params;
    res.render('products/create', { garment_id });
})

app.post('/garments/:garment_id/products/', wrapAsync(async(req,res) => {
    const {garment_id} = req.params;
    const garment = await Garment.findById(garment_id);
    const product = new Product(req.body);
    garment.products.push(product);
    product.garment = garment;
    await garment.save();
    await product.save();
    console.log(garment);
    res.redirect(`/garments/${garment._id}`);
}))

app.delete('/garments/:garment_id', wrapAsync(async(req, res) => {
    const {garment_id} = req.params;
    await Garment.findOneAndDelete({_id: garment_id});
    res.redirect('/garments');

}))




// PRODUCTS


app.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category });
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({});
        res.render('products/index', { products, category: "All" })
    }
})

app.get('/products/create', (req, res) => {
    res.render('products/create');
})

// app.post('/products', async (req, res, next) => {
//     const product = new Product(req.body);
//     try {
//         await product.save();
//         res.redirect('/products');
//     } catch (error) {
//         next(new errorHandler('Failed to create', 424))
//         // res.status(424).send('Failed to create')
//         // res.status(424).send(error.message)
//     }
// })

app.post('/products', wrapAsync(async (req, res, next) => {
    const product = new Product(req.body);
    await product.save();
    res.redirect('/products');
    // res.status(424).send('Failed to create')
}))

app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('garment');
        res.render('products/detail', { product })
    } catch (error) {
        next(new errorHandler('Product not found', 404));
    }
})

// app.get('/products/:id/edit', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const product = await Product.findById(id);
//         res.render('products/edit', { product })
//     } catch (error) {
//         res.status(500).send(error.message);
//     }

// })

// WRAPPER Error

app.get('/products/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product })
}))



app.put('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, req.body, { runValidators: true });
    res.redirect(`/products/${id}`);
}));

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.use((err, req, res, next) => {
    console.dir(err)
    if(err.name = 'ValidationError') {
        err.status = 400
        err.message = Object.values(err.errors).map(item => item.message);
    }
    next(err)
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log('App running in port http://localhost:3000');
})

