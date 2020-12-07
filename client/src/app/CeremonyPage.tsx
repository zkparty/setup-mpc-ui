import { Link, RouteProps, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import styled from "styled-components";
import { ReactNode } from "react";
import { DataGrid, ColDef, ValueGetterParams } from '@material-ui/data-grid';
import {
  textColor,
  lighterBackground,
  accentColor,
  PageContainer,
  secondAccent,
  CeremonyTitle,
  Center
} from "../styles";
import { Ceremony, Contribution, ContributionSummary, Participant } from "../types/ceremony";
import { ceremonyUpdateListener, contributionUpdateListener, getCeremony } from "../api/FirebaseApi";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core";
import moment from "moment";

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      // width: '100%',
      height: 600,
      maxWidth: 800,
      backgroundColor: lighterBackground,
      color: textColor,
      border: accentColor,
    },
    colCell: {
      color: 'white',
    },
    cell: {
      color: textColor,
    },
    footer: {
      color: textColor,
    },

    divider: {
      color: accentColor,
      padding: '20px',
    }
}));


const CeremonyDetailsTable = styled.table`
  text-align: right;
  font-size: 11pt;
  width: 100%;

  td {
    padding-left: 10px;
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

export const CeremonyPage = (props: {id: string}) => {
  let { id } = props;
  console.log(`have id ${id}`);

  const [loaded, setLoaded] = useState<boolean>(false);
  const [ceremony, setCeremony] = useState<null | Ceremony>(null);
  const [contributions, setContributions] = useState<ContributionSummary[]>([]);
  const ceremonyListenerUnsub = useRef<(() => void) | null>(null);
  const contributionListenerUnsub = useRef<(() => void) | null>(null);
  const loadingContributions = useRef(false);

  const refreshCeremony = async () => {
    const c = await getCeremony(id);
    if (c !== undefined) setCeremony(c);
  };

  const updateContribution = (doc: ContributionSummary, changeType: string, oldIndex?: number) => {
    // A contribution has been updated
    console.log(`contribution update: ${doc.queueIndex} ${changeType}`);
    let newContributions = contributions;
    switch (changeType) {
      case 'added': {
        newContributions.push(doc);
        break;
      }
      case 'modified': {
        if (oldIndex !== undefined) newContributions[oldIndex] = doc;
        break;
      }
      case 'removed': {
        if (oldIndex !== undefined) newContributions.splice(oldIndex, 1);
        break;
      }
    }
    setContributions(newContributions);
  }

  if (!loaded) {
    refreshCeremony()
      .then(() => setLoaded(true));
  }


  if (!ceremonyListenerUnsub.current) {
    // Start ceremony listener
    ceremonyUpdateListener(id, setCeremony)
        .then(unsub => ceremonyListenerUnsub.current = unsub);
  }

  if (!loadingContributions.current) {
    // Start contribution listener
    contributionUpdateListener(id, updateContribution)
        .then(unsub => contributionListenerUnsub.current = unsub);
    loadingContributions.current = true;
  }

  const gridRows = contributions.map(v => {
    return {
      ...v, 
      id: v.queueIndex,
      time: v.timeCompleted ? moment(v.timeCompleted).format() : '',

    }
  });

  return (
    <>
    { /* <HomeLinkContainer>
        <Link to="/">home</Link>
      </HomeLinkContainer>*/}
      {ceremony ? (
        <PageContainer>
          <br />
          <CeremonyDetails ceremony={ceremony}></CeremonyDetails>
          <br />
          <ContributionsGrid contributions={gridRows} />
          {/* <ParticipantTable
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
          /> */}
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

const columns: ColDef[] = [
  { field: 'queueIndex', headerName: 'Position', type: 'number', width: 30 },
  { field: 'timestamp', headerName: 'Time', type: 'timestamp', width: 130 },
  { field: 'status', headerName: 'Status', width: 120, sortable: false },
  { field: 'duration', headerName: 'Duration', type: 'number', width: 90, sortable: false },
  { field: 'hash', 
    headerName: 'Hash',
    description: 'The hash resulting from this contribution',
    sortable: false,
    width: 180,
    //valueGetter: (params: ValueGetterParams) =>
    //  `${params.getValue('hash')}`,
  },
];

const ContributionsGrid = (props: {contributions: any[]}) => {
  const classes = useStyles();
  return (
    <DataGrid 
      rows={props.contributions} 
      columns={columns} 
      pageSize={5} 
      className={classes.root} 
    />
  );
}
