
import { hideBin, Clippium, ClippiumData } from 'clippium'
import presetDefault from '@clippium/preset-default'
import {
	argv,
} from 'node:process'
import { EnvAI } from './index'
import { formatter as setFormatter } from '@clippium/preset-colored'

// @ts-ignore
process.noDeprecation = true
console.warn = () => {}

const GENERAL_FLAGS = 'General flags'

export class CLI {

	args = hideBin( argv )
	envai 
	data

	constructor(){
		
		this.envai = new EnvAI()
		const styleTxt = (v: string) => this.envai.color.link(this.envai.color.dim(v))
		const more =  `
Bugs           ${styleTxt(this.envai.data.bugsUrl)}
Documentation  ${styleTxt(this.envai.data.documentationUrl)}`.trim()
		this.data = {
			name: this.envai.data.projectName,
			desc: this.envai.data.projectDesc,
			more,
			version: this.envai.data.version, 
			commands: {
				chat: {
					desc: `Chat with the ${this.envai.data.projectName} assistant`,
					more,
								flags: {
				// inputs
				input : {
					alias    : ['i'],
					desc : 'Path patterns or URLs to be processed',
					type     :'array',
				},
				// ai
				model : {
					alias    : ['m'],
					desc : 'Ollama LLM model name',
					type     : 'string',
				},
				system : {
					alias    : ['s'],
					desc : 'System message (text, path or url)',
					type     : 'string',
				},
				prompt : {
					alias    : ['p'],
					desc : 'Fist prompt to generate a response (text, path or url)',
					type     : 'string',
				},
				theme : {
					alias    : ['t'],
					desc : 'Set a theme for your chat.',
					type: 'choices',
					choices  : Object.values( this.envai.data.theme ),
				},
				// response
				output : {
					alias    : ['o'],
					desc : 'Output path for the generated response',
					type     : 'string',
				},
				overwrite : {
					desc : 'Behavior when output file exists',
					type: 'choices',
					choices  : Object.values( this.envai.data.overwrite ),
				},
				single : {
					desc : 'Only one response',
					type     : 'boolean',
				},
				// others
				config : {
					alias    : ['c'],
					desc : 'Path to config file. Files supported: [.mjs|.js|.json|.yml|.yaml|.toml|.tml]',
					type     : 'string',
				},
				// 'non-interactive' : {
				// 	alias    : 'n',
				// 	describe : 'Non-interactive mode. Do not prompt for user input',
				// 	type     : 'boolean',
				// 	default  : false,
				// },
				debug : {
					desc : 'Debug mode',
					type     : 'boolean',
					group: GENERAL_FLAGS
				},
			}
				},
			}
		} satisfies ClippiumData
	}

	/**
	 * Checks for available updates for the cli and notifies the user
	 * if one is available.
	 *
	 * **IMPORTANT:** not use if you want build a binary of the cli
	 */
	async updater( )  {
		
		const { Updater } = await import('@clippium/updater')

		const {dim,bold, blue, italic, green} = this.envai.color
		const name = this.envai.data.projectName
		const version = this.envai.data.version
		const installCommands: Record<string, string> = {
			npm: 'i',
			pnpm: 'add',
			yarn: 'add',
			bun: 'add',
			deno: 'add',
		} 

		const _updater = new Updater( {
			version,
			name,
		} )

		const data = await _updater.get()
		if ( !data ) return

		const cmd = installCommands[data.packageManager] || 'i'

		
		console.log( `
			
║ 📦 ${bold( 'Update available' )} ${dim( data.currentVersion )} → ${green( data.latestVersion )} ${italic( `(${data.type})` )}
║ Run ${blue( data.packageManager + ` ${cmd} ` + data.packageName )} to update
			
	` )

	}

	/**
	 * Runs the cli.
	 *
	 * If no command is provided, the help menu is shown.
	 *
	 * @returns {Promise<void>}
	 */
	async run(){
		
		const args = hideBin( argv )
		const preset = presetDefault({grouped: GENERAL_FLAGS}) as Clippium<ClippiumData>

		const data = {
			...this.data, 
			flags: preset.data.flags
		} satisfies ClippiumData
		const color = this.envai.color

		const formatter = setFormatter( {
			title         : v => color.blue(color.inverse(color.bold(v))),
			bin           : color.blue,
			version       : v => color.blue(color.dim(color.italic(v))),
			name          : color.bold,
			positionals   : v => color.green(color.dim(v)),
			commands      : color.green,
			flags         : color.yellow,
			desc          : v => color.white(color.dim(v)),
			examples      : color.blue,
			sectionTitle  : v => color.bold(color.underline(v)) ,
			sectionDesc   : v => color.green(color.dim(v)),
			sectionsProps : v => color.green(color.dim(color.italic(v))),
		} )
		const cli  = new Clippium( data, { help: { formatter } } )
		
		cli.fn = async (data) => {
	
			const setHelp = () => console.log(cli.getHelp(data.utils.argv))
			if(data.flags.version) {
				console.log(cli.getVersion())
				return 
			}else if(data.flags.help) {
				setHelp()
				return 
			}

			try {
				
				const d = cli.validate(data)
				this.envai.options = d.flags as EnvAI['options']
				
				if(d.commands.chat) {
					await this.envai.run()
				}else {
					setHelp()
				}

			} catch (e) {
				console.log(e instanceof Error ? e.message : 'Unexpected Error')
			}
			
			

		}

		await cli.run(args)
	}
}