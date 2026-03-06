module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'auth', 'account', 'transaction', 'notification',
      'frontend', 'kong', 'k8s', 'helm', 'ci', 'infra', 'shared', 'docs'
    ]],
  },
};
