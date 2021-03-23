import { Typography } from '@material-ui/core';
import * as React from 'react';
import ContentModal from './ContentModal';

export default function ViewLog(props: 
    {open: boolean, close: ()=>void, content: string | JSX.Element, title?: string }) {

    let body = (<></>);
    if (typeof props.content === 'string') {
        const lines: string[] = props.content.split('\n');
        const temp = lines.map(v => 
            (<p style={{ 
                marginBlockStart: '0em', 
                marginBlockEnd: '0em' }}>
            {v}</p>));
        body = (
            <Typography variant='body1' >
                {temp}
            </Typography>);
    } else {
        // JSX.Element
        body = props.content;
    }

    return (
        <ContentModal
            open={props.open}
            close={props.close}
            title={props.title}
            body={body}
        />
    )
}