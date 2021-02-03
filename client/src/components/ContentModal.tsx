import { Dialog, DialogContent, DialogProps, DialogTitle } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';

function getModalStyle() {
    const top = 10;
    const left = 30;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-20%, -5%)`,
    };
  }
  
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      paper: {
        position: 'absolute',
        //width: 600,
        backgroundColor: 'black',
        border: '2px solid #fff',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
      },
    }),
  );

export default function ContentModal(props: 
  {open: boolean, close: ()=>void, title?: string, body:JSX.Element}) {
    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.close}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            maxWidth='lg'
            scroll='body'
            style={getModalStyle()} 
            className={classes.paper}
        >
          <DialogTitle id='scroll-dialog-title'>{props.title}</DialogTitle>
          <DialogContent dividers={true}  >
            {props.body}
          </DialogContent>
        </Dialog>
    );
}
  