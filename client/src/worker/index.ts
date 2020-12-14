// @ts-ignore
import wasmWorker from 'wasm-worker';

const reportProgress = () => {};
const setHash = () => {};

export const runContribute = async () => {
    return wasmWorker('phase2')
        .then((module: { exports: { contribute: (arg0: Uint8Array, arg1: Uint8Array, arg2: () => void, arg3: () => void) => any; }; }) => {
            return module.exports.contribute(new Uint8Array(), new Uint8Array(), reportProgress, setHash);
        });
};
