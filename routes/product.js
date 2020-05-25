const express = require('express')
const router = express.Router()

const {getProductById, createProduct, getProduct, photo, updateProduct, deleteProduct, getAllProducts, getAllUniqueCategories} = require('../controllers/product')
const {isAdmin, isSignedIn, isAuthenticated} = require('../controllers/auth')
const {getUserById} = require('../controllers/user')

router.param('userId', getUserById)
router.param('productId', getProductById)

// actual route
router.post('/product/create/:userId', isAdmin, isSignedIn, isAuthenticated, createProduct)
//read
router.get('/product/:productId', getProduct)
router.get('/product/photo/:productId', photo)
//delete
router.delete('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, deleteProduct)
//update
router.put('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, updateProduct)
//listing

router.get('/products', getAllProducts)

router.get('/products/categories', getAllUniqueCategories)

module.exports = router