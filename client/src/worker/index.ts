// @ts-ignore
import importFromWorker, { workerSymbol } from 'import-from-worker';

const reportProgress = () => {};
const setHash = () => {};

export const runContribute = async (): Promise<any> => {
    const { contribute } = await importFromWorker('phase2');
    const result = await contribute(new Uint8Array(), new Uint8Array(), reportProgress, setHash);
    return result;
};
