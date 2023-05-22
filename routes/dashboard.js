import express from 'express'
import { getApiKey, updateApiKey, insertApiKey } from '../js/database.js'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

const router = express.Router()

router.get('/', async (req, res) => {
  const { xboxAccount } = req.session

  try {
    const apiKeyData = await getApiKey(xboxAccount.xuid)

    const apiKeyMessage = apiKeyData ? generateApiKeyMessage(apiKeyData) : "No API key generated yet"
    const { requestsPerHour = 0, totalRequests = 0 } = apiKeyData || {}

    res.render('pages/dashboard', {
      title: 'Dashboard',
      username: xboxAccount.gamertag,
      apiKeyMessage,
      requestsPerHour,
      totalRequests,
    })
  } catch (error) {
    console.error('Error retrieving dashboard data:', error);
    res.status(500).send('An error occurred while retrieving dashboard data.');
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

const generateApiKeyMessage = (apiKeyData) => {
  const { apiKey, generatedAt } = apiKeyData
  const currentTime = moment()
  const keyGeneratedTime = moment(generatedAt)
  const minutesSinceGenerated = currentTime.diff(keyGeneratedTime, 'minutes')

  if (minutesSinceGenerated > 10) {
    return `Your API key: ${"*".repeat(apiKey.length - 5)}${apiKey.slice(-5)}`
  } else {
    return `Your API key: ${apiKey}`
  }
}

export default router