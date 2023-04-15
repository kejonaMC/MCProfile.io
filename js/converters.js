import hexToUuid from 'hex-to-uuid'
// Generate the xboxlive json data.
export function jsonCreator(xboxData) {
    var obj = {
        "gamertag": xboxData.profileUsers[0].settings[0].value,
        "xuid": xboxData.profileUsers[0].id,
        "floodgateuid": makeFuuid(parseInt(xboxData.profileUsers[0].id)),
        "icon": xboxData.profileUsers[0].settings[1].value,
    };
    return obj
}
// Convert xuid into FUUID.
export function makeFuuid(xuid) {
    var hexFUUID = "0000000000000000000" + xuid.toString(16)
    return hexToUuid(hexFUUID)
}
// Convert FUID to xuid.
export function makeXuid(fuuid) {
    var zeroStrip = fuuid.substring(22).replace( /-/g, "" )
    return parseInt(zeroStrip, 16)
}

export default {jsonCreator, makeFuuid, makeXuid}