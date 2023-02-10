enum Level {
    Debug,
    Info,
    Warning,
    Error,
}

class Logger {
    private static debug = console.debug;
    private static info = console.info;
    private static warn = console.warn;
    private static error = console.error;

    logs: [any[], Level, EpochTimeStamp][];

    public constructor() {
        this.logs = [];

        console.debug = (...args) => {
            this.debug(...args);
        };
        console.info = (...args) => {
            this.info(...args);
        };
        console.log = (...args) => {
            this.info(...args);
        };
        console.warn = (...args) => {
            this.warn(...args);
        };
        console.error = (...args) => {
            this.error(...args);
        };
    }

    public get_logs(): [any[], Level, EpochTimeStamp][] {
        return this.logs;
    }

    private debug(...args) {
        this.logs.push([Array.from(args), Level.Debug, Date.now()]);
        Logger.debug(...args);
    }

    private info(...args) {
        this.logs.push([Array.from(args), Level.Info, Date.now()]);
        Logger.info(...args);
    }

    private warn(...args) {
        this.logs.push([Array.from(args), Level.Warning, Date.now()]);
        Logger.warn(...args);
    }

    private error(...args) {
        this.logs.push([Array.from(args), Level.Error, Date.now()]);
        Logger.error(...args);
    }
}

const LOGGER = new Logger();

function report_bug() {
    window.sessionStorage.setItem("logs", JSON.stringify(LOGGER.get_logs()));
    window.location.href = `/report?back=${encodeURI(window.location.pathname + window.location.search)}`;
}

let report = document.getElementById("report");
if (report)
    report.onclick = () => { report_bug() };