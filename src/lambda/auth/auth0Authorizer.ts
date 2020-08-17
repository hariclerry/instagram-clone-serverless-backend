import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { AxiosResponse } from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'

const logger = createLogger('authorization')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-ubmsssnp.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function getCertificate(kid: string): Promise<{ publicKey: string }> {
  let signingKeys: any
  try {
    if (!signingKeys) {
      const response: AxiosResponse = await Axios.get(jwksUrl)
      var keys = response.data.keys
      if (!keys || !keys.length) {
        throw new Error('The JWKS endpoint did not contain any keys')
      }
      signingKeys = keys
        .filter(
          (key) =>
            key.use === 'sig' &&
            key.kty === 'RSA' &&
            key.kid &&
            ((key.x5c && key.x5c.length) || (key.n && key.e))
        )
        .map((key) => {
          return {
            kid: key.kid,
            nbf: key.nbf,
            publicKey: certToPEM(key.x5c[0])
          }
        })
    }
    const signingKey = signingKeys.find((key) => key.kid === kid)
    return Promise.resolve(signingKey)
  } catch (error) {
    throw new Error('Error fetching cert')
  }
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if (!jwt || !jwt.payload || !jwt.header) {
    throw new Error('Invalid or Expired token.')
  }
  const { kid } = jwt.header

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const certificate: { publicKey: string } = await getCertificate(kid)
  try {
    verify(token, certificate.publicKey, { algorithms: ['RS256'] })
    return Promise.resolve(jwt.payload)
  } catch (err) {
    throw new Error(err)
  }
}
