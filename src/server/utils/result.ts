import * as status from 'statuses';

export function success(code: number, data?: any) {
    if (status.empty[code]) return new Response(null, {status: code});
    return {
        success: true,
        code,
        message: status.message[code],
        data: data
    }
}

export function error(code: number, error?: any) {
    return {
        success: false,
        code,
        message: status.message[code],
        error
    }
}