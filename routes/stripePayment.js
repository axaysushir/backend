const express = require("express");
const router = express.Router()
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

const {makePayment} = require('../controllers/stripepayment')

router.post('/stripepayment', makePayment)

module.exports = router