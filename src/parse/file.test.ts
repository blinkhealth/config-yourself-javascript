import { file as loadFile } from './file'
import mockFile from 'mock-fs'

const jsonData = {
  crypto: {
    key: 'alias/my-test-key',
    region: 'us-east-1',
  },
  secret: {
    encrypted: true,
    ciphertext: 'InNlY3JldCI=',
  },
}

const yamlData = `
crypto:
  key: alias/my-test-key
  region: us-east-1
secret:
  encrypted: true
  ciphertext: InNlY3JldCI=
`

afterEach((): void => {
  mockFile.restore()
})

describe('File parser', (): void => {
  it('should load json files', (): void => {
    mockFile({ 'config.json': JSON.stringify(jsonData) })
    expect(loadFile('config.json')).toEqual(jsonData)
  })

  it('should load yaml files', (): void => {
    mockFile({ 'config.yaml': yamlData })
    expect(loadFile('config.yaml')).toEqual(jsonData)
  })

  it('should load yml files', (): void => {
    mockFile({ 'config.yml': yamlData })
    expect(loadFile('config.yml')).toEqual(jsonData)
  })

  it('should allow overriding of format', (): void => {
    mockFile({ noExtension: yamlData })
    expect(loadFile('noExtension', 'yaml')).toEqual(jsonData)
  })

  it('should figure out the extension from the file', (): void => {
    mockFile({ 'config.yml': yamlData })
    expect(loadFile('config.yml', '')).toEqual(jsonData)
  })

  it('should default to parsing extensionless files as yaml', (): void => {
    const spy = jest.spyOn(console, 'warn').mockImplementation()
    mockFile({ 'something-else': yamlData })
    expect(loadFile('something-else', '')).toEqual(jsonData)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('Unknown extension, parsing config file something-else as YAML')
  })

  it('should explode with missing files', (): void => {
    expect((): any => loadFile('missing.yaml')).toThrowError('Could not read configuration file at path: missing.yaml')
  })

  it('should explode with bad formats', (): void => {
    mockFile({ 'config.yaml': yamlData })
    expect((): any => loadFile('config.yaml', 'whatever')).toThrowError('Unknown format: <whatever>')
  })
})
