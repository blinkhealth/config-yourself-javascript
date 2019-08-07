import { CryptoProvider } from './index'
import gpg, { key as gpgKey, message as gpgMessage } from 'openpgp'
import DataKey from './datakey'

/**
 * GPGCrypto contains a gpg-encrypted `crypto.key`
 */
export interface GPGCrypto {
  key: string
}

/**
 * Provide GPGSecrets when using the `gpg` provider
 */
export interface GPGSecrets {
  /**
   * The armored private key
   */
  privateKey: string
  /**
   * (optional) The password to decrypt this private key with
   */
  password?: string
}

/**
 * GPG implements decryption for `gpg` config-yourself files
 */
export default class GPG implements CryptoProvider {
  /**
   * This file's `crypto.key`
   */
  private key: string
  /**
   * The user-supplied privateKey
   */
  private privateKey: string
  /**
   * The user-supplied password
   */
  private password?: string
  /**
   * A [DataKey] service for this file's secrets
   */
  private service?: DataKey

  public constructor({ key }: GPGCrypto, secrets: GPGSecrets) {
    if (!key) {
      throw new Error('Invalid configuration, missing "crypto.key"')
    }

    if (!secrets.privateKey || secrets.privateKey == '') {
      throw new Error('No privateKey provided for decryption, remove the crypto property if no encryption is needed')
    }

    this.key = key
    this.privateKey = secrets.privateKey
    this.password = secrets.password
  }

  public async decrypt(ciphertext: Buffer): Promise<string> {
    if (!this.service) {
      this.service = await this.decryptKey()
    }

    return await this.service.decrypt(ciphertext).toString('utf-8')
  }

  private async decryptKey(): Promise<DataKey> {
    const pKey = (await gpgKey.readArmored(this.privateKey)).keys[0]
    if (this.password) {
      await pKey.decrypt(this.password)
    }

    let format: 'binary' | 'utf8' | undefined
    format = 'binary'
    const options = {
      message: await gpgMessage.readArmored(this.key),
      privateKeys: [pKey],
      format: format,
    }

    const { data: fileKey } = await gpg.decrypt(options)
    return new DataKey(fileKey as Buffer)
  }
}
