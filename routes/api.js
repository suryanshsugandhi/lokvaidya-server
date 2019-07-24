const express = require('express')
const router = express.Router()

const User = require('../models/user')

const mongoose = require('mongoose')
const db = 'mongodb+srv://username:password77@usersdb-kxkrp.mongodb.net/test?retryWrites=true&w=majority'

const jwt = require('jsonwebtoken')

mongoose.connect(db, err => {
    if(err){
        console.error("Error!" + err)
    }
    else{
        console.log("Database connection successful")
    }
})

function verifyToken(req, res, next){
    if(!req.headers.authorization)
        return res.status(401).send('Unauthorized request');
    let token = req.headers.authorization.split(' ')[1];
    if(token == 'null'){
        return res.status(401).send('Unauthorized request');
    }
    let payload = jwt.verify(token, 'secretKey')
    if(!payload){
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

router.get('/', (req, res)=>{
    res.send("From API router")
});

router.post('/register', (req,res)=>{
    let userData = req.body;
    let user = new User(userData);
    user.save((err, registeredUser)=>{
        if(err){
            console.error(err)
        }
        else{
            let payload = { subject : registeredUser._id }
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token});
        }
    });
})

router.post('/login', (req, res)=>{
    let userData = req.body;
    User.findOne({username: userData.username}, (err, user)=>{
        if(err){
            console.error(err)
        }
        else{
            if(!user){
                res.status(401).send('Invalid username')
            }
            else if(user.password != userData.password){
                res.status(401).send('Invalid password')
            }
            else {
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretKey')
                res.status(200).send({token, user})
            }
        }
    })
})

router.get('/fetchUsers', verifyToken, (req, res)=>{
    
    User.find({}, (err, users)=>{
        if(err){
            console.error(err)
        }
        else{
            res.status(200).send(users)
        }
    })
})

router.post('/delete', (req, res)=>{
    User.deleteOne({username: req.body.username}, (err, users)=>{
        if(err){
            console.error(err)
        }
        else{
            res.status(200).send(users)
        }
    })
})

router.post('/update', (req, res)=>{
    User.update({username: req.body.username}, {
        username: req.body.username,
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
    }, (err, users)=>{
        if(err){
            console.log
        }
        else{
            console.log("updated successfully")
        }
    })
})

module.exports = router;