const express = require('express');
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");

// Root route
router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error });
});

// Shop route with middleware
router.get("/shop", isLoggedin, function (req, res) {
    res.render("shop");
});

module.exports = router;
