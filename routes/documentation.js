import express from 'express'
import { requestCount, incrementRequestCount } from '../js/requestCounter.js'

const router = express.Router()

router.get('/', (req, res) => {
    res.render('pages/documentation', { requestCount })
})

export default router