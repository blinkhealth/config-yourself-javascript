import { env as loadEnv } from './env'

const data = {
  api: {
    endpoint: 'http://some-api.example.com',
    timeout: 42,
  },
  sentry: {
    enabled: true,
  },
}

describe('Env parser', (): void => {
  // Don't print warnings to test stdout
  jest.spyOn(console, 'warn').mockImplementation()

  afterEach((): void => {
    Object.keys(process.env)
      .filter((k): boolean => k.startsWith('CONFIG'))
      .forEach((k): void => {
        delete process.env[k]
      })
  })

  it('should load env variables', (): void => {
    process.env['CONFIG.api.endpoint'] = 'http://some-api.example.com'
    process.env['CONFIG.api.timeout'] = '42'
    process.env['CONFIG.sentry.enabled'] = 'true'

    expect(loadEnv('CONFIG')).toEqual(data)
  })

  it('should provide sane defaults', (): void => {
    expect(loadEnv('EMPTY_OBJECT')).toEqual({})
  })
})
