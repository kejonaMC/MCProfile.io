import express from 'express'
import { getApiKey, updateApiKey, insertApiKey } from '../js/database.js'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

const router = express.Router()

router.get('/', async (req, res) => {
  const { xboxAccount } = req.session

  try {
    const apiKeyData = await getApiKey(xboxAccount.xuid)

    let apiKeyMessage = "No API key generated yet"
    let requestsPerHour = 0 

    if (apiKeyData) {
      const { apiKey, generatedAt, requestsPerHour: perHour } = apiKeyData

      const currentTime = moment()
      const keyGeneratedTime = moment(generatedAt)
      const minutesSinceGenerated = currentTime.diff(keyGeneratedTime, 'minutes')

      if (minutesSinceGenerated > 10) {
        apiKeyMessage = `Your API key: ${"*".repeat(apiKey.length - 5)}${apiKey.slice(-5)}`
      } else {
        apiKeyMessage = `Your API key: ${apiKey}`
      }

      requestsPerHour = perHour 
    }

    res.render('pages/dashboard', {
      title: 'Dashboard',
      username: xboxAccount.gamertag,
      apiKeyMessage,
      requestsPerHour
    })
  } catch (error) {
    console.error('Error retrieving dashboard data:', error)
    res.status(500).send('An error occurred while retrieving dashboard data.')
  }
})


router.post('/generate-api-key', async (req, res) => {
  const { xboxAccount } = req.session

  try {
    let apiKey

    const existingKey = await getApiKey(xboxAccount.xuid)

    if (existingKey) {
      apiKey = uuidv4()
      await updateApiKey(xboxAccount.xuid, apiKey)
    } else {
      apiKey = uuidv4()
      await insertApiKey(xboxAccount.xuid, apiKey)
    }

    res.redirect('/dashboard')
  } catch (error) {
    console.error('Error generating/regenerating API key:', error)
    res.status(500).send('An error occurred while generating/regenerating the API key.')
  }
})

export default router