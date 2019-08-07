import KMS, { KMSCrypto } from './kms'
import Password, { PasswordCrypto, PasswordSecrets } from './password'
import GPG, { GPGSecrets } from './gpg'

/**
 * A CryptoProvider asyncronously decrypts byte arrays using underlying services
 */
export interface CryptoProvider {
  /**
   *
   * @param data A `Buffer`, usually the result of base64 decoding the `.ciphertext` property of an encrypted value
   *
   * @returns A `Promise` to return the decrypted value as a string
   */
  decrypt(data: Buffer): Promise<string>
}

interface CryptoProperty {
  provider?: 'gpg' | 'kms' | 'password' | undefined
}

export type Secrets = PasswordSecrets | GPGSecrets
/** Initialize a provider for a given config with secrets
 *
 * @param config A map of values to initialize the provider with
 * @param secrets A map of secrets to use when initializing the provider
 *
 * @returns An initialized [[CryptoProvider]]
 */
export default function Load(config: CryptoProperty, secrets?: Secrets): CryptoProvider {
  if (!config.provider) {
    config.provider = 'kms'
    console.warn('crypto.provider undefined in config file, defaulting to `kms`')
  }

  switch (config.provider) {
    case 'kms':
      return new KMS(config as KMSCrypto)
    case 'password':
      return new Password(config as PasswordCrypto, secrets as PasswordSecrets)
    case 'gpg':
      return new GPG(config as PasswordCrypto, secrets as GPGSecrets)
    default:
      throw new Error(`Unknown \`crypto.provider\` ${config.provider}`)
  }
}
