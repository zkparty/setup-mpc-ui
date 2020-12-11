//import phase2 from "phase2";

onmessage = async function (ev) {
	console.debug('worker.js onmessage');
	const phase2 = await import('phase2');
	const data = phase2.compute(ev.data);
	console.debug('compute done');
	postMessage(data);
};