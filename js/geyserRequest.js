import request from 'superagent'

async function getLinkedAccountForBedrockPlayer(xuid) {
  const endpoint = `https://api.geysermc.org/v2/link/bedrock/${xuid}`
  try {
    const res = await request.get(endpoint)
    return res.body
  } catch (err) {
    console.error(`Error retrieving linked account for XUID ${xuid}: ${err.message}`)
    throw new Error(`Error retrieving linked account for XUID ${xuid}`)
  }
}

async function getLinkedAccountForJavaPlayer(uuid) {
  const endpoint = `https://api.geysermc.org/v2/link/java/${uuid}`
  try {
    const res = await request.get(endpoint)
    return res.body
  } catch (err) {
    console.error(`Error retrieving linked account for UUID ${uuid}: ${err.message}`)
    throw new Error(`Error retrieving linked account for UUID ${uuid}`)
  }
}

async function getTextureId(xuid) {
  const endpoint = `https://api.geysermc.org/v2/skin/${xuid}`
  try {
    const res = await request.get(endpoint);
    const textureId = res.body.texture_id;
    return textureId;
  } catch (err) {
    console.error(`Error retrieving texture ID for XUID ${xuid}: ${err.message}`)
    throw new Error(`Error retrieving texture ID for XUID ${xuid}`)
  }
}

export default { getLinkedAccountForBedrockPlayer, getLinkedAccountForJavaPlayer, getTextureId }
