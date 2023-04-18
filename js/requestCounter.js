import fs from 'fs'
import path from 'path'

// Define the requestCount variable
let requestCount = 0

// Read the count from the count file
const requestCountFilePath = path.join('requestCount.json')

try {
    const countFileContent = fs.readFileSync(requestCountFilePath, 'utf8')
    const countData = JSON.parse(countFileContent)
    requestCount = countData.requestCount
} catch (err) {
    console.log('No existing count file found')
}

function incrementRequestCount() {
    // Increment the requestCount
    requestCount++

    // Write the new count to the count file
    const requestCountData = { requestCount }
    fs.writeFile(requestCountFilePath, JSON.stringify(requestCountData), (err) => {
        if (err) throw err
        console.log('Request count saved to file')
    })
}

export { requestCount, incrementRequestCount }

