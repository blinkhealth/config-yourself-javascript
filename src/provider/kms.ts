import { CryptoProvider } from './index'
import { KMS as kmsService } from '@aws-sdk/client-kms-node'

/**
 * KMSCrypto contains a KMS `crypto.key` ARN
 */
export interface KMSCrypto {
  key: string
}

export default class KMS implements CryptoProvider {
  /**
   * The KMS region to operate in
   */
  private region: string
  /**
   * An AWS KMS client
   */
  private service: kmsService

  public constructor(crypto: KMSCrypto) {
    if (!crypto.key) {
      throw new Error('Invalid configuration, missing "crypto.key"')
    }

    if (crypto.key.startsWith('arn:aws:kms:')) {
      this.region = crypto.key.split(':')[3]
    } else {
      // eslint-disable-next-line
      throw new Error(
        `Could not parse region name from "crypto.key". Please ensure you have specified a fully-qualifed KMS key ARN to replace "${crypto.key}" before continuing`,
      )
    }

    this.service = new kmsService({ region: this.region })
  }

  public async decrypt(CiphertextBlob: Buffer): Promise<string> {
    const data = await this.service.decrypt({ CiphertextBlob })

    if (data.Plaintext) {
      return data.Plaintext.toString()
    } else {
      return ''
    }
  }
}
