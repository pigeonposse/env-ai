import { CoreSuper } from './super'

export class CoreConfig extends CoreSuper {

	validateProperties<V extends CoreSuper['_argv']>( properties: V ): V {

		const res = this.argvSceham.parse( properties )
		// eslint-disable-next-line @stylistic/indent
        // @ts-ignore
		return res

	}

	/**
	 * Overwrite argv
	 *
	 * @description
	 * Overwrite argv if exist argv.config with a config file. files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]
	 */
	async set() {

		const argv   = this._argv
		const config = argv.config
		if ( !config ) return

		try {

			const props = await this._sys.readConfigFile( config ) as CoreSuper['_argv']
			const data  = await this.validateProperties( props )

			for ( const key in data ) {

				// @ts-ignore
				if ( !argv[key] ) argv[key] = data[key]

			}

		}
		catch ( e ) {

			this._p.log.warn( 'Error setting config properties: ' + this._setErrorMessage( e ) )

		}

	}

}
