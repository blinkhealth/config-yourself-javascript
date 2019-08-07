import GPG from './gpg'
// import { cryptoNodes: { gpg as gpgCrypto }, secrets: { gpg as gpgSecrets } } from 'config-fixtures'

describe('GPG provider', (): void => {
  it('decrypts correctly', async (): Promise<void> => {
    const { crypto, secrets, ciphertext } = (global as any).fixtures.gpg

    const result = await new GPG(crypto, secrets).decrypt(ciphertext)

    expect(result).toEqual('secret')
  })

  it('explodes with bad keys', async (): Promise<void> => {
    const { ciphertext, secrets } = (global as any).fixtures.gpg

    try {
      await new GPG({ key: '' }, secrets).decrypt(ciphertext)
    } catch (err) {
      expect(err.message).toBe('Invalid configuration, missing "crypto.key"')
      try {
        await new GPG({ key: 'not-an armored key' }, { privateKey: '' }).decrypt(ciphertext)
      } catch (err) {
        expect(err.message).toBe(
          'No privateKey provided for decryption, remove the crypto property if no encryption is needed',
        )
        return
      }
    }

    expect(true).toBe('Bad key did not explode')
  })
})
