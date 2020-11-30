import firebase from 'firebase/app';
import "firebase/storage";
import { resolve } from 'path';

export const GetParamsFile = async (ceremonyId: string, index: number): Promise<any> => {
    const storage = firebase.storage();

    var tmp = "000" + index.toString();
    var padIndex = tmp.substr(tmp.length-4);
    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/ph2_${padIndex}.params`);
    const metadata = await fileRef.getMetadata()
        .catch((err: any) => { 
            console.log(`Expected params file doesn't exist? ${err.message}`); 
            throw err;
    });
    const url = await fileRef.getDownloadURL();
    console.log(`Fetching ${url}  ${metadata.size} `);

    const paramsFile = await fetch(url, {mode: 'no-cors'});
    //const buffer = await new Response(await paramsFile.blob()).arrayBuffer();
    const body = paramsFile.body;
    console.log(`body? ${body}`);
    let arr: Uint8Array = new Uint8Array(metadata.size);
    let i = 0;
    const fr = body?.getReader();

    
    let p = new Promise<any>((resolve, reject) => {
        console.log('enter promise');
        let isDone: boolean = false;
        const readChunk = (res: ReadableStreamReadResult<Uint8Array>) => {
            console.log(`result: ${res?.done ? 'done' : res?.value}`);
            if (!res.done) {arr.set(res.value, i);
                i += res.value.length;
                fr?.read().then(res => readChunk(res));
            } else {
                isDone = true;
                resolve(arr);
            }
        };
        console.log(`read 1st chunk: ${fr ? 'have fr': 'no fr!'}`);
        fr?.read().then(res => readChunk(res));
    });

        
    //     fr.onloadend = async event => {
    //         console.log(`loadend ${event.type}`);
    //         console.log(`blob: ${fr.result}`);
    //         const buffer: string | ArrayBuffer | null = fr.result;
    //             //console.log(`resolve: ${buffer.length}`);
    //             resolve( fr.result);
    //     };

    //     fr.onerror = event => reject();
     //});
     return p;
    // //fr.result
    // fr.readAsBinaryString(blob);

    //const buffer = await blob.arrayBuffer();
    //console.log(`paramsFile length ${buffer.byteLength}`);
    //return new Uint8Array(blob);
};

export const UploadCircuitFile = async (ceremonyId: string, circuitFile: File): Promise<firebase.storage.UploadTask> => {
    // upload circuit file
    const storageRef = firebase.storage().ref();
    const ceremonyDataRef = storageRef.child(`ceremony_data/${ceremonyId}`);

    // Firebase storage ref for the new file
    const fbFileRef = ceremonyDataRef.child(circuitFile.name);
    return fbFileRef.put(circuitFile);
};
