import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
//import { main } from "./../packages/phase2/main";

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

const Loaded = ({ wasm }: { wasm: any}) => (<Button onClick={wasm.contribute} style={{color: 'white'}}>Contribute</Button>);

const Unloaded = (props: { loading: boolean, loadWasm: any }) => {
  return props.loading ? (
    <div>Loading...</div>
  ) : (
    <button onClick={props.loadWasm}>Load library</button>
  );
};

export const ParticipantSection = () => {
  const [loading, setLoading] = React.useState(false);
  const [wasm, setWasm] = React.useState<any | null>(null);

  const loadWasm = async () => {
    try {
      setLoading(true);
      const wasm = await import('phase2');
      setWasm(wasm);
    } finally {
      setLoading(false);
    }
  };

  const run = () => {
  };

  return (
    <div style={{ width: "512px" }}>
      <Typography variant="body1">
        Welcome to zkparty. This page will allow you to participate in the ceremony. Once you agree, your computation will commence. 
      </Typography>
      {wasm ? (
          <Loaded wasm={wasm} />
        ) : (
          <Unloaded loading={loading} loadWasm={loadWasm} />
        )}
    </div>
  );
};
  
  