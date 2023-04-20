import request from 'superagent'

async function getTextureId(xuid) {
    const endpoint = `https://api.geysermc.org/v2/skin/${xuid}`
    try {
        const res = await request.get(endpoint)
        const textureId = res.body.texture_id
        return textureId
    } catch (err) {
        console.error(`Error retrieving texture ID: ${err.message}`)
        return null
    }
}


export default { getTextureId }