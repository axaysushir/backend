const User = require('../models/user')
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')

exports.signup = (req, res) => {
    // console.log('REQ BODY', req.body); // check the request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }


    const user = new User(req.body)  // create object from user class
    
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: 'Not able to save user in DB'
            })
        } 
        res.json({
            name: user.name,
            email: user.email,
            id: user._id,
        })
    })
}

exports.signin = (req, res) => {
    const errors = validationResult(req)
    const {email, password} = req.body

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }
    User.findOne({email}, (err, user) => {
        if (err || !user) {
           return res.status(400).json({
                error: "User email doesn't exists."
            })
        }

        if(!user.authenticate(password)) {
           return res.status(401).json({
                error: "Email & Password does not match."
            })
        }
        // crete toekn
        const token = jwt.sign({_id: user._id}, process.env.SECRET)
        // put in cookie
        res.cookie('token', token, {expire: new Date() + 3600})

        // send res to frontend
        const {_id, name, email, role} = user
        return res.json({token, user: {_id, name, email, role}})
    })
}

exports.signout = (req, res) => {
    res.clearCookie('token')
    res.json({
        message: "User signout successfully."
    })
}

//proctected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: 'auth',
})

// middleware custom made
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id 
    if (!checker) {
        return res.status(403).json({
            error: "Access Denied"
        })
    }
    next()
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "You are not ADMIN..."
        })
    }
    next()
}
