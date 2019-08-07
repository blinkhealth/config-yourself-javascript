import { createDecipheriv } from 'crypto'

const NONCE_BYTE_SIZE = 32

export default class DataKey {
  private key: Buffer
  public constructor(key: Buffer) {
    this.key = key
  }

  public decrypt(payload: Buffer): Buffer {
    const pl = payload.length
    const nonce = payload.slice(0, NONCE_BYTE_SIZE)
    const ciphertext = payload.slice(NONCE_BYTE_SIZE, pl - 16)
    const tag = payload.slice(pl - 16)
    const cipher = createDecipheriv('aes-256-gcm', this.key, nonce)
      .setAutoPadding(false)
      .setAuthTag(tag)

    const plainBytes = cipher.update(ciphertext)
    return Buffer.concat([plainBytes, cipher.final()])
  }
}
