module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		"prefer-const": "off",

		// empty interfaces could be used as markers for easier code transformation
		"@typescript-eslint/no-empty-interface": "off",

		// namespaces have their own uses, no need to disallow them completely
		"@typescript-eslint/no-namespace": "off",
	}
};