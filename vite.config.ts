import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'

// Simula la función serverless api/login.ts solo en modo desarrollo,
// para que "npm run dev" permita acceder con la contraseña del .env
const loginDevPlugin = (): Plugin => ({
  name: 'login-dev-api',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(server.config.mode, server.config.envDir, '')
    const appPassword = env.APP_PASSWORD

    if (!appPassword) {
      server.config.logger.warn('[login-dev] APP_PASSWORD no está definida en el .env')
    }

    server.middlewares.use('/api/login', (req, res) => {
      const send = (status: number, payload: object) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(payload))
      }

      if (req.method !== 'POST') return send(405, { error: 'Método no permitido' })
      if (!appPassword) return send(500, { error: 'Configuración del servidor incompleta' })

      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        let password: string | undefined
        try {
          password = JSON.parse(body || '{}').password
        } catch {
          return send(400, { error: 'Cuerpo JSON inválido' })
        }

        if (!password) return send(400, { error: 'Contraseña requerida' })

        const inputBuffer = Buffer.from(password)
        const expectedBuffer = Buffer.from(appPassword)
        const match =
          inputBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(inputBuffer, expectedBuffer)

        if (!match) return send(401, { error: 'Contraseña incorrecta' })

        const token = crypto
          .createHmac('sha256', appPassword)
          .update(Date.now().toString())
          .digest('hex')

        return send(200, { token })
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), loginDevPlugin()],
})
