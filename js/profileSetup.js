import hexToUuid from 'hex-to-uuid'
import geyserRequest from '../js/geyserRequest.js'

const bedrockSetup = async (xboxData) => {
  const { profileUsers: [{ settings, id }] } = xboxData
  const [gamertag, icon, gamescore, accounttier] = settings.map((s) => s.value)
  const textureid = (await geyserRequest.getTextureId(id)).toString() ?? 'no texture ID found.'
  const linkage = await geyserRequest.getLinkedAccountForBedrockPlayer(id)
 
  let isLinked = false
  if (Object.keys(linkage).length !== 0) {
    isLinked = true
  }

  return {
    gamertag,
    xuid: id,
    floodgateuid: createFuuid(parseInt(id, 10)),
    icon,
    gamescore,
    accounttier,
    textureid,
    skin: "https://mc-heads.net/body/" + textureid,
    isLinked,
    ...(isLinked && {
      java_uuid: linkage.java_id,
      java_name: linkage.java_name,
    })
  }
}

const javaSetup = async (profileData) => {
  const { id, name, properties } = profileData
  const textures = properties[0].value
  const formattedUuid = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(16, 4)}-${id.substr(20)}`

  const linkage = await geyserRequest.getLinkedAccountForJavaPlayer(id)

  let isLinked = false
  if (Object.keys(linkage[0]).length !== 0) {
    isLinked = true
  }

  return {
    name,
    uuid: formattedUuid,
    textureid: textures,
    skin: "https://mc-heads.net/body/" + name,
    isLinked,
    ...(isLinked && {
      bedrock_gamertag: name,
      bedrock_xuid: linkage[0].bedrock_id,
      bedrock_fuid: createFuuid(parseInt(linkage[0].bedrock_id, 10)),
    })
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
