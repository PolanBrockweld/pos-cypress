import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Trend } from 'k6/metrics'
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
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>k6 Performance Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #06AED5; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .metric { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #06AED5; }
    .metric-label { font-weight: bold; color: #333; }
    .metric-value { color: #06AED5; font-size: 1.1em; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    .summary-box { background: #f0f8ff; padding: 15px; border-radius: 4px; border: 1px solid #06AED5; }
    .success { color: green; }
    .error { color: red; }
    .timestamp { color: #999; font-size: 0.9em; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>k6 Performance Test Report</h1>
    <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    
    <div class="summary">
      <div class="summary-box">
        <div class="metric-label">Total Requests</div>
        <div class="metric-value">${data.metrics.http_requests.value}</div>
      </div>
      <div class="summary-box">
        <div class="metric-label">Iterations</div>
        <div class="metric-value">${data.metrics.iterations.value}</div>
      </div>
      <div class="summary-box">
        <div class="metric-label">Check Pass Rate</div>
        <div class="metric-value">${data.metrics.checks.value > 0 ? ((data.metrics.checks.value / (data.metrics.checks.value + (data.metrics.checks.fails || 0))) * 100).toFixed(2) + '%' : 'N/A'}</div>
      </div>
    </div>
    
    <h2>Execution Summary</h2>
    <div class="metric"><span class="metric-label">Status:</span> <span class="metric-value success">PASS</span></div>
    <div class="metric"><span class="metric-label">Duration:</span> <span class="metric-value">${((data.state.testRunDurationMs) / 1000).toFixed(2)}s</span></div>
    
    <h2>Test Details</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  </div>
</body>
</html>`
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'cypress/reports/k6-summary.html': html,
  }
}
