import fs from 'fs'
import path from 'path'

// Read the count from the count file
const requestCountFilePath = path.resolve('requestCount.json')
let { requestCount } = { requestCount: 0 }

try {
  const countFileContent = fs.readFileSync(requestCountFilePath, 'utf8')
  const countData = JSON.parse(countFileContent)
  ({ requestCount } = countData)
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

export { requestCount, incrementRequestCount }