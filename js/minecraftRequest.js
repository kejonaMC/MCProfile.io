import request from 'superagent'
import { Authflow } from 'prismarine-auth'

const BASE_URL = 'https://api.mojang.com'
const CACHE_DIR = './cache'
const USER_IDENTIFIER = 'KejonaMC'

async function requestMCData(identifier, isUsername) {
  try {
    const flow = new Authflow(USER_IDENTIFIER, CACHE_DIR)
    const { userHash, XSTSToken } = await flow.getXboxToken()

    const id = isUsername ? (await request
      .get(`${BASE_URL}/users/profiles/minecraft/${identifier}`)
      .then(res => res.body.id)) : identifier

    const { body } = await request
      .get(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`)
      .set('Authorization', `Bearer ${XSTSToken}`)

    return body
  } catch (error) {
    console.error(error)
    throw new Error('Failed to request Minecraft data')
  }
}

export default { requestMCData }
