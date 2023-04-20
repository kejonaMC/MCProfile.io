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

async function getSkinImage(textureId) {
    try {
        const response = await request
            .get(`https://mc-heads.net/body/${textureId}`)
            .responseType('arraybuffer')

        const imageBlob = new Blob([response.body], { type: 'image/png' })
        const imageSrc = URL.createObjectURL(imageBlob)

        return imageSrc
    } catch (error) {
        console.error(`Error retrieving skin image: ${error.message}`)
        return null
    }
}

export default { getTextureId, getSkinImage }