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

async function getXboxAccount(accessToken) {
  try {
    const xboxAuth = await request
      .post('https://user.auth.xboxlive.com/user/authenticate')
      .send({
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: 'd=' + accessToken,
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT',
      })
      .set({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      })

    const xstsAuth = await request
      .post('https://xsts.auth.xboxlive.com/xsts/authorize')
      .send({
        Properties: {
          SandboxId: 'RETAIL',
          UserTokens: [xboxAuth.body.Token],
        },
        RelyingParty: 'http://xboxlive.com',
        TokenType: 'JWT',
      })
      .set({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      })

    return {
      gamertag: xstsAuth.body.DisplayClaims.xui[0].gtg,
      xuid: xstsAuth.body.DisplayClaims.xui[0].xid,
    }
  } catch (error) {
    throw error
  }
}

export default { requestXBLData, getXboxAccount }