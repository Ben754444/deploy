import {IProject, IProjectData} from "./interfaces/Project";
import * as path from "path";
import {readFileSync, readdirSync} from "fs";
import getLogger from "./logger";
import {HTTPError} from "./server/utils/HTTPError";
import {config} from "./index";

const logger = getLogger("projects");
const projects: IProject[] = [];

function validate(content: Partial<IProjectData>, name: string) {
    if (!content.secret) {
        throw new Error(`Project ${name} is missing secret`)
    }
    if (!content.scripts || !content.scripts.main || !(content.scripts.main instanceof Array)) {
        throw new Error(`Project ${name} is missing scripts.main array`)
    }
}


export function loadProjects() {
    const projectsDir = path.join(process.cwd(), "/projects");
    for (const file of readdirSync(projectsDir)) {
        if (file === "example.json" || file === "example2.json") continue;
        const json = JSON.parse(readFileSync(path.join(process.cwd(), `/projects/${file}`), "utf8")) as Partial<IProjectData>;
        if (json instanceof Array) {
            for (const project of json) {
                validate(project, file);
            }
        } else {
            validate(json, file);
        }
        const project: IProject = {
            name: file.split(".")[0],
            data: json as IProjectData
        };

        projects.push(project);
        logger.info(`Loaded project ${project.name}`);
    }
    if (projects.length === 0) {
        throw new Error("No projects found. Please create a project using the examples in the /projects folder. (you must name the files something other than example)")
    }
}

export function get(project: string, env?: string): IProjectData | undefined {
    const projectConfig = projects.find((p) => p.name === project);
    if (projectConfig) {
        if (projectConfig.data instanceof Array) {
            if (env) {
                return projectConfig.data.find((p) => p.environment === env);
            } else {
                if (config.hide_projects) {
                    throw new HTTPError(404, "Project or environment not found")
                } else {
                    throw new HTTPError(400, "Environment not specified but required")
                }
            }
        } else {
            if (env) {
                if (config.hide_projects) {
                    throw new HTTPError(404, "Project or environment not found")
                } else {
                    throw new HTTPError(400, "Environment specified but not required")
                }
            }
            return projectConfig.data;
        }
    }
}


