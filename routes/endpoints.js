import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
    res.render('pages/endpoints', { title: 'API Endpoints' })
})

export default router