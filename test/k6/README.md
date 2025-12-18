# Testes de Performance com k6

Este diretório contém um exemplo completo de teste de performance para a API pública **DummyJSON** usando k6.

## Como executar

```bash
# pré-requisitos: k6 instalado
# variáveis opcionais
#   API_BASE_URL (default: https://dummyjson.com)
#   API_USER (default: emilys)
#   API_PASS (default: emilyspass)
#   API_TOKEN (opcional: se quiser forçar um token diferente do obtido no login)

k6 run test/k6/performance.test.js \
  -e API_BASE_URL=https://dummyjson.com \
  -e API_USER=emilys \
  -e API_PASS=emilyspass
```

Ao final, o relatório HTML será gravado em `cypress/reports/k6-summary.html`.

## Onde cada conceito foi aplicado (trecho + explicação)

- **Thresholds** (`performance.test.js`): garante SLA de latência e de sucesso de checks.
  ```js
  export const options = {
    stages: [...],
    thresholds: {
      http_req_duration: ['p(95)<800'],
      checks: ['rate>0.95'],
      user_create_duration_ms: ['p(95)<500'],
      user_flow_duration_ms: ['p(95)<900'],
    },
  }
  ```

- **Stages** (`performance.test.js`): define ramp-up, steady e ramp-down de VUs.
  ```js
  stages: [
    { duration: '20s', target: 3 },
    { duration: '40s', target: 8 },
    { duration: '20s', target: 0 },
  ]
  ```

- **Helpers** + **Uso de Token** + **Reaproveitamento de Resposta** (`helpers/auth.js`, `setup` e PATCH): login isolado, token reutilizado no cenário e no PATCH (ID estável 1 para evitar falhas HTTP ao consultar/criar).
  ```js
  // helpers/auth.js
  export function login(baseUrl, credentials) {
    const res = http.post(`${baseUrl}/auth/login`, JSON.stringify(credentials), {...})
    const tokenValue = res.json('token') || res.json('accessToken')
    return { token: tokenValue, response: res }
  }

  // performance.test.js
  export function setup() {
    const { token } = login(BASE_URL, { username: AUTH_USER, password: AUTH_PASS })
    return { token }
  }

  // Update usando token e reaproveitando o id criado (com fallback)
  const updRes = http.patch(`${BASE_URL}/users/${targetId}`, JSON.stringify(partial), { headers })
  ```

- **Checks** (`performance.test.js`): valida status e campos antes de seguir o fluxo.
  ```js
  check(res, {
    'create status 200/201': (r) => r.status === 200 || r.status === 201,
    'id retornado': (r) => !!r.json('id'),
  })
  ```

- **Trends** (`performance.test.js`): mede tempo de criação e atualização para análises customizadas.
  ```js
  const userCreateTrend = new Trend('user_create_duration_ms')
  const userFlowTrend = new Trend('user_flow_duration_ms')
  userCreateTrend.add(res.timings.duration)
  ```

- **Faker** (`performance.test.js`): gera dados únicos para cada iteração, evitando cache.
  ```js
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()
  const payload = { ...template, firstName, lastName, username: faker.internet.userName(firstName, lastName) }
  ```

- **Variáveis de Ambiente** (`performance.test.js`): permitem trocar URL/credenciais sem alterar código.
  ```js
  const BASE_URL = __ENV.API_BASE_URL || 'https://dummyjson.com'
  const AUTH_USER = __ENV.API_USER || 'emilys'
  const AUTH_PASS = __ENV.API_PASS || 'emilyspass'
  const token = __ENV.API_TOKEN
  ```

- **Data-Driven Testing** (`performance.test.js` + `data/users.json`): escolhe massa aleatória para diversificar cargas.
  ```js
  import users from './data/users.json'
  const template = randomItem(users)
  ```

- **Groups** (`performance.test.js`): organiza o fluxo em blocos lógicos para leitura e métricas (GET/PATCH usam ID estável 1 para manter o run verde).
  ```js
  group('User Lifecycle', () => {
    group('Create user (data-driven)', () => { ... })
    group('Get user (reaproveita ID)', () => { ... })
    group('Update user (usa token se existir)', () => { ... })
  })
  ```

- **Relatório HTML** (`performance.test.js`): grava o sumário em HTML para evidência.
  ```js
  export function handleSummary(data) {
    return {
      stdout: textSummary(data, { ... }),
      'cypress/reports/k6-summary.html': htmlReport(data),
    }
  }
  ```

## Arquitetura

```
test/k6/
  performance.test.js   # cenário principal com stages, thresholds, groups e métricas
  data/users.json       # massa de dados para o teste (data-driven)
  helpers/auth.js       # helper de login/autenticação
  README.md             # este guia
```
