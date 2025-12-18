import http from 'k6/http'
import { check, fail } from 'k6'

/**
 * Helper para autenticação via API (reaproveita a resposta para obter o token).
 * Para o DummyJSON usamos /auth/login com username/password.
 * @param {string} baseUrl - URL base da API
 * @param {{username: string, password: string}} credentials
 * @returns {{ token: string, response: import('k6/http').Response }}
 */
export function login(baseUrl, credentials) {
  const res = http.post(`${baseUrl}/auth/login`, JSON.stringify(credentials), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 k6-loadtest',
      Connection: 'close',
    },
  })

  const tokenValue = res.json('token') || res.json('accessToken')

  const ok = check(res, {
    'auth status is 200': (r) => r.status === 200,
    'token presente': () => !!tokenValue,
  })

  if (!ok) {
    fail(`Falha ao autenticar: status=${res.status} body=${res.body}`)
  }

  return { token: tokenValue, response: res }
}
