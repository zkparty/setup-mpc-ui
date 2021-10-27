const firebase = require("firebase/app");
const firestore = require("firebase/firestore")
const firebaseConfig =require("./firebaseConfig-test.ts");


test('add 1+1', () => {
    let a = 1+1;
    expect(a).toBe(2);
});

test('init db', async () => {
    firebase.initializeApp({
        authDomain: "demo-ts.firebaseapp.com",
        projectId: "demo-ts",
      });

    console.log(`location ${typeof(firebase.firestore)}`);
    var db = firebase.firestore();
    //if (location.hostname === "localhost") {
        console.log(`emulator `);
        db.useEmulator("localhost", 8080);
    //}
    await db.collection('ceremonies').add(
        {
            'id': 'test',
            'name': 'my Name',
            'number': 123
        }
    )
    
})
