import hexToUuid from 'hex-to-uuid'
import skinRequest from '../js/skinRequest.js'

const bedrockSetup = async (xboxData) => {
  const { profileUsers: [{ settings, id }] } = xboxData
  const [gamertag, icon, gamescore, accounttier] = settings.map((s) => s.value)
  const textureid = (await skinRequest.getTextureId(id)).toString() ?? 'no texture ID found.'
  
  return {
    gamertag,
    xuid: id,
    floodgateuid: createFuuid(parseInt(id, 10)),
    icon,
    gamescore,
    accounttier,
    textureid,
    skin: "https://mc-heads.net/body/" + textureid
  }
}

const javaSetup = async (profileData) => {
  const { id, name, properties } = profileData
  const textures = properties[0].value
  const formattedUuid = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(16, 4)}-${id.substr(20)}`

  return {
    name,
    uuid: formattedUuid,
    textureid: textures,
    skin: "https://mc-heads.net/body/" + name
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