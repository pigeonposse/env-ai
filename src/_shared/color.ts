import pc from 'picocolors'

export const green = pc.green
export const italic = pc.italic
export const yellow = pc.yellow
export const red = pc.red
export const blue = pc.cyan
export const underline = pc.underline
export const black = ( v:string ) => pc.black( v )

export const gray = ( v:string ) => pc.gray( pc.dim( v ) )

export const blackBold = ( v:string ) => pc.black( pc.bold( v ) )
export const introColor = ( v:string ) => pc.bgCyan( blackBold( ` ${v} ` ) )
export const error = ( v:string ) => pc.bgRed( ` ${v} ` )
export const warn = ( v:string ) => pc.bgYellow( blackBold( ` ${v} ` ) )
export const success = ( v:string ) => pc.bgGreen( blackBold( ` ${v} ` ) )
export const debug = ( v:string ) => pc.bgWhite( pc.black( ` ${v} ` ) )
export const section = ( v:string ) => pc.bgBlue( pc.white( ` ${v} ` ) )
export const link = ( v:string ) => underline( italic( v ) )
