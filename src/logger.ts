import debug from "debug";

type LogFn = (message: any, meta?: Record<string, unknown>) => void;

type Logger = {
    debug: LogFn;
    trace: LogFn;
    info: LogFn;
    warn: LogFn;
    error: LogFn;
    fatal: LogFn;
};

function esLog(message: string, meta: { level: string, meta?: any, name: string }) {
    //logger.log(message, options);
    //debug.log(message)
}


export default function getLogger(name: string): Logger {
    const log = debug(name);

    //log(`created logger ${name}`);

    return {
        trace(message, meta?) {
            esLog(message, {meta, level: "trace", name});
            log(message);
        },
        debug(message, meta?) {
            esLog(message, {meta, level: "debug", name});
            log(message);
        },
        info(message, meta?) {
            esLog(message, {meta, level: "info", name});
            log(message);
        },
        warn(message, meta?) {
            esLog(message, {meta, level: "warn", name});
            log(message);
        },
        error(message, meta?) {
            esLog(message, {meta, level: "error", name});
            log(message);
        },
        fatal(message, meta?) {
            esLog(message, {meta, level: "fatal", name});
            log(message);
        },
    };


}