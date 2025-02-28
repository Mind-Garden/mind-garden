import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals', // Next.js recommended rules
    'next/typescript', // TypeScript support
    'eslint:recommended', // General recommended rules
    'plugin:prettier/recommended', // Prettier integration
  ),
  {
    plugins: ['prettier'],
    rules: {
      // Prettier Rules
      'prettier/prettier': [
        'error',
        {
          semi: false, // No semicolons
          singleQuote: true, // Single quotes for strings
          trailingComma: 'es5',
          printWidth: 80,
          tabWidth: 2,
        },
      ],

      // Custom ESLint Rules
      semi: ['error', 'never'], // Disallow semicolons
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          fixToUnknown: false, // Avoid suggesting `unknown`
          ignoreRestArgs: false, // Disallow in rest arguments
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description', // Allow `@ts-ignore` only with description
        },
      ],
    },
  },
];

export default eslintConfig;
