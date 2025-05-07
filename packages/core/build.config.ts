import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig( [
	{
		entries     : [ './src/main', './src/cli' ],
		sourcemap   : false,
		declaration : true,
		failOnWarn  : true,
		rollup      : { esbuild : {
			minify : true,
			target : 'node20',
		} },
	},
] )
