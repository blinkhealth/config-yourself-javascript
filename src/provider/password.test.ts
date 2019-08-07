import Password from './password'

describe('Password provider', (): void => {
  it('decrypts correctly', async (): Promise<void> => {
    const { crypto, secrets, ciphertext } = (global as any).fixtures.password

    const result = await new Password(crypto, secrets).decrypt(ciphertext)

    expect(result).toEqual('secret')
  })

  it('explodes with bad keys', async (): Promise<void> => {
    const { ciphertext, secrets } = (global as any).fixtures.password

    try {
      await new Password({ key: '' }, secrets).decrypt(ciphertext)
    } catch (err) {
      expect(err.message).toBe('Invalid configuration, missing "crypto.key"')
      try {
        await new Password({ key: 'not a key' }, { password: '' }).decrypt(ciphertext)
      } catch (err) {
        expect(err.message).toBe(
          'No password provided for decryption, remove the crypto property if no encryption is needed',
        )
        return
      }
    }

    expect(true).toBe('Bad key did not explode')
  })
})
