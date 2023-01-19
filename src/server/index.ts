import * as express from "express";
import getLogger from "../logger";
import deployRouter from "./routes/"
import {HTTPError} from "./utils/HTTPError";
import {error} from "./utils/result";

const logger = getLogger("server");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next()
});

app.use("/:project", deployRouter);

app.use("*", (req, res) => {
    throw new HTTPError(404, "The requested resource could not be found on this server")
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof HTTPError) {
        return res.status(err.code).json(error(err.code, err.error))
    } else if (err.type === "entity.parse.failed") {
        return res.status(400).json(error(400, err.message));
    }
    logger.error(err); //will this format
    res.status(500).json(error(500, "An error occurred while processing your request. Please try again later."))
});


export function start(port: number) {
    app.listen(port, () => {
        logger.info(`Listening on port ${port}`)
    })
}