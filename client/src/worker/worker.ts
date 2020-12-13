import util from 'util';

export async function contribute () {
	console.debug('worker contribute');
    const wasm = await require('phase2');
    
        console.log('wasm imported');
        let paramData =  new Uint8Array(64);
        //console.log('Source params', paramData);
        //console.log(`phase2  ${wasm.contribute} `);
        const result = await wasm.contribute(paramData, new Uint8Array(64), reportProgress, setHash);
        console.debug('compute done');
    //});
};

const reportProgress = () => {

};

const setHash = (h: string) => {

};
