import { Typography } from '@material-ui/core';
import * as React from 'react';
import ContentModal from './ContentModal';

export default function ViewLog(props: 
    {open: boolean, close: ()=>void, content: string, title?: string }) {

    const lines: string[] = props.content.split('\n');
    const body = lines.map(v => (<p style={{ marginBlockStart: '0em', marginBlockEnd: '0em' }}>{v}</p>));

    return (
        <ContentModal
            open={props.open}
            close={props.close}
            title={props.title}
            body={(<Typography variant='body1' >
                {body}
            </Typography>)}
        />
    )
}