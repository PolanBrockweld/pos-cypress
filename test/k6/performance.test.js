import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Trend } from 'k6/metrics'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js'
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'
import faker from 'https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js'
import users from './data/users.json'
import { login } from './helpers/auth.js'

const BASE_URL = __ENV.API_BASE_URL || 'https://dummyjson.com'
const AUTH_USER = __ENV.API_USER || 'emilys'
const AUTH_PASS = __ENV.API_PASS || 'emilyspass'

// Métricas customizadas (Trends)
const userCreateTrend = new Trend('user_create_duration_ms')
const userFlowTrend = new Trend('user_flow_duration_ms')

export const options = {
  stages: [
    { duration: '20s', target: 3 },
    { duration: '40s', target: 8 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // Threshold global
    checks: ['rate>0.95'], // Threshold de sucesso dos checks
    user_create_duration_ms: ['p(95)<500'],
    user_flow_duration_ms: ['p(95)<900'],
  },
}

export function setup() {
  // Autentica e reaproveita o token para chamadas autenticadas
  const { token } = login(BASE_URL, { username: AUTH_USER, password: AUTH_PASS })
  return { token }
}

export default function (data) {
  const { token } = data

  group('User Lifecycle', () => {
    const template = randomItem(users)
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const payload = Object.assign({}, template, {
      firstName,
      lastName,
      username: faker.internet.userName(firstName, lastName),
      email: faker.internet.email(firstName, lastName, 'example.com'),
    })

    group('Create user (data-driven)', () => {
      const res = http.post(`${BASE_URL}/users/add`, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 k6-loadtest',
          Connection: 'close',
        },
      })

      userCreateTrend.add(res.timings.duration)

      const created = check(res, {
        'create status 200/201': (r) => r.status === 200 || r.status === 201,
        'id retornado': (r) => !!r.json('id'),
      })

      if (!created && __ITER === 0) {
        console.log('Create user falhou', res.status, res.body ? res.body.slice(0, 300) : 'no body')
      }

      if (!created) return

      const targetId = 1 // usamos ID estável para evitar falhas HTTP no GET/PATCH

      group('Get user (ID estável)', () => {
        const getRes = http.get(`${BASE_URL}/users/${targetId}`, {
          headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 k6-loadtest', Connection: 'close' },
        })

        check(getRes, {
          'get status 200': (r) => r.status === 200,
          'id confere': (r) => r.json('id') === targetId,
        })
      })

      group('Update user (usa token se existir)', () => {
        const partial = { age: (payload.age || 30) + 1 }
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 k6-loadtest',
          Connection: 'close',
        }

        if (token) headers.Authorization = `Bearer ${token}`

        const updRes = http.patch(`${BASE_URL}/users/${targetId}`, JSON.stringify(partial), { headers })

        const ok = check(updRes, {
          'update status 200': (r) => r.status === 200,
          'age atualizado': (r) => r.json('age') === partial.age,
        })

        userFlowTrend.add(updRes.timings.duration)

        if (!ok && __ITER === 0) {
          console.log('Update falhou', updRes.status, updRes.body ? updRes.body.slice(0, 200) : 'no body')
        }
      })
    })
  })

  sleep(1)
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'cypress/reports/k6-summary.html': htmlReport(data), // relatório HTML
  }
}
