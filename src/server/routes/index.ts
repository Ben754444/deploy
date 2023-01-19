import * as express from "express";
import {HTTPError} from "../utils/HTTPError";
import * as projects from "../../projects";
import {config} from "../../index";
import {IProject, IProjectData} from "../../interfaces/Project";
import getLogger from "../../logger";
import * as shell from "shelljs";
import * as Joi from "joi";
import * as crypto from "crypto";

export const router = express.Router({mergeParams: true});

const logger = getLogger("server:projects");

interface IParams {
    project: string
    env?: string
}

const schema = Joi.object({
    environment_variables: Joi.object().pattern(/.*/, [Joi.string(), Joi.number(), Joi.boolean()]).required(),
});

router.post("/:env?", (req, res) => {
    /*
                body    event
                0       0       0
                0       1       0
                1       0       1
                1       1       0
     */
    if (Object.keys(req.body).length !== 0 && !req.header("X-Github-Event")) {
        const result = schema.validate(req.body);
        if (result.error) {
            throw new HTTPError(400, result.error.message)
        }
    }

    //TODO MAKE COMPATIBLE WITH GH WEBHOOKS
    // MAYBE TAKE BODY AND PUT IT AS AN ENV VARIABLE

    const name = (req.params as IParams).project;
    const env = req.params.env;
    const project = projects.get(name, env);

    if (!project) {
        throw new HTTPError(404, "Project or environment not found")
    }
    let isGithub = false;
    if (req.header("X-GitHub-Event") && req.header("X-Hub-Signature-256")) { //if it's a github webhook
        isGithub = true;
        logger.info(project.secret);
        logger.info(crypto.createHash("sha256").update(project.secret).digest("hex"));
        const hmac = crypto.createHmac("sha256", project.secret);
        const digest = Buffer.from("sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex"), "utf8");
        const secret = Buffer.from(req.header("X-Hub-Signature-256")!, "utf8");
        if (digest.length === secret.length && !crypto.timingSafeEqual(digest, secret)) {
            if (config.hide_projects) {
                throw new HTTPError(404, "Project or environment not found")
            } else {
                throw new HTTPError(400, "Invalid secret")
            }
        }
    } else {
        if (!crypto.timingSafeEqual(Buffer.alloc(5, crypto.createHash("sha256").update(project.secret).digest("hex")), Buffer.alloc(5, (req.header("Authorization") || "").split(" ")[1]))) {
            if (config.hide_projects) {
                throw new HTTPError(404, "Project or environment not found")
            } else {
                throw new HTTPError(400, "Invalid secret")
            }
        }
    }
    if (req.header("X-Github-Event") === "ping") {
        return res.sendStatus(204)
    }

    const environment: any = {
        DEPLOY_ENV: env,
        DEPLOY_PROJECT: name,
        DEPLOY_IP: req.header("X-Real-Ip") || req.header("X-Forwarded-For") || req.header("CF-Connecting-IP") || req.ip, // the ip of the deployment request
    };
    if (req.header("X-Github-Event")) {
        environment["DEPLOY_GITHUB"] = JSON.stringify(req.body)
    } else {
        Object.keys(req.body.environment_variables).forEach(key => {
            environment[config.environment_variables_prefix + key] = req.body.environment_variables[key]
        });
    }


    if (project.environment_variables) {
        Object.keys(project.environment_variables).forEach(key => {
            environment[config.environment_variables_prefix + key] = project.environment_variables![key]
        })


    }
    logger.info(`Processing deploy for project ${name} from ${req.header("X-Real-Ip") || req.header("X-Forwarded-For") || req.header("CF-Connecting-IP") || req.ip}`);

    if (project.scripts.pre) {
        logger.info(`Running pre script for project ${name}`);
        for (const script of project.scripts.pre) {
            const result = shell.exec(script, {env: environment});
            if (result.code !== 0) {
                throw new HTTPError(500, "Pre script failed")
            }
        }
    }
    let mainFailed = false;
    for (const script of project.scripts.main) {
        const result = shell.exec(script, {env: environment});
        if (result.code !== 0) {
            mainFailed = true;
            break;
        }
    }
    if (mainFailed) {
        if (project.scripts.on_failure) {
            logger.info(`Running on_failure script for project ${name}`);
            for (const script of project.scripts.on_failure) {
                const result = shell.exec(script, {env: environment});
                if (result.code !== 0) {
                    break
                }
            }
        }
    } else {
        if (project.scripts.on_success) {
            logger.info(`Running on_success script for project ${name}`);
            for (const script of project.scripts.on_success) {
                const result = shell.exec(script, {env: environment});
                if (result.code !== 0) {
                    break
                }
            }
        }
    }

    if (project.scripts.finally) {
        logger.info(`Running finally script for project ${name}`);
        for (const script of project.scripts.finally) {
            const result = shell.exec(script, {env: environment});
            if (result.code !== 0) {
                break
            }
        }
    }

    if (mainFailed) {
        throw new HTTPError(500, "Main script failed")
    }

    return res.sendStatus(204)


});

router.all("/", (req, res) => {
    throw new HTTPError(405)
});

export default router