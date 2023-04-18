import hexToUuid from 'hex-to-uuid'

export function jsonCreator(xboxData) {
  const { profileUsers } = xboxData
  const { settings, id } = profileUsers[0]
  const obj = {
    gamertag: settings[0].value,
    xuid: id,
    floodgateuid: makeFuuid(parseInt(id)),
    icon: settings[1].value,
  }
  return obj
}

export function makeFuuid(xuid) {
  const hexFUUID = `0000000000000000000${xuid.toString(16)}`
  return hexToUuid(hexFUUID)
}

export function makeXuid(fuuid) {
  const zeroStrip = fuuid.substring(22).replace(/-/g, '')
  return parseInt(zeroStrip, 16)
}

export default {
  jsonCreator,
  makeFuuid,
  makeXuid
}