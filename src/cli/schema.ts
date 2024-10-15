
import {
	createLiteralUnion, validate, 
} from '../_shared/validate'
import {
	overwrite, theme, 
} from './const'
// Crear los tipos `OverwriteTypes` y `ThemeTypes` utilizando `createEnum`
const OverwriteTypes = createLiteralUnion( Object.values( overwrite ) )
const ThemeTypes = createLiteralUnion( Object.values( theme ) )

export const argvSchema = validate.object( {
	output    : validate.string().optional(),
	include   : validate.array( validate.string() ).optional(),
	exclude   : validate.array( validate.string() ).optional(),
	overwrite : OverwriteTypes.optional(),
	model     : validate.string().optional(),
	prompt    : validate.string().optional(),
	system    : validate.string().optional(),
	theme     : ThemeTypes.optional(),
	single    : validate.boolean().optional(),
	debug     : validate.boolean().optional(),
	config    : validate.string().optional(),
} )
  
