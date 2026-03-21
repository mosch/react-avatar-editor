import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.cjs', '**/*.mjs'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
)
