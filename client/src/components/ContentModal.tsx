import { Modal } from '@material-ui/core';
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

export default function ContentModal(props: {open: boolean, close: ()=>void, body:JSX.Element}) {
    const classes = useStyles();

    return (
        <Modal
            open={props.open}
            onClose={props.close}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            style={{ overflow: 'scroll' }}
        >
          <div style={getModalStyle()} className={classes.paper}>
          {props.body}
          </div>
        </Modal>
    );
}
  