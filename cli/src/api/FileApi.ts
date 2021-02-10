import firebase from 'firebase/app';
import "firebase/storage";
import { resolve } from 'path';

const formatParamsFileName = (index: number): string => {
    var tmp = "000" + index.toString();
    var padIndex = tmp.substr(tmp.length-4);
    return `ph2_${padIndex}.params`;
};

export const getParamsFile = async (ceremonyId: string, index: number): Promise<Uint8Array> => {
    const storage = firebase.storage();

    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/${formatParamsFileName(index)}`);
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

export const uploadParams = async (ceremonyId: string, index: number, params: Uint8Array, progressCallback: (p: number) => void): Promise<string> => {
    const storage = firebase.storage();
    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/${formatParamsFileName(index)}`);
    const executor = (resolve: (val: string) => void, reject: (reason: any) => void) => {
        const uploadTask = fileRef.put(params);

        uploadTask.on('state_changed', (snapshot) => {
                const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                switch (snapshot.state) {
                case firebase.storage.TaskState.RUNNING: {
                    progressCallback(progress);
                    break;
                }
                case firebase.storage.TaskState.ERROR: {
                    console.error(`Error uploading parameters`);
                    break;
                }
                case firebase.storage.TaskState.PAUSED: {
                    console.log(`upload paused!`)
                    break;
                }
                }
        }, error => {
            console.error(`Error uploading parameters: ${error.message}`);
            reject(error.message);
        },
        () => {
            // success
            console.log(`Params uploaded to ${uploadTask.snapshot.ref.fullPath}. ${uploadTask.snapshot.totalBytes} bytes`);
            resolve(uploadTask.snapshot.ref.fullPath);
    })};
    return new Promise(executor);
};

export const uploadCircuitFile = async (ceremonyId: string, circuitFile: File): Promise<firebase.storage.UploadTaskSnapshot> => {
    // upload circuit file
    try {
        const storageRef = firebase.storage().ref();
        const fbFileRef = storageRef.child(`ceremony_data/${ceremonyId}/${circuitFile.name}`);

        // Firebase storage ref for the new file
        //const fbFileRef = ceremonyDataRef.child(circuitFile.name);
        return fbFileRef.put(circuitFile);
    } catch (err) {
        console.warn(`Error uploading circuit file: ${err.message}`);
        throw err;
    }
};
