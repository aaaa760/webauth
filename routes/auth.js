const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/api/signup' , async(req , res) => {
    const {username , email , password} = req.body;

    try {
        const existingUser = await User.findOne({$or : [{username} , {email}]});
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
          });

         
        const savedUser = await newUser.save();
        if (!savedUser) {
            return res.status(500).json({ error: 'User could not be saved' });
        }

        res.status(201).json({ message: 'User created successfully' });


    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

});


router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid Username' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid Password' });
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.get('/api/profile', authMiddleware, async (req, res) => {
    try {
      res.json({ user: req.user });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;