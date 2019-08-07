interface MapOfBlob {
  [key: string]: Buffer
}

export type DecryptOutput = Promise<MapOfBlob>

export class KMS {
  public region: string
  public constructor({ region }: { region: string }) {
    this.region = region
  }

  public decrypt = jest.fn(
    ({ CiphertextBlob }: MapOfBlob): DecryptOutput => Promise.resolve({ Plaintext: CiphertextBlob }),
  )
}
