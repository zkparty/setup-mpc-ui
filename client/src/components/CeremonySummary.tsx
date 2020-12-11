import { RouteProps, useHistory } from "react-router-dom";
import * as React from "react";
import styled from "styled-components";
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import { Ceremony } from "../types/ceremony";
import { format } from "timeago.js";
import { SelectedCeremonyContext } from "../app/LandingPage";
import { useContext } from "react";
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { Typography, Box, makeStyles } from "@material-ui/core";

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center" style={{ paddingLeft: '10px' }}>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary" style={{ color: textColor }}>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const CeremonyContainer = styled.div`
  background-color: ${lighterBackground};
  margin: 10px;
  width: 512px;
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border: 2px solid ${secondAccent};
  }
`;

const Bold = styled.div`
  font-weight: bold;
`;

const Flex = styled.div`
  display: flex;
`;

const CeremonySummary = (props: { ceremony: Ceremony, onClick: () => void } & RouteProps) => {
    const c = props.ceremony;
    const { setSelectedCeremony } = useContext(SelectedCeremonyContext);
    const classes = useStyles();
  
    //let history = useHistory();
  
    const onClick = () => {
      setSelectedCeremony(c.id);
      props.onClick();
    };

    //console.log(`ceremony id: ${c.id}`);
    const progress = c.complete ? Math.floor(Math.min(100, 100 * c.complete/c.minParticipants)) : 0;
  
    return (
      <CeremonyContainer onClick={onClick}>
        <CeremonyTitle>{c.title}</CeremonyTitle>
        {c.description}
        <br />
        <br />
        <Flex>
          <Bold>Status:&nbsp;</Bold>{` ${c.ceremonyState}`}
          {(c.ceremonyState === "RUNNING" ? 
              (<div className={classes.root}>
                <LinearProgressWithLabel value={progress} />
              </div>)
             : <></>)}
        </Flex>
        <br />
        <Flex>
          <Bold>Contribution Progress:&nbsp;</Bold>
          {` ${(c.complete===undefined) ? '-' : c.complete } completed. 
            ${(c.waiting===undefined) ? '-' : c.waiting} waiting.
            Target: ${c.minParticipants} `}
        </Flex>
      </CeremonyContainer>
    );
  };
  
  export default CeremonySummary;
