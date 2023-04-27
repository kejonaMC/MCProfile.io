import request from 'superagent'

const API_BASE_URL = 'https://api.geysermc.org/v2'

async function handleApiError(error, operationName) {
  console.error(`Error during ${operationName}: ${error.message}`)
  return null
}

async function getLinkedAccountForBedrockPlayer(xuid) {
  const endpoint = `${API_BASE_URL}/link/bedrock/${xuid}`
  
  try {
    const response = await request.get(endpoint)
    return response.body
  } catch (error) {
    return handleApiError(error, 'getLinkedAccountForBedrockPlayer')
  }
}

async function getLinkedAccountForJavaPlayer(uuid) {
  const endpoint = `${API_BASE_URL}/link/java/${uuid}`
  
  try {
    const response = await request.get(endpoint)
    return response.body
  } catch (error) {
    return handleApiError(error, 'getLinkedAccountForJavaPlayer')
  }
}

async function getTextureId(xuid) {
  const endpoint = `${API_BASE_URL}/skin/${xuid}`
  
  try {
    const response = await request.get(endpoint)
    return response.body.texture_id
  } catch (error) {
    return handleApiError(error, 'getTextureId')
  }
}

async function getGamertag(xuid) {
  const endpoint = `${API_BASE_URL}/xbox/gamertag/${xuid}`
  
  try {
    const response = await request.get(endpoint)
    return response.body.gamertag
  } catch (error) {
    return handleApiError(error, 'getGamertag')
  }
}

export default { getLinkedAccountForBedrockPlayer, getLinkedAccountForJavaPlayer, getTextureId, getGamertag }
