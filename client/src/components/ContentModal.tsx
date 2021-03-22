import { Button, Dialog,  DialogProps, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import * as React from 'react';
import { background, darkerBackground, inverseText, lightBorder, textColor } from '../styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

function getModalStyle() {
  const top = 0;
  const left = 0;

  return {
    top: `${top}%`,
    left: `${left}%`,
    height: '100%',
    width: '100%',
    backgroundColor: background,
    opacity: '0.8',
  };
}
  
const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    paper: {
      position: 'absolute',
      transform: `translate(-20%, -5%)`,
      top: '30%',
      left: '20%',
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
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: textColor,
    },
    title: {
      color: textColor,
      backgroundColor: darkerBackground,
    }
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.title} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex', 
    justifyContent: 'center', 
    color: textColor,
    backgroundColor: background,
    border: `1px solid ${lightBorder}`,
    boxSizing: 'border-box',
},
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function ContentModal(props: 
  {open: boolean, close: ()=>void, title?: string, body:JSX.Element}) {
    //const classes = useStyles(styles);

    return (
      <Dialog
          open={props.open}
          onClose={props.close}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          maxWidth='lg'
          scroll='paper'
          /*fullScreen={true}*/
          /*style={getModalStyle()} 
          className={classes.paper}
          BackdropProps={{ classes: { root: classes.backDrop } }}*/
      >
      {/*  <div style={{ position: 'fixed', top: 0, right: 0 }}>
          <Button onClick={props.close} style={{ color: textColor }}>
            <CloseIcon />
          </Button>
    </div> */}
        <DialogTitle id='scroll-dialog-title' onClose={props.close} >
          {props.title}
        </DialogTitle>
        <DialogContent dividers={true} >
          {props.body}
        </DialogContent>
        <DialogActions>

        </DialogActions>
      </Dialog>
    );
}
  