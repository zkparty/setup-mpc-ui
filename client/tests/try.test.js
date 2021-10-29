const firebase = require("firebase/app");
const firestore = require("firebase/firestore")
const firebaseConfig =require("./firebaseConfig-test.ts");


test('add 1+1', () => {
    let a = 1+1;
    expect(a).toBe(2);
});

test('init db', async () => {
    firebase.initializeApp({
        projectId: "demo-ts",
      });

    console.log(`location ${typeof(firebase.firestore)}`);
    var db = firebase.firestore();
    //if (location.hostname === "localhost") {
        console.log(`emulator `);
        db.useEmulator("localhost", 8080);
    //}
    const ref = await db.collection('ceremonies').add(
        {
            'id': 'test',
            'name': 'my Name',
            'number': 123
        }
    );
    const snap = await ref.get();

    expect(snap).toBeDefined();

    console.log(`id ${snap.id} ${snap.get('name')}`);

    // TODO
    // CReate ceremony
    // Add first few contributions and events
    // 
    // Testing for race conditions:
    // Set latest contributor to RUNNING
    // ** Set up multiple threads
    // ** Join
    // Wait for all threads to complete
    // Test that all queue numbers are different
    
    
});
