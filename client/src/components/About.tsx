import { Modal, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }
  
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      paper: {
        position: 'absolute',
        width: 600,
        backgroundColor: 'black',
        border: '2px solid #fff',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
      },
    }),
  );

export default function About(props: any) {
    const classes = useStyles();

    const body = (
        <div style={getModalStyle()} className={classes.paper}>
          <Typography variant='h5' id="simple-modal-title">About the trusted setup</Typography>
          <Typography variant='body1' id="simple-modal-description">
            Welcome to the trusted setup ceremony. This page will show the ceremonies that have been set up to collect contributions 
            as well as allowing you to contribute to these ceremonies. 
          </Typography>
          <Typography variant='h6'>What's a trusted setup?</Typography>
          <Typography variant='body1'>Zero-knowledge proofs are utilised in some decentralized applications as they provide security guarantees required by
          the application. A Trusted Setup is a part of the preparation for some zero-knowledge proofs. A ceremony consists of collection successive 
          contributions from a number of participants. Each participant performs a computation that combines some unique secret data with the ceremony data and the previous
          contributions. 
          <p /> 
          Now, a trusted setup computation, if it were done by the application developers, would function perfectly well, but it would open 
          up the possibility of interference with the proofs, which would reduce the security of the application. So, trusted setups are performed 
          by community contributors such as you. It only takes one contributor to provide a truly private contribution for the proof to 
          be secure against interference. 
          <p />
          Your contribution will help ensure the security of the application.  
          </Typography>
          <Typography variant='h6'>How to contribute</Typography>
          <Typography variant='body1'>Your initial view will be a list of ceremonies, each with some brief summary details. Click on the 'PARTICIPATE' tab if you wish to 
          contribute your computation. Here you will see a 'LAUNCH' button. Click this when you are ready to start. All subsequent steps will automatically run 
          without further interaction.
          <p />
          Once the 'LAUNCH' button is clicked, a ceremony will be found for you to contribute to. If other participants are already waiting to contribute to the ceremony, you 
          will join the queue. Once your turn arrives, the computation will begin. The computation takes place in three stages: download, compute, and upload. Once these are
          complete, another ceremony will be sought, and, if found, the process will repeat.

          </Typography>

        </div>
      );

    return (
        <Modal
            open={props.open}
            onClose={props.close}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
        {body}
        </Modal>
    );
}
  