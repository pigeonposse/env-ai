#!/usr/bin/env node

import { CLI } from './cli-super'

const run = async ( ) => {

    const app = new CLI()
    await app.run()

}
run()
