module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Reglas del proyecto: tipos permitidos y longitud.
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'header-max-length': [2, 'always', 72],
    // Sugerir scopes típicos del proyecto
    'scope-enum': [1, 'always', ['routes', 'models', 'middleware', 'db', 'auth', 'tests', 'ci', 'release']],
  },
}
