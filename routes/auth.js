import express from 'express'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { body, validationResult } from 'express-validator'
import {
    createUser,
    getUserByEmail,
    updateUserPassword,
    getUserByVerificationToken,
    updateUserVerificationStatus,
    updateUserResetToken,
    getUserByResetToken,
    clearUserResetToken,
} from '../js/database.js'

const router = express.Router()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_APP_PASSWORD,
    }
})

router.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/auth/dashboard')
    } else {
        res.render('pages/register', { title: 'Register', error: '', success: '' })
    }
})

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Invalid email'),
        body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            // Handle validation errors
            return res.render('pages/register', { title: 'Register', error: '' })
        }

        const { name, email, password } = req.body

        try {
            // Check if the email is already registered
            const existingUser = await getUserByEmail(email)

            if (existingUser) {
                return res.render('pages/register', { title: 'Register', error: 'Email is already registered' })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            // Generate verification token
            const verificationToken = crypto.randomBytes(20).toString('hex')

            // Create user in the database
            await createUser(name, email, hashedPassword, verificationToken)

            // Send verification email
            sendVerificationEmail(email, name, verificationToken)

            res.render('pages/login', { title: 'Login', error: '', success: 'Verification email was send, Please check your inbox.' })
        } catch (error) {
            console.error(`Error registering user: ${error}`)
            res.render('pages/register', { title: 'Register', error: 'Failed to register user' })
        }
    }
)


router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/auth/dashboard')
    } else {
        res.render('pages/login', { title: 'Login', error: '', success: '' })
    }
})


router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await getUserByEmail(email)

        if (user) {
            // Compare the provided password with the stored encrypted password
            const passwordMatch = await bcrypt.compare(password, user.password)

            if (passwordMatch) {
                req.session.loggedIn = true
                req.session.user = user
                res.redirect('/auth/dashboard')
            } else {
                // Invalid credentials
                res.render('pages/login', {
                    title: 'Login',
                    error: 'Invalid email or password',
                })
            }
        } else {
            // Invalid credentials
            res.render('pages/login', {
                title: 'Login',
                error: 'Invalid email or password',
            })
        }
    } catch (error) {
        console.error(`Error logging in: ${error}`)
        res.render('pages/login', {
            title: 'Login',
            error: 'Failed to log in',
        })
    }
})

router.get('/logout', (req, res) => {
    // Clear the session data and end the session
    req.session.destroy((error) => {
        if (error) {
            console.error(`Error logging out: ${error}`)
            res.render('pages/dashboard', { title: 'Dashboard', error: 'Failed to log out' })
        } else {
            res.redirect('/')
        }
    })
})

router.get('/dashboard', (req, res) => {
    if (req.session.loggedIn) {
        // User is logged in, render the dashboard
        res.render('pages/dashboard', { title: 'Dashboard', user: req.session.user.name })
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/auth/login')
    }
})

router.get('/verify/:token', async (req, res) => {
    const { token } = req.params

    try {
        // Find the user by verification token
        const user = await getUserByVerificationToken(token)

        if (!user) {
            return res.render('pages/verify', { title: 'Email Verification', error: 'Invalid or expired verification token', success: '' })
        }

        // Update user status as verified
        await updateUserVerificationStatus(user.id, true)

        res.render('pages/login', { title: 'Email Verification', success: 'Email verified successfully', error: '' })
    } catch (error) {
        console.error(`Error verifying email: ${error}`)
        res.render('pages/verify', { title: 'Email Verification', error: 'Failed to verify email', success: '' })
    }
})

router.get('/lost-password', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/auth/dashboard')
    } else {
        res.render('pages/lost-password', { title: 'Lost Password', error: "", success: '' })
    }
})

router.post('/lost-password', async (req, res) => {
    const { email } = req.body

    try {
        // Find the user by email
        const user = await getUserByEmail(email)

        if (!user) {
            return res.render('pages/lost-password', { title: 'Lost Password', error: 'Email not found', success: '' })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex')

        // Update user's reset token in the database
        await updateUserResetToken(user.id, resetToken)

        // Send password reset email
        sendPasswordResetEmail(email, resetToken)

        res.render('pages/login', { title: 'Lost Password', success: 'Password reset instructions sent to your email', error: '' })
    } catch (error) {
        console.error(`Error requesting password reset: ${error}`)
        res.render('pages/lost-password', { title: 'Lost Password', error: 'Failed to request password reset', success: '' })
    }
})

router.get('/reset-password/:token', async (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/auth/dashboard')
    } else {
        const { token } = req.params

        try {
            // Find the user by reset token
            const user = await getUserByResetToken(token)

            if (!user) {
                return res.render('pages/reset-password', { title: 'Reset Password', error: 'Invalid or expired reset token', success: '' })
            }

            res.render('pages/reset-password', { title: 'Reset Password', token, error: '', success: '' })
        } catch (error) {
            console.error(`Error resetting password: ${error}`)
            res.render('pages/reset-password', { title: 'Reset Password', error: 'Failed to reset password', success: '' })
        }
    }
})

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    try {
        // Find the user by reset token
        const user = await getUserByResetToken(token)

        if (!user) {
            return res.render('pages/reset-password', { title: 'Reset Password', error: 'Invalid or expired reset token', success: '' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user's password in the database
        await updateUserPassword(user.id, hashedPassword)

        // Clear the reset token from the database
        await clearUserResetToken(user.id)

        res.render('pages/login', { title: 'Reset Password', token, success: 'Password reset successfully', error: '' })
    } catch (error) {
        console.error(`Error resetting password: ${error}`)
        res.render('pages/reset-password', { title: 'Reset Password', error: 'Failed to reset password', success: '' })
    }
})

function sendVerificationEmail(email, name, token) {
    // Read the email template file
    const emailTemplate = fs.readFileSync('./templates/verification-email.html', 'utf-8')

    // Replace placeholders with actual values
    const emailContent = emailTemplate
        .replace('{{name}}', name)
        .replace('{{link}}', `${process.env.BASE_URL}/auth/verify/${token}`)

    // Send the email
    const mailOptions = {
        from: "MCProfile",
        to: email,
        subject: 'Email Verification MCProfile',
        html: emailContent,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending verification email: ${error}`)
        } else {
            console.log(`Verification email sent: ${info.response}`)
        }
    })
}

function sendPasswordResetEmail(email, token) {
    // Read the email template file
    const emailTemplate = fs.readFileSync('./templates/password-reset-email.html', 'utf-8')

    // Replace placeholders with actual values
    const emailContent = emailTemplate
        .replace('{{name}}', email)
        .replace('{{link}}', `${process.env.BASE_URL}/auth/reset-password/${token}`)

    // Send the email
    const mailOptions = {
        from: "MCProfile",
        to: email,
        subject: 'Password Reset MCProfile',
        html: emailContent,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending password reset email: ${error}`)
        } else {
            console.log(`Password reset email sent: ${info.response}`)
        }
    })
}


export default router