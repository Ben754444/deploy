import * as status from 'statuses';

export class HTTPError extends Error {
    constructor(public code: number = 400, public error?: string) {
        super(status.message[code]);
    }
}


