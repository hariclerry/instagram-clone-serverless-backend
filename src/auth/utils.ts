import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Extract a JWT token from Authentication header
 * @param authHeader value of auth header
 * @returns JWT token
 */
export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

/**
 * Extract and parse userId
 * @param authHeader value of auth header
 * @returns userId
 */
export function getUserId(authHeader: string): string {
  const token = getToken(authHeader)
  const userId = parseUserId(token)
  return userId
}
