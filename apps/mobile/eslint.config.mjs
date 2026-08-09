import { baseConfig } from '@chapchap/eslint-config/base';
import expoConfig from 'eslint-config-expo/flat.js';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([...expoConfig, ...baseConfig, globalIgnores(['dist/**'])]);
