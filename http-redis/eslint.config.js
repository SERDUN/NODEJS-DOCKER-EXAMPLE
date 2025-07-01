import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},
];