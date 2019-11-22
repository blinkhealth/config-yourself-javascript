import { CryptoProvider } from './index'
import { scryptSync } from 'crypto'
import DataKey from './datakey'

const SALT_SIZE = 12
const SCRYPT_OPTIONS = {
  N: 32 * 1024,
  r: 8,
  p: 1,
  maxmem: 33 * 1024 * 1024,
}

/**
 * PasswordCrypto contains an AES `crypto.key`
 */
export interface PasswordCrypto {
  key: string
}

/**
 * Provide PasswordSecrets when using the `password` provider
 */
export interface PasswordSecrets {
  /**
   * The password to decrypt this file with
   */
  password: string
}

/**
 * Password implements decryption for `password` config-yourself files
 */
export default class Password implements CryptoProvider {
  /**
   * The salt used to when deriving the key to unlock this file's key
   */
  private salt: Buffer
  /**
   * This file's `crypto.key`
   */
  private key: Buffer
  /**
   * The user-supplied password
   */
  private password: string
  /**
   * A [[DataKey]] service for this file's secrets
   */
  private service?: DataKey

  public constructor(crypto: PasswordCrypto, secrets: PasswordSecrets) {
    if (!crypto.key) {
      throw new Error('Invalid configuration, missing "crypto.key"')
    }

    if (!secrets.password || secrets.password == '') {
      throw new Error('No password provided for decryption, remove the crypto property if no encryption is needed')
    }

    const keyBytes = Buffer.from(crypto.key, 'base64')
    this.password = secrets.password
    this.salt = keyBytes.slice(0, SALT_SIZE)
    this.key = keyBytes.slice(SALT_SIZE)
  }

  public async decrypt(ciphertext: Buffer): Promise<string> {
    if (!this.service) {
      this.service = await this.decryptKey()
    }

    return await this.service.decrypt(ciphertext).toString('utf-8')
  }

  private async decryptKey(): Promise<DataKey> {
    const derivedKey = scryptSync(this.password, this.salt, 32, SCRYPT_OPTIONS)

    let fileKey: Buffer
    try {
      fileKey = await new DataKey(derivedKey).decrypt(this.key)
    } catch (err) {
      throw new Error(`Unable to decrypt: incorrect password: ${err}`)
    }

    return new DataKey(fileKey)
  }
}
