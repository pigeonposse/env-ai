import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

import { includeIgnoreFile } from "@eslint/compat"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )
const gitignorePath = path.resolve( __dirname, ".gitignore" )

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	{
		plugins : { '@stylistic': stylistic },
		rules   : {
			"@typescript-eslint/consistent-type-definitions" : [ "error", "type" ],
			'camelcase'                                      : 'warn',
			'vars-on-top'                                    : 'warn',
			'default-case-last'                              : 'error',
			'default-case'                                   : 'error',
			'no-prototype-builtins'                          : 'off',
			'no-inline-comments'                             : 'off',
			'no-unused-vars'                                 : [
				'error',
				{
					args                      : 'all',
					argsIgnorePattern         : '^_',
					caughtErrorsIgnorePattern : '^_',
					ignoreRestSiblings        : true,
				},
			],
			'one-var' : [
				'error',
				{
					var   : 'always',
					let   : 'always',
					const : 'never',
				},
			],
			'prefer-const' : [
				'error',
				{
					destructuring          : 'any',
					ignoreReadBeforeAssign : false,
				},
			],
			'func-style' : [
				'error',
				'declaration',
				{ allowArrowFunctions: true },
			],
			'prefer-arrow-callback'     : 'error',
			'no-async-promise-executor' : 'off',
			// CODING STYLES
			// '@stylistic/max-len' : [
			// 	'error',
			// 	{
			// 		code                   : 100,
			// 		ignoreTrailingComments : true,
			// 		ignoreUrls             : true,
			// 		ignoreStrings          : true,
			// 		ignoreTemplateLiterals : true,
			// 	},
			// ],
			'@stylistic/key-spacing'    : [
				'error',
				{
					multiLine : {
						beforeColon : true,
						afterColon  : true,
					},
					align : {
						beforeColon : true,
						afterColon  : true,
						on          : 'colon',
					},
				},
			],
			'@stylistic/switch-colon-spacing' : [
				'error',
				{
					after  : true,
					before : true,
				},
			],
			'@stylistic/comma-dangle'            : [ 'error', 'always-multiline' ],
			'@stylistic/comma-spacing'           : [ 'error', { after: true } ],
			'@stylistic/no-multiple-empty-lines' : [
				'error',
				{
					max    : 1,
					maxEOF : 1,
					maxBOF : 1,
				},
			],
			'@stylistic/padded-blocks'   : [ 'error', 'always' ],
			'@stylistic/space-in-parens' : [ 'error', 'always' ],

			'@stylistic/object-curly-spacing'    : [ 'error', 'always' ],
			'@stylistic/object-curly-newline'    : [ 'error', { minProperties: 2 } ],
			'@stylistic/object-property-newline' : [ 'error', { allowMultiplePropertiesPerLine: false } ],
			'@stylistic/array-bracket-spacing'   : [ 'error', 'always' ],
			'@stylistic/array-bracket-newline'   : [
				'error',
				{
					multiline : true,
					minItems  : 3,
				},
			],
			'@stylistic/array-element-newline' : [
				'error',
				{
					multiline : true,
					minItems  : 3,
				},
			],
			'@stylistic/keyword-spacing'    : [ 'error', { after: true } ],
			'@stylistic/indent'             : [ 'error', 'tab' ],
			'@stylistic/indent-binary-ops'  : [ 'error', 'tab' ],
			'@stylistic/no-tabs'            : 'off',
			'@stylistic/spaced-comment'     : 'off',
			'@stylistic/linebreak-style'    : [ 'error', 'unix' ],
			'@stylistic/semi'               : [ 'error', 'never' ],
			'@stylistic/operator-linebreak' : [ 'error', 'before' ],
			'@stylistic/arrow-parens'       : [ 'error', 'as-needed' ],
			'@stylistic/eol-last'           : [ 'error', 'always' ],
			'@stylistic/space-infix-ops'    : 'error',
			'@stylistic/no-multi-spaces'    : [
				'error',
				{ exceptions : {
					ImportDeclaration    : true,
					// VariableDeclarator   : true, 
					AssignmentExpression : true,
					// ClassProperty        : true,
				} }, 
			],
			'@stylistic/type-annotation-spacing' : 'off',
		},
		ignores : [ "./dist", './build' ],
	},
	
	includeIgnoreFile( gitignorePath ),
	{ ignores: [ "./dist", './build' ] },
)
