import request from 'superagent'
import { Authflow } from 'prismarine-auth'

const BASE_URL = 'https://profile.xboxlive.com'
const USER_IDENTIFIER = 'KejonaMC'
const CACHE_DIR = './cache'
const PARAMS = {
  settings: 'Gamertag,GameDisplayPicRaw,Gamerscore,AccountTier',
}

async function requestXBLData(extension) {
  try {
    const flow = new Authflow(USER_IDENTIFIER, CACHE_DIR)
    const { userHash, XSTSToken } = await flow.getXboxToken()
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `XBL3.0 x=${userHash};${XSTSToken}`,
      'x-xbl-contract-version': '3',
    }
    const response = await request
      .get(BASE_URL + extension)
      .query(PARAMS)
      .set(headers)
    return response
  } catch (error) {
    console.error(error)
    throw new Error('Failed to request Xbox Live data.')
  }
}

export default { requestXBLData }