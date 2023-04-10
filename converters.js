const hexToUuid = require('hex-to-uuid')

// Generate the xboxlive json data.
function jsonCreator(xblJson) {
    var obj = {
        "gamertag": xblJson.profileUsers[0].settings[2].value,
        "xuid": xblJson.profileUsers[0].id,
        "floodgateuid": makeFuuid(parseInt(xblJson.profileUsers[0].id)),
        "icon": xblJson.profileUsers[0].settings[0].value,
    };
    return obj;
}

// Convert xuid into FUUID.
function makeFuuid(xuid) {
    var hexFUUID = "0000000000000000000" + xuid.toString(16);
    return hexToUuid(hexFUUID);
}
function makeXuid(fuuid) {
    var zeroStrip = fuuid.substring(22).replace( /-/g, "" );
    return parseInt(zeroStrip, 16);
}

module.exports = { 
    jsonCreator, 
    makeFuuid, 
    makeXuid,
}