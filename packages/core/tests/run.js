import { run } from '../dist/index.js'

run( {
	input : [ './src/**', './package.json' ],
	theme : 'docs',
	debug : true,
} )
