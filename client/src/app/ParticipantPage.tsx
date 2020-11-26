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



export const ParticipantSection = () => {

  const run = () => {
    window.wasmPhase2 = window.wasmPhase2 || {};
    window.wasmPhase2();
  };

  return (
    <div style={{ width: "512px" }}>
      <Typography variant="body1">
        Welcome to zkparty. This page will allow you to participate in the ceremony. Once you agree, your computation will commence. 
      </Typography>
      <Button onClick={run}>Run</Button>
    </div>
  );
};
  
  