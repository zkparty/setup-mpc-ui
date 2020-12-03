import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: 400,
      maxWidth: 300,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

export const addMessage = (msg: string) => {
    const [messages, setMessages] = React.useState<string[]>([]);
    const newMessages = messages;
    newMessages.push(msg);
    setMessages(newMessages);
}

export const clearMessages = () => {
    const [messages, setMessages] = React.useState<string[]>([]);
    setMessages([]);
}

function renderRow(props: ListChildComponentProps) {
  const { index, style } = props;
  const [messages, ] = React.useState<string[]>([]);

  return (
    <ListItem button style={style} key={index}>
      <ListItemText primary={`${messages[index]}`} />
    </ListItem>
  );
}

export default function VirtualizedList() {
  const classes = useStyles();
  const [messages, ] = React.useState<string[]>([]);

  return (
    <div className={classes.root}>
      <FixedSizeList height={400} width={300} itemSize={46} itemCount={messages.length}>
        {renderRow}
      </FixedSizeList>
    </div>
  );
}
