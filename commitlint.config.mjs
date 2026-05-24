/**
 * Conventional Commits — ARCHITECTURE.md > AGENT-SECTION: conventions
 *
 * Format: <type>(<scope>): <subject>  [<body>]  [<footer>]
 *
 * Scopes válidos:
 *   auth | earnings | expenses | fuel | maintenance | dashboard
 *   billing | infra | docs | ui | db | shared
 *
 * Exemplo: feat(fuel): cálculo de km/L com window function (T-045)
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci', 'revert']
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'earnings',
        'expenses',
        'fuel',
        'maintenance',
        'dashboard',
        'billing',
        'infra',
        'docs',
        'ui',
        'db',
        'shared',
        'qa',
        'release'
      ]
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-max-length': [2, 'always', 100]
  }
};
