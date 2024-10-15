
import {
	writeFile, readFile, stat,
} from "node:fs/promises"
import {
	resolve, extname, 
} from "node:path"
import { globby } from 'globby'
import yaml from 'yaml'
import toml from 'toml'
import { pathToFileURL } from "node:url"

export default class Sys {

	path = { resolve: resolve }
	readFile = readFile
	writeFile = writeFile
	getPaths = globby
	extname = extname
	async existsFile( filePath: string ): Promise<boolean> {

		try {

			const fileStats = await stat( filePath ) 
			return fileStats.isFile() 
		
		} catch {

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

		const ext = this.extname( filePath )
		const content = await this.readFile( filePath, 'utf8' )
		let res
	  
		if ( ext === '.json' ) {

			res = JSON.parse( content )
		
		} else if ( ext === '.yml' || ext === '.yaml' ) {

			res = yaml.parse( content )
		
		} else if ( ext === '.toml' || ext === '.tml' ) {

			res = toml.parse( content )
		
		} else if ( ext === '.js' || ext === '.mjs' ) {

			const modulePath = pathToFileURL( filePath ).href
			res = ( await import( modulePath ) ).default
		
		} else {

			throw new Error( `Unsupported file extension: ${ext}` )
		
		}
	  
		return res
	
	}

}
