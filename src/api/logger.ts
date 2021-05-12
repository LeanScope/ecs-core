import { ILogObject, Logger } from "tslog";
export const log: Logger = new Logger({ suppressStdOutput: true });

function logToTransport(logObject: ILogObject) {
    const message = logObject.argumentsArray[0];
    console.log('%c '+message, 'background: #222; color: #bada55');
}

log.attachTransport(
    {
        silly: logToTransport,
        debug: logToTransport,
        trace: logToTransport,
        info: logToTransport,
        warn: logToTransport,
        error: logToTransport,
        fatal: logToTransport,
    },
    "debug"
);