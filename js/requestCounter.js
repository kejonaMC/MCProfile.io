import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Set the path to the count file in the root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const requestCountFilePath = path.join(path.resolve(__dirname, '../'), 'requestCount.json')

// Read the count from the count file
let requestCount = 0

try {
  const countFileContent = fs.readFileSync(requestCountFilePath, 'utf8')
  const countData = JSON.parse(countFileContent)
  requestCount = countData.requestCount
} catch (err) {
  console.log('No existing count file found')
}

async function incrementRequestCount() {
  // Increment the requestCount
  requestCount++

  // Write the new count to the count file
  const requestCountData = { requestCount }

  try {
    await fs.promises.writeFile(
      requestCountFilePath,
      JSON.stringify(requestCountData)
    )
    console.log('Request count saved to file')
  } catch (err) {
    throw err
  }
}

export { requestCount, incrementRequestCount, }