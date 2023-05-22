import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
    res.render('pages/endpoints', { title: 'API Endpoints', isAuthenticated: req.session.isAuthenticated, })
})

export default router