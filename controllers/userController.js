const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// @route GET /users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({
            message: 'No user data is found here'
        })
    }
    res.json(users)
})


// @route POST/users
const createNewUser = asyncHandler(async (req, res) => {
    console.log(req.body, "req bod");
    const { name, mobileNumber, username, password, roles } = req.body

    if(!name || !mobileNumber || !username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate) {
        return res.status(400).json({
            message: 'Duplicate Email ID, Email already exists'
        })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { name, mobileNumber, username, "password": hashedPwd, roles }

    const user = await User.create(userObject)

    if(user) {
        res.status(201).json({
            message: `New user ${username} created`
        })
    }
    else {
        res.status(400).json({
            message: `Invalid user data received`
        })
    }

})


// @route PATCH/users
const updateUser = asyncHandler(async (req, res) => {
    const { id, name, mobileNumber, username, password, roles } = req.body

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const duplicate = await User.findOne({ username }).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({
            message: 'Duplicate Email ID'
        })
    }
    
    user.name = name
    user.mobileNumber = mobileNumber
    user.username = username
    user.roles = roles

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }
    
    const updatedUser = await user.save()

    res.json({
        message: `${updatedUser.username} updated`
    })
})


// @route DELETE/users
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({
            message: 'user ID required'
        })
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({
            message: 'User not found'
        })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}

