import { defineConfig }             from '@dovenv/core'
import { pigeonposseMonorepoTheme } from '@dovenv/theme-pigeonposse'

import core from './const.js'

export default defineConfig(
	pigeonposseMonorepoTheme( { core } ),
)
