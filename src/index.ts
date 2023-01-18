//make sure we do config before anything else
import * as fs from "fs";


import * as path from "path";

//TODO AUTOCREATE CONFIG FILE AND /PROJECTS DIR WITH EXAMPLES?
const defaultConfig = {
    port: 3366,
    host: "0.0.0.0",
    production: true,
    hide_projects: false,
    environment_variables_prefix: "DEPLOY_USER_", //ensures no collision between other environment variables
};

if (!fs.existsSync(path.join(process.cwd(), "/config.json"))) {
    fs.writeFileSync(path.join(process.cwd(), "/config.json"), JSON.stringify(defaultConfig, null, 4));
}

if (!fs.existsSync(path.join(process.cwd(), "/projects"))) {
    fs.mkdirSync(path.join(process.cwd(), "/projects"));
    fs.writeFileSync(path.join(process.cwd(), "/projects/example.json"), JSON.stringify(require("../projects/example.json"), null, 4));
    fs.writeFileSync(path.join(process.cwd(), "/projects/example2.json"), JSON.stringify(require("../projects/example.json"), null, 4));
}

const configFile = require(path.join(process.cwd()) + "/config.json");

export const config: IConfig = {...defaultConfig, ...configFile};

process.env.DEBUG = "*,-express:*,-body-parser:json";

import {start} from "./server";
import getLogger from "./logger";
import {IConfig} from "./interfaces/Config";
import * as projects from "./projects";

const logger = getLogger("app");

logger.info("Starting app");

projects.loadProjects();

start(config.port);

export {}
