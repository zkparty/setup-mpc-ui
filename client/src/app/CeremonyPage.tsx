import { Link, RouteProps, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import * as React from "react";
import styled from "styled-components";
import { ReactNode } from "react";
import {
  textColor,
  lighterBackground,
  accentColor,
  PageContainer,
  secondAccent,
  CeremonyTitle,
  Center
} from "../styles";
import { Ceremony, Participant } from "../types/ceremony";
import { getCeremonyData, getCeremonyDataCached } from "../api/ZKPartyApi";

const CeremonyDetailsTable = styled.table`
  text-align: right;
  font-size: 11pt;
  width: 100%;

  td {
    padding-left: 10px;
  }
`;

const HomeLinkContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;

  a {
    color: ${accentColor};

    &:hover {
      color: ${textColor};
      background-color: ${secondAccent};
    }
  }
`;

const TableCell = styled.span`
  padding: 2px 5px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableHeader = styled.span`
  display: inline-block;
  color: "white";
`;
//  color: ${props => props.accentColor};

const NotFoundContainer = styled.div`
  width: 512px;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
  text-align: center;
`;

const CeremonyDetailsContainer = styled.div`
  width: 512px;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
`;

const CeremonyDetailsSubSection = styled.div`
  width: 100%;
  display: inline-block;
  padding: 16px;
  box-sizing: border-box;
`;

export const CeremonyPage = () => {
  let { id } = useParams();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [ceremony, setCeremony] = useState<null | Ceremony>(null);

  const refreshCeremony = () => {
    getCeremonyData(id)
      .then(ceremony => {
        setCeremony(ceremony);
      })
      .catch(err => {
        console.error(`error getting ceremony: ${err}`);
      });
  };

  useEffect(() => {
    getCeremonyDataCached(id)
      .then(ceremonyData => {
        setCeremony(ceremonyData);
        setLoaded(true);
        refreshCeremony();
        // TODO: clear interval with returned function for useEffect
        setInterval(refreshCeremony, 15000);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [loaded]);

  return (
    <>
      <HomeLinkContainer>
        <Link to="/">home</Link>
      </HomeLinkContainer>
      {ceremony ? (
        <PageContainer>
          <br />
          <CeremonyDetails ceremony={ceremony}></CeremonyDetails>
          <br />
          <ParticipantTable
            participants={ceremony.participants ? ceremony.participants : []}
            headers={[
              { title: "connection", width: "100px" },
              { title: "address", width: "400px" },
              { title: "status", width: "100px" }
            ]}
            cols={[
              p => (p.online ? "online" : "offline"),
              p => p.address,
              participantStatusString
            ]}
          />
        </PageContainer>
      ) : (
        <PageContainer>
          <br />
          <NotFoundContainer>
            {loaded ? "Ceremony not found." : "Loading..."}
          </NotFoundContainer>
        </PageContainer>
      )}
    </>
  );
};

const CeremonyDetails = (props: { ceremony: Ceremony }) => {
  return (
    <CeremonyDetailsContainer>
      <CeremonyTitle>{props.ceremony.title}</CeremonyTitle>

      <CeremonyDetailsSubSection>
        <Center>
          <CeremonyDetailsTable>
            <tbody>
              <tr>
                <td>status</td>
                <td>{props.ceremony.ceremonyState}</td>
              </tr>
              <tr>
                <td>start time</td>
                <td>{props.ceremony.startTime.toLocaleString()}</td>
              </tr>
              <tr>
                <td>end time</td>
                <td>{props.ceremony.endTime.toLocaleString()}</td>
              </tr>
              <tr>
                <td>hompage</td>
                <td>
                  <a href={props.ceremony.homepage}>
                    {props.ceremony.homepage}
                  </a>
                </td>
              </tr>
              <tr>
                <td>github</td>
                <td>
                  <a href={props.ceremony.github}>{props.ceremony.github}</a>
                </td>
              </tr>
            </tbody>
          </CeremonyDetailsTable>
        </Center>
      </CeremonyDetailsSubSection>
      <CeremonyDetailsSubSection>
        {props.ceremony.description}
      </CeremonyDetailsSubSection>
    </CeremonyDetailsContainer>
  );
};

const participantStatusString = (participant: Participant) => {
  let statusString: string = participant.state;
  if (participant.state === "RUNNING" && participant.computeProgress < 1) {
    statusString = `RUNNING: ${Math.round(participant.computeProgress)}%`;
  } else if (
    participant.state === "RUNNING" &&
    participant.computeProgress === 1
  ) {
    statusString = "VERIFYING";
  }

  return statusString;
};
const ParticipantTable = (props: {
  participants: Participant[];
  headers: { title: string; width: string }[];
  cols: Array<(p: Participant) => ReactNode | null>;
}) => {
  return (
    <div>
      <br />
      {props.headers.map((header, i) => {
        return (
          <TableHeader key={i} style={{ width: header.width }}>
            {header.title}
          </TableHeader>
        );
      })}

      {props.participants.map((p, j) => {
        return (
          <div key={j}>
            {props.cols.map((col, i) => {
              return (
                <TableCell
                  style={{
                    width: props.headers[i].width,
                    maxWidth: props.headers[i].width,
                    overflow: "hidden",
                    textOverflow: "ellipses",
                    display: "inline-block",
                    zIndex: 100,
                    position: "relative"
                  }}
                  key={i}
                >
                  {col(p) + ""}
                </TableCell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
