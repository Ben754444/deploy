import {IProject, IProjectData} from "./interfaces/Project";
import * as path from "path";
import {readFileSync, readdirSync} from "fs";
import getLogger from "./logger";
import {HTTPError} from "./server/utils/HTTPError";
import {config} from "./index";

const logger = getLogger("projects");

class ProjectStore {
    public projects: IProject[] = [];

    constructor() {
        this.loadProjects();
    }

    public loadProjects() {
        const projectsDir = path.join(process.cwd(), "/projects");
        for (const file of readdirSync(projectsDir)) {
            const project: IProject = {
                name: file.split(".")[0],
                data: JSON.parse(
                    readFileSync(path.join(process.cwd(), `/projects/${file}`), "utf8")) as IProjectData
            };

            this.projects.push(project);
            logger.info(`Loaded project ${project.name}`);
        }
    }

    public get(project: string, env?: string): IProjectData | undefined {
        const projectConfig = this.projects.find((p) => p.name === project);
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
}

export const projects = new ProjectStore();

