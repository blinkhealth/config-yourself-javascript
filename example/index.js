const { Config, parse } = require('../dist/index')

process.env['CONFIG.overrideThisValue'] = 'overriden'
process.env['NODE_ENV'] = process.env['NODE_ENV'] || 'development'

var password = process.env['NODE_ENV'].slice(0, 4).replace(/e$/, '') + '-password'

new Config(
    parse.file('./config/defaults.yaml'),
    parse.file(`./config/${process.env['NODE_ENV']}.yaml`),
  parse.env('CONFIG')
).decrypt({ password })
  .then(cfg => {
    console.log(`secret: ${cfg.secret}`)
    if (cfg.enableSecretFeature) {
      console.warn('Secret feature enabled!')
    }
    console.log(`The default value was ${cfg.overrideThisValue}`)
  }).catch(err => {
    console.error(err)
    process.exit(2)
  })

