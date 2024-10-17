import { defineBuildConfig } from "unbuild"

export default defineBuildConfig( [
	{
		entries     : [ "./src/main", './src/cli' ],
		sourcemap   : false,
		declaration : true,
		rollup      : { esbuild: { minify: true } },
	},
	{
		entries     : [ './src/bin' ],
		clean       : true,
		outDir      : './build/unbuild',
		declaration : false,
		rollup      : { 
			inlineDependencies : true,
			esbuild            : { minify: true }, 
		}, 
	}, 
] )
