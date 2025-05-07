
import { globby } from 'globby'
import {
	writeFile,
	readFile,
	stat,
} from 'node:fs/promises'
import {
	resolve,
	extname,
	isAbsolute,
	join,
	basename,
} from 'node:path'
import { pathToFileURL }      from 'node:url'
import { parse as tomlparse } from 'smol-toml'
import yaml                   from 'yaml'

export const isPath = ( str: string ) => {

	if ( isAbsolute( str ) || /^(\.\/|\.\.\/|[A-Za-z]:\\|\/)/.test( str ) ) {

		if ( isAbsolute( str ) || /^(\.\/|\.\.\/|[A-Za-z]:\\|\/)/.test( str ) ) {

			if ( /\s(?!\\)/.test( str ) && !/\\\s/.test( str ) )
				return false

			try {

				const normalizedPath = join( str )
				return normalizedPath !== ''

			}
			catch {

				return false

			}

		}

	}
	return false

}

export default class Sys {

	path = {
		resolve,
		extname,
		basename,
		isAbsolute,
		join,
	}

	readFile = readFile
	writeFile = writeFile

	isAbsolute = isAbsolute
	join = join
	isPath = isPath
	getPaths = globby
	extname = extname

	async existsFile( filePath: string ): Promise<boolean> {

		try {

			const fileStats = await stat( filePath )
			return fileStats.isFile()

		}
		catch {

			return false

		}

	}

	/**
	 * Reads a configuration file and returns the parsed content.
	 * @param {string} filePath - The path to the configuration file.
	 * @returns {Promise<object>} - The parsed content of the configuration file.
	 * @throws {Error} - If the file extension is not supported.
	 */
	async readConfigFile( filePath: string ): Promise<object> {

		const ext     = this.extname( filePath )
		const content = await this.readFile( filePath, 'utf8' )
		let res

		if ( ext === '.json' ) {

			res = JSON.parse( content )

		}
		else if ( ext === '.yml' || ext === '.yaml' ) {

			res = yaml.parse( content )

		}
		else if ( ext === '.toml' || ext === '.tml' ) {

			res = tomlparse( content )

		}
		else if ( ext === '.js' || ext === '.mjs' ) {

			const modulePath = pathToFileURL( filePath ).href
			res              = ( await import( modulePath ) ).default

		}
		else {

			throw new Error( `Unsupported file extension: ${ext}` )

		}

		return res

	}

}
