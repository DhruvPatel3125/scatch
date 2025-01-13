const express = require('express');
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require('../models/user-model');

// Home route
router.get("/", (req, res) => {
    let error = req.flash("error");
    res.render("index", { error, loggedin: req.user ? true : false });
});

// Shop route
router.get("/shop", isLoggedin, async (req, res) => {
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        res.render("shop", { products, success });
    } catch (error) {
        console.error("Error loading shop:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Cart route
router.get('/cart', isLoggedin, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user is authenticated
        const user = await userModel.findById(userId).populate('cart');
        
        if (!user || !user.cart || user.cart.length === 0) {
            req.flash("error", "Your cart is empty.");
            return res.redirect("/shop");
        }

        // Calculate the bill
        const cartItem = user.cart[0];
        const bill = (Number(cartItem.price || 0) + 20) - Number(cartItem.disconnect || 0);

        res.render('cart', { user, bill });
    } catch (error) {
        console.error("Error loading cart:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Add to cart route
router.get("/addtocart/:id", isLoggedin, async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await userModel.findOne({ email: req.user.email });

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/shop");
        }

        const product = await productModel.findById(productId);
        if (!product) {
            req.flash("error", "Product not found.");
            return res.redirect("/shop");
        }

        // Add product to cart
        user.cart.push(productId);
        await user.save();

        req.flash("success", "Product added to cart.");
        res.redirect("/shop");
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Logout route
router.get("/logout", isLoggedin, (req, res) => {
    res.cookie("token", ""); // Clear the authentication token
    req.flash("success", "Logged out successfully.");
    res.redirect("/");
});

module.exports = router;
