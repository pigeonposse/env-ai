import { defineConfig } from 'binarium'

export default defineConfig( {
	input       : 'dist/cli.mjs',
	name        : 'env-ai',
	denoOptions : { flags : [
		'-A',
		'--no-prompt',
		'--allow-scripts=npm:sharp@0.33.6,npm:protobufjs@7.4.0,npm:canvas@2.11.2,npm:@swc/core@1.7.39,npm:lmdb@2.8.5,npm:msgpackr-extract@3.0.3', 
	] },
} )
