const Product = require('../models/product');
const BigPromise = require('../middleware/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const WhereClass = require('../utils/whereClause');

exports.addProduct = BigPromise(async (req, res, next)=>{
    let imageArray = []

    if(!req.files){
        return next(new CustomError('Please Provide an Image',401));
    }

    if(req.files){
        for(let index = 0; index < req.files.photos.length; index++){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder: "products"
            })

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
    };

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true
    })
});

exports.getAllProducts = BigPromise(async (req, res, next)=>{
    const productPerPage = 4;

    const productsObject = new WhereClass(Product.find(),req.query).search().filter();

    let products = await productsObject.base;
    const filteredProductNumber = products.length

    productsObject.pager(productPerPage);

    //.clone() is used to chain up when using 2 or more methods in mongoose
    products = await productsObject.base.clone();

    res.status(200).json({
        success: true
    });
});

exports.adminAllProducts = BigPromise(async (req, res, next)=>{
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })
});

exports.getOneProduct = BigPromise(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new CustomError('Product does not exist',401));
    }

    res.status(200).json({
        success: true
    })
});

exports.adminUpdateProduct = BigPromise(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new CustomError('Product does not exist',401));
    }

    let imageArray = []

    if(req.files){
        for(let idx = 0;idx<product.photos.length;idx++)
        {
            const res = await cloudinary.v2.uploader.destroy(product.photos[idx].id);
        }
        for(let index = 0; index < req.files.photos.length; index++){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder: "products"
            })

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
    }
    req.body.photos = imageArray;
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true,
        });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError('Product does not exist',401));
    }
    for(let idx = 0; idx<product.photos.length;idx++){
        await cloudinary.v2.uploader.destroy(
            product.photos[idx].id
        );
    }

        await product.remove();
    
        res.status(200).json({
            success: true,
        })
});

exports.addReview = BigPromise(async (req, res ,next)=>{
    const { rating,comment,productId } = req.body;

    //Make an object to push
    const review ={
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);

    //Check if review exists or not
    const AlreadyReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    //If exists, replace
    if(AlreadyReview){
        product.reviews.forEach((review)=>{
            if(review.user.toString() === req.user._id.toString()){
                    review.comment = comment;
                    review.rating = rating;
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numerOfReviews=product.reviews.length;
    }
    product.ratings = product.reviews.reduce((acc,item)=>{
        (item.rating+acc)/product.reviews.length
    },0);

    await product.save({validateBeforeSave: false});
    
    res.status(200).json({
        success: true
    })
});

exports.deleteReview = BigPromise(async (req, res, next)=>{
    const { productId } = req.query.productId;

    const reviews =product.reviews.filter(
        (rev)=>rev.user.toString() === req.user._id.toString()
    );

    const numerOfReviews = reviews.length;

    product.ratings = product.reviews.reduce((acc,item)=>{
        (item.rating+acc)/product.reviews.length
    },0);
    
    await Product.findByIdAndUpdate(productId,{
        reviews,
        ratings,
        numerOfReviews
    },{
        new: true,
        runValidators: true
    });

});

exports.getReviews = BigPromise(async (req, res, next)=>{
    const {productId} = req.query;
    const product  = await Product.findById(productId);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
});