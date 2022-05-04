import { createServer, type ViteDevServer } from 'vite'

let server: ViteDevServer | undefined

export const start = async () => {
  server = await createServer({
    logLevel: 'error',
    root: __dirname,
  })
  await server.listen()

  return server.config.server.port
}

export const stop = () => server?.close()
