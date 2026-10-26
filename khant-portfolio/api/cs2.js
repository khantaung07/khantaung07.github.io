import { handleCs2Request } from '../server/leetify.mjs'

export default async function handler(req, res) {
  await handleCs2Request(req, res)
}