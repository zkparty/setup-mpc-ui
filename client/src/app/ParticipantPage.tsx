import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";

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

export const ParticipantSection = () => {
    return (
      <div style={{ width: "512px" }}>
        <Typography variant="body1">
          Welcome to zkparty. This page will allow you to participate in the ceremony. Once you agree, your computation will commence. 
        </Typography>
      </div>
    );
  };
  
  