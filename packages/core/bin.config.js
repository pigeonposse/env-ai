import { defineConfig } from 'binarium'

export default defineConfig( {
	input       : 'dist/cli.cjs',
	name        : 'env-ai',
	nodeOptions : { esbuild : {
		noDefaultPlugins : true,
		treeShaking      : false,
	} },
} )
