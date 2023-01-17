import * as express from "express";
import {HTTPError} from "../utils/HTTPError";
import {projects} from "../../projects";
import {config} from "../../index";
import * as bcrypt from "bcryptjs";
import {IProject, IProjectData} from "../../interfaces/Project";
import getLogger from "../../logger";

export const router = express.Router({mergeParams: true});

const logger = getLogger("server:projects");

interface IParams {
    project: string
}

router.post("/:env?", (req, res) => {
    const project = (req.params as IParams).project;
    const env = req.params.env;
    const projectConfig = projects.get(project, env);

    if (!projectConfig) {
        throw new HTTPError(404, "Project or environment not found")
    }
    if (!bcrypt.compareSync((req.header("Authorization") || "").split(" ")[1], projectConfig.encrypted_secret)) {
        if (config.hide_projects) {
            throw new HTTPError(404, "Project or environment not found")
        } else {
            throw new HTTPError(400, "Invalid secret")
        }
    }

    //do stuff

    logger.info(`Processing deploy for project ${project} from ${req.header("X-Real-Ip") || req.header("X-Forwarded-For") || req.header("CF-Connecting-IP") || req.ip}`);
    return res.sendStatus(204)


});

router.all("/", (req, res) => {
    throw new HTTPError(405)
});

export default router