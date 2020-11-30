import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import { GetParamsFile } from "../api/FileApi";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import {
  getCeremonySummaries,
  getCeremonySummariesCached
} from "../api/ZKPartyApi";
import { Ceremony } from "../types/ceremony";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

const Loaded = ({ wasm, contribute }: { wasm: any, contribute: () => any}) => (<Button onClick={contribute} style={{color: 'white'}}>Contribute</Button>);

const Unloaded = (props: { loading: boolean, loadWasm: any }) => {
  return props.loading ? (
    <div>Loading...</div>
  ) : (
    <Button onClick={props.loadWasm} style={{color: 'white'}}>Load library</Button>
  );
};

export const ParticipantSection = () => {
  const [loading, setLoading] = React.useState(false);
  const [wasm, setWasm] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Uint8Array | null>(null);
  const [running, setRunning] = React.useState(false);
  const [entropy, setEntropy] = React.useState(new Uint8Array(64));

  const getEntropy = () => {
    const s = entropy.map((v, i) => Math.random() * 256);
    console.log(`entropy: ${s.toString()}`);
    setEntropy(s);
    return s;
  };

  const loadWasm = async () => {
    try {
      setLoading(true);
      // ignore syntax check error. Make sure to *npm link* phase2 in ../lib/pkg
      const wasm = await import('phase2');
      setWasm(wasm);
      //let paramData: any = await fetch('/zk_transaction_1_2.params');
      //paramData = await paramData.arrayBuffer();
      //paramData = new Uint8Array(paramData);
      const ceremonyId = "E2F5wqJvxbKVcl9Mv2aD";
      const index: number = 1;
      const paramData = await  GetParamsFile(ceremonyId, index);
      console.log('Source params', paramData);
      setData(paramData);
      getEntropy();
    } finally {
      setLoading(false);
    }
  };

  const compute = () => {
    if (running) {
      console.log('running computation...');
      const result = wasm.contribute(data, Buffer.from(getEntropy()));
      console.log('Updated params', result)
      setRunning(false);
    }
  };

  compute();

  const run = () => {
    setRunning(true);
  };

  const serviceWorker = () => { 
    navigator.serviceWorker.ready.then(() => {
      console.log('service worker ready');
      navigator.serviceWorker.controller?.postMessage({type: 'LOAD_WASM'});
      navigator.serviceWorker.addEventListener('message', event => {
        console.log(`message from service worker ${event.data.type}`);
      });
    });
  };

  serviceWorker();

  return (
    <div style={{ width: "512px" }}>
      <Typography variant="body1">
        Welcome to zkparty. This page will allow you to participate in the ceremony. Click to your commence your contribution. 
      </Typography>
      {running ? (<><CircularProgress /><Typography>Calculating ...</Typography></>) : (
        wasm && data ? (
          <Loaded wasm={wasm} contribute={run} />
        ) : (
          <Unloaded loading={loading} loadWasm={loadWasm} />
        ))}
    </div>
  );
};
  
  