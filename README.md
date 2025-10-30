# pos-cypress

Suite de testes automatizados em Cypress para o site https://automationexercise.com/

Conteúdo
- `cypress/` - specs, fixtures, support e módulos organizados por funcionalidade
- `cypress.config.js` - configuração do Cypress (baseUrl, reporter)

Pré-requisitos
- Node.js (recomendo 18+)
- npm

Instalação (Windows PowerShell)

```powershell
# clonar repositório
git clone https://github.com/PolanBrockweld/pos-cypress.git
cd pos-cypress

# instalar dependências
npm install

# abrir runner interativo
npm run cy:open

# rodar em modo headless (gera relatório mochawesome em cypress/reports)
npm run cy:run
```

Notas
- Os testes usam `@faker-js/faker` para gerar dados dinâmicos.
- O upload de arquivos usa `cypress-file-upload` e há um arquivo de exemplo em `cypress/fixtures/sample.txt`.
- Os relatórios mochawesome serão gerados em `cypress/reports`.
- Se você tiver problemas com permissões ou binários do Cypress, rode `npx cypress verify`.

CI (GitHub Actions)
- Há um workflow em `.github/workflows/ci.yml` que roda os testes em pushes/PRs para a branch `main`.
- O workflow instala dependências, executa os testes e publica artefatos (relatórios, screenshots).

Próximos passos sugeridos
- Atualizar `cypress/fixtures/users.json` com uma conta de teste real ou alterar os testes para sempre criar usuários no `before`.
- Adicionar GitHub Secrets se for necessário (por exemplo credenciais de terceiros).
