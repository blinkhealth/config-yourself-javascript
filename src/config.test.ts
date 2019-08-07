import { Config } from './config'
const fixtures = (global as any).fixtures

describe('Config', (): void => {
  it('Should deep merge objects', async (): Promise<void> => {
    const base = {
      key: 'value',
      object: {
        key: 'value',
        otherKey: 'otherValue',
        newKey: '',
      },
    }

    const override = {
      object: {
        otherKey: 'overriden',
        newKey: 'newValue',
      },
    }

    const expected = Object.assign({}, base)
    base.object.otherKey = 'overriden'
    base.object.newKey = 'newValue'

    expect(await new Config(base, override).decrypt()).toEqual(expected)
  })

  it('Defaults to kms as a provider', async (): Promise<void> => {
    const key = 'arn:aws:kms:us-east-1:000000000000:key/00000000-0000-0000-0000-000000000000'
    const spy = jest.spyOn(console, 'warn').mockImplementation()
    const result = await new Config({ crypto: { key } }).decrypt()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('crypto.provider undefined in config file, defaulting to `kms`')
    expect(result.crypto.provider).toEqual('kms')
  })

  it('Explodes with unknown providers', async (): Promise<void> => {
    const cfg = new Config({ crypto: { provider: 'fake' } })
    try {
      await cfg.decrypt()
    } catch (err) {
      expect(err.message).toBe('Unknown `crypto.provider` fake')
      return
    }

    expect(true).toBe('Fake provider did not explode')
  })

  for (let provider in fixtures) {
    const config = {
      crypto: fixtures[provider].crypto,
      secret: {
        encrypted: true,
        ciphertext: fixtures[provider].ciphertext.toString('base64'),
      },
      listSecret: [
        {
          encrypted: true,
          ciphertext: fixtures[provider].ciphertext.toString('base64'),
        },
      ],
    }
    it(`loads provider ${provider}`, async (): Promise<void> => {
      const result = await new Config(config).decrypt(fixtures[provider].secrets)
      const expected = { ...config, secret: 'secret', listSecret: ['secret'] }
      expect(result).toEqual(expected)
    })
  }
})
