import { Button, Dialog, DialogContent, DialogProps, DialogTitle } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { NONAME } from 'dns';
import * as React from 'react';
import { background, darkerBackground, inverseText, lightBorder, textColor } from '../styles';

function getModalStyle() {
  const top = 0;
  const left = 0;

  return {
    top: `${top}%`,
    left: `${left}%`,
    height: '100%',
    width: '100%',
    //transform: `translate(-20%, -5%)`,
    backgroundColor: background,
    opacity: '0.8',
  };
}
  
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      position: 'absolute',
      //width: 600,
      backgroundColor: darkerBackground,
      border: `2px solid ${textColor}`,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    backDrop: {
      position: 'fixed', /* Stay in place */
      //zIndex: -1, /* Sit on top */
      left: 0,
      top: 0,
      width: '100%', /* Full width */
      height: '100%', /* Full height */
      overflow: 'auto', /* Enable scroll if needed */
      /*backgroundColor: rgb(0,0,0), /* Fallback color */
      /*backgroundColor: background,*/
      backgroundColor: 'rgba(14,41,54,0.8)', /* Black w/ opacity */
      /* opacity: '0.8',*/
    }
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
          scroll='paper'
          /*fullScreen={true}*/
          style={getModalStyle()} 
          className={classes.paper}
          BackdropProps={{ classes: { root: classes.backDrop } }}
      >
        <div style={{ position: 'fixed', top: 0, right: 0 }}>
          <Button onClick={props.close} style={{ color: textColor }}>
            <CloseIcon />
          </Button>
        </div>
        <DialogTitle id='scroll-dialog-title' 
          style={{ color: textColor, backgroundColor: darkerBackground }}>
          {props.title}
        </DialogTitle>
        <DialogContent dividers={true} 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            color: textColor,
            backgroundColor: background,
            border: `1px solid ${lightBorder}`,
            boxSizing: 'border-box',
            }}>
          {props.body}
        </DialogContent>
      </Dialog>
    );
}
  