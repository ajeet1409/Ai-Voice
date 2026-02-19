
import express from 'express'
import {signup, login, logout, getUserProfile}  from '../Controller/userController.js'


const router = express.Router()


router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/profile', getUserProfile)

export default router






