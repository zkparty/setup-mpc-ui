import firebase from 'firebase/app';
const {Storage} = require("@google-cloud/storage");
import "firebase/storage";
import { resolve } from 'path';
import { createWriteStream, createReadStream } from 'fs';
import {pipeline} from 'stream';
import {promisify} from 'util';
import fetch from 'node-fetch';

const streamPipeline = promisify(pipeline);

const formatParamsFileName = (index: number): string => {
    var tmp = "000" + index.toString();
    var padIndex = tmp.substr(tmp.length-4);
    return `ph2_${padIndex}.params`;
};

export const getParamsFile = async (ceremonyId: string, index: number, destPath: string): Promise<void> => {
    
    const projectId = 'trustedsetup-a86f4';
    const storage = firebase.storage();
    let ref = storage.ref();
    console.debug(`ref ${ref.name}`)
    const f = formatParamsFileName(index);
    ref = ref.child('ceremony_data').child(ceremonyId).child(f);
    console.debug(`ref ${ref.name}`)
    //const storage = new Storage({projectId });

    // const [files] = await storage.bucket(`${projectId}.appspot.com`).getFiles({
    //     prefix: `/ceremony_data/${ceremonyId}/`, 
    //     delimiter: '/'
    // });
    // console.log(`Files: ` );
    // const matchFiles = files.filter(file => file.name.endsWith(f));
    // if (matchFiles.length > 0) {
    //     console.log(`found matching file ${matchFiles[0].name}`);
    //     const file = await matchFiles[0].download({
    //         destination: destPath,
    //     });
    //     console.log(`Downloaded!`);
    // } else {
    //     console.log(`no matching file found.`);
    // };

    const fileRef = ref; //storage.ref(`/ceremony_data/${ceremonyId}/${f}`);
    console.debug('get metadata')
    // fileRef.getMetadata().then((metadata) => {
    //     console.log(`${metadata.size} bytes`);
    //     })
    //     .catch((err: any) => { 
    //         console.log(`Expected params file doesn't exist? ${err.message}`); 
    //         throw err;
    // });
    
    //fileRef.getDownloadURL()
    const url = `https://firebasestorage.googleapis.com/v0/b/trustedsetup-a86f4.appspot.com/o/ceremony_data%2F${ceremonyId}%2F${f}?alt=media`;
    
    console.log(`Fetching ${url}`);
    const res = await fetch(url);
    //const response = await fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png');
    
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    
    await streamPipeline(res.body, createWriteStream(destPath));

    return;

    //const paramsFile = await fetch(url);
    //const fileStream = fs.createWriteStream(destPath);

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

export const uploadParams = async (ceremonyId: string, index: number, params: string, progressCallback: (p: number) => void): Promise<string> => {
    const storage = firebase.storage();
    //const fileRef = await storage.bucket(`${fbSkey.project_id}.appspot.com`).upload(paramsFile,{
    //    destination: `ceremony_data/${ceremonyId}/${paramsFileName}`
    //});

    console.debug(`upload starting`)
    const fileRef = storage.ref(`/ceremony_data/${ceremonyId}/${formatParamsFileName(index)}`);
    console.debug(`have file ref`)

    const upload = (arr: Uint8Array, resolve: any, reject: any) => {
        try {
            const uploadTask = fileRef.put(arr);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
                snapshot.ref.getDownloadURL().then(
                    url => {console.debug(`snapshot url: ${url}`)}
                );
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
                    default: {
                        console.debug(`upload snapshot state: ${snapshot.state}`);
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
        });
        } catch (err) {
            console.error(err.message);
        }
    };

    const executor = (resolve: (val: string) => void, reject: (reason: any) => void) => {
        const stream = createReadStream(params);
        let arr = new Uint8Array();
        stream.on('data', chunk => {
            if (chunk instanceof Buffer) {
                let tmp = new Uint8Array(arr.length + chunk.byteLength);
                tmp.set(arr);
                tmp.set(Array.from(chunk), arr.length);
                arr = tmp;
            }
        });
        stream.on('error', (err) => {
            console.error(`Error uploading file: ${err.message}`);
        });
        stream.on('close', () => {
            console.debug(`stream close ${arr.byteLength}`);

            upload(arr, resolve, reject);
        });
    };
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
