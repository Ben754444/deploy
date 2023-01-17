//make sure we do config before anything else
import * as bcrypt from "bcryptjs"

const args = process.argv.slice(2);

if (args.includes("--encrypt")) {
    const res = bcrypt.hashSync(args[1], bcrypt.genSaltSync(10));
    console.log(res);
    process.exit(0)
}

import * as path from "path";

const configFile = require(path.join(process.cwd()) + "/config.json");

const defaultConfig = {
    port: 3366,
    host: "0.0.0.0",
    production: true,
    hide_projects: false
};

export const config: IConfig = {...defaultConfig, ...configFile};

process.env.DEBUG = "*,-express:*";

import {start} from "./server";
import getLogger from "./logger";
import {IConfig} from "./interfaces/Config";

const logger = getLogger("app");

logger.info("Starting app");

start(config.port);

export {}
