import hexToUuid from 'hex-to-uuid'
import geyserRequest from '../js/geyserRequest.js'

async function bedrockSetup(xboxData) {
  const { profileUsers: [{ settings, id }] } = xboxData
  const [gamertag, icon, gamescore, accounttier] = settings.map((s) => s.value)
  const skinBaseUrl = 'https://textures.minecraft.net/texture/'
  let textureid
  let linkage = {}
  let linked = false

  try {
    textureid = await geyserRequest.getTextureId(id)
    linkage = await geyserRequest.getLinkedAccountForBedrockPlayer(id)
  } catch (error) {}

  if (linkage && Object.keys(linkage).length !== 0) {
    linked = true
  }

  const bedrockSetupObject = {
    gamertag,
    xuid: id,
    floodgateuid: createFuuid(parseInt(id, 10)),
    icon,
    gamescore,
    accounttier,
    textureid,
    skin: textureid ? skinBaseUrl + textureid : null,
    linked,
  }

  if (linked) {
    const { java_id, java_name } = linkage
    bedrockSetupObject.java_uuid = java_id
    bedrockSetupObject.java_name = java_name
  }

  return bedrockSetupObject
}


const javaSetup = async (profileData) => {
  const { id, name, properties } = profileData
  const decodedTexture = Buffer.from(properties[0].value, 'base64').toString('utf-8')

  const formattedUuid = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(16, 4)}-${id.substr(20)}`

  const { SKIN, CAPE } = JSON.parse(decodedTexture).textures
  const skinUrl = SKIN ? SKIN.url : null
  const capeUrl = CAPE ? CAPE.url : null

  let linked = false
  let bedrockAccountDetails = {}

  try {
    const linkage = await geyserRequest.getLinkedAccountForJavaPlayer(id)

    if (linkage && linkage.length && Object.keys(linkage[0]).length !== 0) {
      linked = true;
      bedrockAccountDetails = {
        bedrock_gamertag: await geyserRequest.getGamertag(linkage[0].bedrock_id),
        bedrock_xuid: linkage[0].bedrock_id,
        bedrock_fuid: createFuuid(parseInt(linkage[0].bedrock_id, 10)),
      }
    }
  } catch (error) {}

  return {
    username: name,
    uuid: formattedUuid,
    skin: skinUrl,
    cape: capeUrl,
    linked,
    ...bedrockAccountDetails,
  }
}

const createFuuid = (xuid) => {
  const hexFUUID = `0000000000000000000${xuid.toString(16)}`
  return hexToUuid(hexFUUID)
}

const createXuid = (fuuid) => parseInt(fuuid.substring(22).replace(/-/g, ''), 16)

export default {
  bedrockSetup,
  javaSetup,
  createFuuid,
  createXuid,
}