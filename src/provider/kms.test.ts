import KMS from './kms'

describe('KMS provider', (): void => {
  it('decrypts correctly', async (): Promise<void> => {
    const { crypto, ciphertext } = (global as any).fixtures.kms

    const result = await new KMS(crypto).decrypt(ciphertext)

    expect(result).toEqual('secret')
  })

  it('explodes with bad keys', async (): Promise<void> => {
    const { ciphertext } = (global as any).fixtures.kms

    try {
      await new KMS({ key: '' }).decrypt(ciphertext)
    } catch (err) {
      expect(err.message).toBe('Invalid configuration, missing "crypto.key"')
      try {
        await new KMS({ key: 'not-a-kms-arn' }).decrypt(ciphertext)
      } catch (err) {
        expect(err.message).toBe(
          'Could not parse region name from "crypto.key". Please ensure you have specified a fully-qualifed KMS key ARN to replace "not-a-kms-arn" before continuing',
        )
        return
      }
    }

    expect(true).toBe('Bad key did not explode')
  })
})
