import React, { FC, PropsWithChildren, useContext } from 'react';
import { withStyles, makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  accentColor,
  lighterBackground,
  secondAccent,
  textColor,
} from "../styles";
import { Card, CardContent, CardHeader, Typography, Divider } from '@material-ui/core';
import { ContributionState } from '../types/ceremony';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
    root: {
      borderRadius: 12,
      minWidth: 256,
      textAlign: 'center',
      backgroundColor: lighterBackground,
      color: accentColor,
    },
    header: {
      textAlign: 'center',
      spacing: 10,
    },
}));

const timeLeft = (expectedTime: any) => {
    if (expectedTime) {
        return moment(expectedTime).endOf('minute').fromNow();
    } else {
        return '-';
    }
}

const QueueProgress: FC<ContributionState> = (props) => {
    const classes = useStyles();
    const { ceremony, queueIndex, currentIndex, expectedStartTime, averageSecondsPerContribution} = props;

    const expectedTimeLeft = timeLeft(expectedStartTime);
    return (
        <Card className={classes.root}>
            <CardHeader title={ceremony.title} className={classes.header} />
            <Divider variant="middle" />
            <CardContent>
                <Typography variant="h5" align="center">
                You are contributor number {queueIndex}
                </Typography>
                <Typography variant="h5" align="center">
                Number {currentIndex} is currently contributing
                </Typography>
                <Divider variant="middle" />
                <Typography align="center">
                    Your contribution will be requested {expectedTimeLeft}
                </Typography>
                <Typography align="center">
                    The computation is estimated to take {averageSecondsPerContribution} seconds
                </Typography>
            </CardContent>
            <Divider variant="middle" />
        </Card>
    );
};

export default QueueProgress;