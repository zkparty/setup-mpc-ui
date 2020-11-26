//import * as phase2 from "./pkg";

export async function main() {
    console.log('phase2.js.main()');
    const phase2 = await require("./pkg")
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