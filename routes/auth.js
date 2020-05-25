const express = require("express");
const router = express.Router();
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("name", "Name should be atleast 3 Character").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "password should be atleast 5 charcters").isLength({
      min: 5
    })
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "password is requires").isLength({
      min: 5
    })
  ],
  signin
);

router.get("/signout", signout);
router.get('/test', isSignedIn, (req, res) => {
  res.json(req.auth)
})
module.exports = router;
