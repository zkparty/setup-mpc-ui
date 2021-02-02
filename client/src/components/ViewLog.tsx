import { Typography } from '@material-ui/core';
import * as React from 'react';
import ContentModal from './ContentModal';

export default function ViewLog(props: any) {

    return (
        <ContentModal
            open={props.open}
            close={props.close}
            body={(<Typography variant='body1' >
                {props.content}
            </Typography>)}
        />
    )
}