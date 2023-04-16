import fs from 'fs'
import path from 'path'

// Define the count variable
let count = 0

// Read the count from the count file
const countFilePath = path.join('count.json')

try {
    const countFileContent = fs.readFileSync(countFilePath, 'utf8')
    const countData = JSON.parse(countFileContent)
    count = countData.count
} catch (err) {
    console.log('No existing count file found')
}

function endpointLogger(req, res, next) {
    // Define the endpoints to log
    const endpoints = ['/api', '/lookup']
    const endpointPath = req.path
    // Check if the endpoint matches
    if (endpoints.some(path => endpointPath.includes(path))) {
        // Increment the count
        count++

        // Log the requester's IP, date, total count, and the endpoint
        const log = {
            ip: req.connection.remoteAddress,
            date: new Date().toISOString(),
            count,
            endpoint: req.path
        }
        console.log(log)

        // Write the new count to the count file
        const countData = { count }
        fs.writeFile(countFilePath, JSON.stringify(countData), (err) => {
            if (err) throw err
            console.log('Count saved to file')
        })

        // Generate the log file name based on the current week number
        const now = new Date()
        const year = now.getUTCFullYear()
        const week = getWeekNumber(now)
        const logFileName = `week_${year}_${week}.json`

        // Create the logs folder if it doesn't exist
        const logsFolderPath = path.join('logs')
        if (!fs.existsSync(logsFolderPath)) {
            fs.mkdirSync(logsFolderPath)
        }

        // Read the existing log file
        let logs = []
        const logFilePath = path.join(logsFolderPath, logFileName)
        try {
            logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'))
        } catch (err) {
            console.log(`No existing log file found for week ${week}`)
        }

        // Append the new log to the log array
        logs.push(log)

        // Write the log array to the log file
        fs.writeFile(logFilePath, JSON.stringify(logs), (err) => {
            if (err) throw err
            console.log(`Log saved to file for week ${week}`)
        })
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