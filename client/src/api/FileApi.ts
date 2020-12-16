import firebase from 'firebase/app';
import "firebase/storage";
import { resolve } from 'path';

const FormatParamsFileName = (index: number): string => {
    var tmp = "000" + index.toString();
    var padIndex = tmp.substr(tmp.length-4);
    return `ph2_${padIndex}.params`;
};

export const getParamsFile = async (ceremonyId: string, index: number): Promise<Uint8Array> => {
    const storage = firebase.storage();

    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/${FormatParamsFileName(index)}`);
    const metadata = await fileRef.getMetadata()
        .catch((err: any) => { 
            console.log(`Expected params file doesn't exist? ${err.message}`); 
            throw err;
    });
    
    const url = await fileRef.getDownloadURL();
    console.log(`Fetching ${url}  ${metadata.size} `);

    const paramsFile = await fetch(url, {mode: 'cors'});

    //let paramData = await paramsFile.arrayBuffer();
    return new Uint8Array(await paramsFile.arrayBuffer());

    // Using streamed read:
    //const buffer = await new Response(await paramsFile.blob()).arrayBuffer();

    // const body = paramsFile.body;
    // console.log(`body? ${body}`);
    // let arr: Uint8Array = new Uint8Array(metadata.size);
    // let i = 0;
    // const fr = body?.getReader();
   
    // let p = new Promise<any>((resolve, reject) => {
    //     let isDone: boolean = false;
    //     const readChunk = (res: ReadableStreamReadResult<Uint8Array>) => {
    //         console.log(`result: ${res?.done ? 'done' : 'chunk...'}`);
    //         if (!res.done) {arr.set(res.value, i);
    //             i += res.value.length;
    //             fr?.read().then(res => readChunk(res));
    //         } else {
    //             isDone = true;
    //             resolve(arr);
    //         }
    //     };
    //     console.log(`read 1st chunk: ${fr ? 'have fileReader': 'no fileReader!'}`);
    //     fr?.read().then(res => readChunk(res));
    // });

        
    //  return p;
    // //fr.result
    // fr.readAsBinaryString(blob);

    //const buffer = await blob.arrayBuffer();
    //console.log(`paramsFile length ${buffer.byteLength}`);
    //return new Uint8Array(blob);
};

export const UploadParams = async (ceremonyId: string, index: number, params: Uint8Array): Promise<string> => {
    const storage = firebase.storage();
    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/${FormatParamsFileName(index)}`);
    const snapshot = await fileRef.put(params);
    console.log(`Params uploaded to ${snapshot.metadata.fullPath}. ${snapshot.totalBytes} bytes`);
    return snapshot.metadata.fullPath;
};

export const UploadCircuitFile = async (ceremonyId: string, circuitFile: File): Promise<firebase.storage.UploadTaskSnapshot> => {
    // upload circuit file
    const storageRef = firebase.storage().ref();
    const ceremonyDataRef = storageRef.child(`ceremony_data/${ceremonyId}`);

    // Firebase storage ref for the new file
    const fbFileRef = ceremonyDataRef.child(circuitFile.name);
    return fbFileRef.put(circuitFile);
};
