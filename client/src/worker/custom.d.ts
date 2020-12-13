declare module 'comlink-loader!*' {
    class WebpackWorker extends Worker {
        constructor();

        contribute(): Promise<void>;
    }

    export = WebpackWorker;
}