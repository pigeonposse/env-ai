#!/usr/bin/env node

import { cli } from './cli-super'

const run = async ( ) => {

    const app = await cli()
    await app.run()

}
run()
