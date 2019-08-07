import deepmerge from 'deepmerge'
import provider, { CryptoProvider, Secrets } from './provider'

/**
 * A MapOfValues has string keys and values of any kind.
 */
export interface MapOfValues {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recurse(value: any, provider: CryptoProvider): Promise<any> {
  switch (value.constructor.name) {
    case 'Array':
      const decryptedArray = []
      for (let key in value) {
        decryptedArray.push(await recurse(value[key], provider))
      }
      return decryptedArray
    case 'Object':
      if (value.hasOwnProperty('encrypted') && value.encrypted == true) {
        const cipherText = Buffer.from(value.ciphertext, 'base64')
        return await provider.decrypt(cipherText)
      }

      const decryptedMap: MapOfValues = {}
      for (let key in value) {
        decryptedMap[key] = await recurse(value[key], provider)
      }
      return decryptedMap
    default:
      return value
  }
}

/**
 * Config operates on a sequence of maps, merging them in order and decrypting them
 */
export class Config {
  private data: MapOfValues

  /**
   *
   * @param baseConfig A map of configuration values
   * @param overrides If supplied, this array of maps will be reduced over `baseConfig`
   */
  public constructor(baseConfig: MapOfValues, ...overrides: MapOfValues[]) {
    this.data = deepmerge.all<MapOfValues>([baseConfig, ...overrides.filter((o): MapOfValues => o)])
  }

  /**
   * Decrypt will recursively search for encrypted values on the merged config, and decrypt them.
   *
   * `secret`s can be provided for the `password` and `gpg` `crypto.provider`, as these require you to initialize them
   * with secret values:
   *
   * - `password`: see [[PasswordSecrets]]
   * - `gpg`: see [[GPGSecrets]]
   * - `kms` does not consume `secret`s, as it follows the default [AWS credential chain](https://docs.aws.amazon.com/amazonswf/latest/awsrbflowguide/set-up-creds.html)
   *
   * @param secrets A map of secrets required by certain `crypto.provider`s, such as `password` and `gpg`
   *
   * @returns A frozen map of decrypted values
   */
  public async decrypt(secrets?: Secrets): Promise<MapOfValues> {
    let data = this.data
    if (data.crypto) {
      data = await recurse(data, provider(data.crypto, secrets))
    }
    return Object.freeze(data)
  }
}
