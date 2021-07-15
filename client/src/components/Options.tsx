import { Button, Checkbox, FormControlLabel, FormGroup, Modal, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { composeClasses } from '@material-ui/data-grid';
import { PlayCircleFilledWhite } from '@material-ui/icons';
import * as React from 'react';
import { Dispatch, useContext } from 'react';
import { resetContributions } from '../api/FirestoreApi';
import { AuthContextInterface, AuthDispatchContext, AuthStateContext } from '../state/AuthContext';
import { ComputeDispatchContext, Step } from '../state/ComputeStateManager';
import { accentColor, subtleText } from '../styles';
import env from '../env';

const allowReset = env.allowReset || true;

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
};
  
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
        checkbox: {
            color: 'white',
        },
        'checkbox:disabled': {
            color: 'white',
            opacity: 0.5,
        }
    }),
);

const resetContribs = (participantId: string, onClose: () => void, dispatch?: Dispatch<any> ) => {
    resetContributions(participantId);
    if (dispatch) dispatch({ type: 'SET_STEP', data: Step.NOT_ACKNOWLEDGED });
    onClose();
};

const resetButton = (participantId: string, close: ()=>void, dispatch: React.Dispatch<any> | undefined, classes: any): any => {
    let button;
    if (allowReset && participantId) {
        button = (<Button 
            variant='outlined'
            onClick={() => {
                resetContribs(participantId, close, dispatch )
            }}
            style={{ color: accentColor }}
        >Reset Contributions
            </Button>);
    } else {
        button = (<></>);
    }

    return button;
}

export default function Options(props: any) {
    const classes = useStyles();
    const dispatch = useContext(ComputeDispatchContext);
    const authState = useContext(AuthStateContext);
    const authDispatch = useContext(AuthDispatchContext);

    const { authUser, manualAttestation } = authState;

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (authDispatch) {
            authDispatch({ type: 'MANUAL_ATTESTATION',  option: event.target.checked });
        }
    };
    
    const manualAttest = (
        <div>
            <FormGroup row>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={manualAttestation}
                            onChange={handleOptionChange}
                            name="attest"
                            disabled={authState.isLoggedIn}
                            className={classes.checkbox}
                        />
                    }
                    label="Manual attestation"
                    classes={{
                        root: classes.checkbox,
                        disabled: classes['checkbox:disabled'],
                    }}
                    style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}
                />
            </FormGroup>
        </div>
    );

    return (
            <Modal
                open={props.open}
                onClose={props.close}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={getModalStyle()} className={classes.paper}>
                    {manualAttest}                    
                    <br />
                    {resetButton(authUser?.uid, props.close, dispatch, classes)}
                </div>
            </Modal>
    );
}