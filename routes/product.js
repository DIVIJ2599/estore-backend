const express = require('express');
const router = express.Router();

const { addProduct, 
    getAllProducts, 
    adminAllProducts, 
    adminUpdateProduct,
    adminDeleteProduct,
    getOneProduct,
    addReview,
    deleteReview,
    getReviews} = require("../controllers/productController");

const { isLoggedIn, customRole } = require('../middleware/user');

//User Routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);

//Review Routes
router.route("/review").put(addReview).delete(deleteReview);
router.route("/reviews").get(getReviews);

//Admin Routes
router.route("/admin/product/add").post( isLoggedIn, customRole("admin") ,addProduct);
router.route("/admin/allProducts").get(isLoggedIn, customRole('admin'),adminAllProducts);
router  
    .route("admin/product/:id")
    .put(isLoggedIn, customRole('admin'),adminUpdateProduct)
    .delete(isLoggedIn, customRole('admin'),adminDeleteProduct);
module.exports = router;

