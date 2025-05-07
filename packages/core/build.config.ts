import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig( [
	{
		entries     : [ './src/main', './src/cli' ],
		sourcemap   : false,
		declaration : true,
		failOnWarn  : true,
		rollup      : {
			emitCJS            : true,
			inlineDependencies : true,
			esbuild            : {
				minify : true,
				target : 'node20',
			},
		},
	},
] )
