import { Button, Modal, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import { Dispatch, useContext } from 'react';
import { resetContributions } from '../api/FirestoreApi';
import { AuthStateContext } from '../state/AuthContext';
import { ComputeDispatchContext, Step } from '../state/ComputeStateManager';
import { accentColor } from '../styles';

require('dotenv').config();

const allowReset = true; // process.env.ALLOW_RESET || true;

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

const resetContribs = (participantId: string, onClose: () => void, dispatch?: Dispatch<any> ) => {
    resetContributions(participantId);
    if (dispatch) dispatch({ type: 'SET_STEP', data: Step.NOT_ACKNOWLEDGED });
    onClose();
};

export default function Options(props: any) {
    const classes = useStyles();
    const dispatch = useContext(ComputeDispatchContext);

    const resetButton = (participantId: string): any => {
        let button;
        if (allowReset && participantId) {
            button = (<Button 
                variant='outlined'
                onClick={() => {
                    resetContribs(participantId, props.close, dispatch )
                }}
                style={{ color: accentColor }}
            >
                    Reset Contributions
                </Button>);
        } else {
            button = (<></>);
        }

        return (
            <div style={getModalStyle()} className={classes.paper}>
                {button}
            </div>
        );
    }

    return (
        <AuthStateContext.Consumer>
          {Auth => {
              return (
            <Modal
                open={props.open}
                onClose={props.close}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {resetButton(Auth.authUser?.uid)}
            </Modal>
        )}}
        </AuthStateContext.Consumer>);
}