export const cryptoHash = async (data: string): Promise<string> => {
  const hasher = new Bun.CryptoHasher('sha256')
  hasher.update(data)
  return hasher.digest('hex')
}
