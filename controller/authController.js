const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken} = require("../utils/generateToken")

module.exports.registerUser = async function(req,res){
    try {
     let {email,password,fullname} = req.body;

     let user = await userModel.findOne({email:email})
     if(user) return res.status(401).send("you already have an account, please login")
     
 
     bcrypt.genSalt(10,function(err,salt){
         bcrypt.hash(password,salt,async function(err,hash){
             if(err) return res.send(err.message)
                 else { let user =  await userModel.create({
                     email,
                     password:hash,
                     fullname,
             
                 });
                 let token = generateToken(user);
               res.cookie("token",token)
               res.send("user created successfully") 
             }
         })
     })
 
    }catch (error) {
         res.send(error.message);
    }
}

module.exports.loginUser = async function (req, res) {
    try {
      const { email, password } = req.body;
  
      // Find user in the database
      const user = await userModel.findOne({ email: email });
      if (!user) {
        return res.status(401).render("login", { error: "Invalid email or password" });
      }
  
      // Compare hashed password
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
          const token = generateToken(user);
  
          // Set the token in a cookie
          res.cookie("token", token);
  
          // Redirect to /shop route
          return res.redirect("/shop");
        } else {
          return res.status(401).render("login", { error: "Invalid email or password" });
        }
      });
    } catch (error) {
      res.status(500).render("error", { error: error.message });
    }
  };
  

module.exports.logout = function(req,res){
    res.cookie("token","");
    res.redirect("/");
}