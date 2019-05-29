const express = require('express');
const router = express.Router();
const TokenGenerator = require('uuid-token-generator')
const NotFoundError = require("../utils/not_found_error");
const authChecker = require("../utils/auth_checker");
const models = require('../models');
const debug = require('debug')('app:users');

const onError = (err, res) => {
    debug(err)
    return res.status(500).json({
        error: "Server error",
        message: `${err.name}: ${err.message}`,
    });
};

const tokenGen = new TokenGenerator(256, TokenGenerator.BASE62);


router.post("/", (req, res) => {
    if (!req.body.email)
        return res.status(400).json({ message: "Email is required." });
    if (!req.body.password)
        return res.status(400).json({ message: "Password is required." });
    
    return models.User.create({
        email: req.body.email,
        password: req.body.password,
        token: tokenGen.generate(),
    })
    .then(m => {
        // debug("done and return token", m.token);
        return res.status(200).json({ token: m.token });
    })
    .catch(err => {
        if (err.name === "SequelizeUniqueConstraintError")
            return res.status(400).json({ message: "Assigned email is already exists." });
        else
            onError(err, res)
    });
});

  
router.post("/auth", (req, res) => {
    if (!req.body.email)
        return res.status(400).json({ message: "Email is required." });
    if (!req.body.password)
        return res.status(400).json({ message: "Password is required." });
    
    return models.User.findOne({ where: { 
        email: req.body.email,
        password: req.body.password,
     } })
    .then(m => {
        if (!m) {
            throw new NotFoundError();
        }
        return m.update({ token: tokenGen.generate() }).then(() => m);
    })
    .then(m => {
        return res.status(200).json({ token: m.token });
    })
    .catch(err => {
        if (err instanceof NotFoundError)
            return res.status(400).json({
                error: "Authentication failed",
                message: "Email or password are invalid.",
            });
        else
            return onError(err, res);
    });
});
  


module.exports = router;
