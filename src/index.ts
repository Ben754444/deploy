//make sure we do config before anything else
import * as fs from "fs";
import * as child_process from "child_process";
import * as path from "path";

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
    fs.writeFileSync(path.join(process.cwd(), "/projects/example2.json"), JSON.stringify(require("../projects/example2.json"), null, 4));
}

const args = process.argv.slice(2);
// debating on restart settings
if (args.includes("--systemd")) {
    fs.writeFileSync("/etc/systemd/system/deploy.service", `
[Unit]
Description=Deploy Service
After=multi-user.target

[Service]
#Restart=on-failure
#RestartSec=15
WorkingDirectory=${process.cwd()}
ExecStart=${process.cwd()}/deploy-linux-amd64 

[Install]
WantedBy=multi-user.target

    `);
    child_process.execSync("systemctl daemon-reload");
    child_process.execSync("systemctl enable --now deploy");
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
