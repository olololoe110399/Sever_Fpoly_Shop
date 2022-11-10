const express = require ('express');
const router = express.Router ();
const controllerCustomer = require ('../controllers/customers');
const controllerProduct = require("../controllers/product");
module.exports = router;
// Customer
router.post ('/sign_in', controllerCustomer.checkLogin);
router.post ('/profile', controllerCustomer.getProfile);
router.post ('/update_profile', controllerCustomer.update_profile_android);
router.post ('/sign_up', controllerCustomer.sign_up_android);

// Product
router.get ('/:category', controllerProduct.getProductsByCategory);
// Genre
router.get ('/genre/list', controllerProduct.getGenres);
// Producer
router.get ('/producer/list', controllerProduct.getProducers);
//discover
router.get ('/discover/product', controllerProduct.getProductsDiscover);
//Search
router.get ('/search/product', controllerProduct.getProductsByName);
router.get ('/movie/:movie_id', controllerProduct.getProductDetails);
