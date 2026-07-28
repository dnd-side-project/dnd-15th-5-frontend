const config = {
  parserPreset: {
    parserOpts: {
      headerPattern: '^(?<type>.+):\\s(?<subject>.+)$',
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'type-case': [0],
    'subject-case': [0],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        '✨ Feat',
        '🐛 Fix',
        '♻️ Refactor',
        '🔧 Chore',
        '🎨 Style',
        '📝 Docs',
        '✅ Test',
        '🚚 Rename',
        '🔥 Remove',
      ],
    ],
  },
};

module.exports = config;
