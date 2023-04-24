import { requestCount, incrementRequestCount} from './requestCounter.js'
import fs from 'fs'
import path from 'path'

async function endpointLogger(req, res, next) {
  // Define the endpoints to log
  const endpoints = ['/api', '/lookup']
  const endpointPath = req.path

  // Check if the endpoint matches
  if (endpoints.some((path) => endpointPath.includes(path))) {
    await incrementRequestCount()

    // Log the requester's IP, date, total requestCount, and the endpoint
    const log = {
      ip: req.ip,
      date: new Date().toISOString(),
      requestCount,
      endpoint: req.path,
    }
    console.log(log)

    // Generate the log file name based on the current week number
    const now = new Date()
    const year = now.getUTCFullYear()
    const week = getWeekNumber(now)
    const logFileName = `week_${year}_${week}.json`

    // Create the logs folder if it doesn't exist
    const logsFolderPath = path.join('logs')
    try {
      await fs.promises.mkdir(logsFolderPath, { recursive: true })
    } catch (err) {
      console.log(`Error creating logs folder: ${err}`)
    }

    // Read the existing log file
    const logFilePath = path.join(logsFolderPath, logFileName)
    let logs = []
    try {
      const logFileContent = await fs.promises.readFile(logFilePath, 'utf8')
      logs = JSON.parse(logFileContent)
    } catch (err) {
      console.log(`No existing log file found for week ${week}`)
    }

    // Append the new log to the log array
    logs.push(log)

    // Write the log array to the log file
    try {
      await fs.promises.writeFile(logFilePath, JSON.stringify(logs))
      console.log(`Log saved to file for week ${week}`)
    } catch (err) {
      console.log(`Error writing log file: ${err}`)
    }
  }

  next()
}

// Function to get the week number
function getWeekNumber(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1)
  const timeDiff = date - oneJan
  const week = Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000))
  return week
}

export default endpointLogger