const { Nuxt, Builder } = require('nuxt')
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('fastify-helmet'));
fastify.register(require('fastify-cors'));
fastify.register(require('fastify-rate-limit'), {
  max: 500,
  timeWindow: '1 minute'
});

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // fastify.use(nuxt.render)
  // configuration to split routing of API and non-API routes using fastify 
  fastify.register(require('./routes'), {prefix: '/api'})
  fastify.get('*', (req, res)=>{
    nuxt.render(req.req, res.res)
  })

  fastify.listen(port, host, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}

start()
