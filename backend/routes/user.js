const express = require('express');
const router = express.Router();
const zod = require('zod');
const { User, Account } = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware');
const JWT_SECRET = process.env.JWT_SECRET

const signupBody = zod.object({
  username: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string()
});

router.post('/signup', async(req, res) => {
    const result  = signupBody.safeParse(req.body);

    if(!result.success) {
        return res.status(411).json({
            message: 'Email already taken / incorrect body'
        })
    }

    const userExists = await User.findOne({
        username: req.body.username
    })

    if(userExists) {
        return res.status(411).json({
            message: 'Email already taken / incorrect body'
        })
    }

    const userCreated = await User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    })

    const userId = userCreated._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    return res.status(201).json({
        message: 'User created successfully',
        token
    })
})

const signinBody = zod.object({
    username: zod.string(),
    password: zod.string()
})

router.post('/signin', async(req, res) => {
    const result = signinBody.safeParse(req.body);

    if(!result.success) {
        return res.status(411).json({
            message: 'Incorrect body / email already taken'
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user){
        const userId = user._id

        const token = jwt.sign({
            userId
        }, JWT_SECRET)

        return res.json({
            token
        })
    }

    return res.status(411).json({
        message: 'Error while logging in'
    })
})

const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
})

router.put('/update', authMiddleware, async(req, res) => {
    const result = updateBody.safeParse(req.body);

    if(!result.success) {
        return res.status(411).json({
            message: 'Incorrect body'
        })
    }

    const user = await User.updateOne({
        _id: req.userId
    }, req.body)

    res.json({
        message: 'User updated successfully'
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;