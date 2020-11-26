//import * as phase2 from "./pkg";

async function wasmPhase2() {
    console.log('phase2.js.main()');
    const phase2 = await import("./pkg/phase2.js")
    let data = await fetch('./circom1.params')
    data = await data.arrayBuffer()
    data = new Uint8Array(data)
    console.log('Source params', data)
    const result = phase2.contribute(data)
    console.log('Updated params', result)
    // upload updated params
}

//main().catch(console.error)
//module.exports = main;