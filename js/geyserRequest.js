import request from 'superagent'

async function getLinkedAccountForBedrockPlayer(xuid) {
  const endpoint = `https://api.geysermc.org/v2/link/bedrock/${xuid}`
  try {
    const res = await request.get(endpoint)
    return res.body
  } catch (err) {
    console.error(`Error retrieving java account from XUID (Geyser Api down) ${xuid}: ${err.message}`)
    return false
  }
}

async function getLinkedAccountForJavaPlayer(uuid) {
  const endpoint = `https://api.geysermc.org/v2/link/java/${uuid}`
  try {
    const res = await request.get(endpoint)
    return res.body
  } catch (err) {
    console.error(`Error retrieving bedrock data account from uuid (Geyser Api down) ${uuid}: ${err.message}`)
    return false
  }
}

async function getTextureId(xuid) {
  const endpoint = `https://api.geysermc.org/v2/skin/${xuid}`
  try {
    const res = await request.get(endpoint)
    const textureId = res.body.texture_id
    return textureId
  } catch (err) {
    console.error(`Error retrieving textureID account from XUID (Geyser Api down) ${xuid}: ${err.message}`)
    return null
  }
}

async function getGamertag(xuid) {
  const endpoint = `https://api.geysermc.org/v2/xbox/gamertag/${xuid}`
  try {
    const res = await request.get(endpoint)
    const gamertag = res.body.gamertag
    return gamertag
  } catch (err) {
    console.error(`Error retrieving gamertag account from XUID (Geyser Api down) ${xuid}: ${err.message}`)
    return null
  }
}

export default { getLinkedAccountForBedrockPlayer, getLinkedAccountForJavaPlayer, getTextureId, getGamertag }
