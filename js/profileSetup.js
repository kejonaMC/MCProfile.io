import hexToUuid from 'hex-to-uuid'
import geyserRequest from '../js/geyserRequest.js'

async function bedrockSetup(xboxData) {
  const { profileUsers: [{ settings, id }] } = xboxData
  const [gamertag, icon, gamescore, accounttier] = settings.map((s) => s.value)
  let textureid = 'no texture ID found.'
  let linkage = {}
  let isLinked = false

  try {
    let textureidRaw = await geyserRequest.getTextureId(id)
    textureid = `https://mc-heads.net/body/${textureidRaw}`
    linkage = await geyserRequest.getLinkedAccountForBedrockPlayer(id)
  } catch (error) {}

  console.log(textureid)
  console.log(linkage)

  if (linkage && Object.keys(linkage).length !== 0) {
    isLinked = true
  }

  const bedrockSetupObject = {
    gamertag,
    xuid: id,
    floodgateuid: createFuuid(parseInt(id, 10)),
    icon,
    gamescore,
    accounttier,
    textureid,
    skin: textureid,
    isLinked,
  }

  if (isLinked) {
    const { java_id, java_name } = linkage;
    bedrockSetupObject.java_uuid = java_id;
    bedrockSetupObject.java_name = java_name;
  }

  return bedrockSetupObject;
}


const javaSetup = async (profileData) => {
  const { id, name, properties } = profileData;
  const textures = properties[0].value;
  const formattedUuid = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(16, 4)}-${id.substr(20)}`;
  const textureid = textures || 'no texture ID found.';

  let isLinked = false;
  let bedrockAccountDetails = {};

  try {
    const linkage = await geyserRequest.getLinkedAccountForJavaPlayer(id);

    if (linkage && linkage.length && Object.keys(linkage[0]).length !== 0) {
      isLinked = true;
      bedrockAccountDetails = {
        bedrock_gamertag: await geyserRequest.getGamertag(linkage[0].bedrock_id),
        bedrock_xuid: linkage[0].bedrock_id,
        bedrock_fuid: createFuuid(parseInt(linkage[0].bedrock_id, 10)),
      };
    }
  } catch (error) {}

  return {
    name,
    uuid: formattedUuid,
    textureid,
    skin: `https://mc-heads.net/body/${name}`,
    isLinked,
    ...bedrockAccountDetails,
  };
};

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