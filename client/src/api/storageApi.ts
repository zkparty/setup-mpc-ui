import firebase from 'firebase/app';
import "firebase/storage";

const storage = new Storage();

export const GetParamsFile = async (ceremonyId: string, index: number): Promise<Uint8Array> => {
    var tmp = "000" + index.toString();
    var padIndex = tmp.substr(tmp.length-4);
    const fileRef = storage.ref(`${ceremonyId}/ph2_${padIndex}.params`);
    const metadata = await fileRef.getMetadata()
        .catch((err: any) => { 
            console.log(`Expected params file doesn't exist? ${err.message}`); 
            throw err;
    });
    console.log(`Fetching ${metadata.fullPath}`);
    const paramsFile = await fetch(fileRef.getDownloadUrl());
    return new Uint8Array(await paramsFile.arrayBuffer());
};

