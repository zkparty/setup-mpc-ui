import { Box, Button, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { CalendarIcon, LightningIcon, PopOutIcon, ScaleIcon, SecureIcon, StarIcon } from '../icons';
import { accentColor, inverseText, NormalBodyText, SubtleBody } from '../styles';

const project = 'zkopru';

export default function AboutPanel(props: any) {
    const leftPanel = (
      <Grid container direction='column'>
        <Grid item>
          <Typography>{`About ${project}`}</Typography>
        </Grid>
        <Grid item>
          <SubtleBody>
            [zk-optimistic-rollup]
          </SubtleBody>
        </Grid>
        <Grid item>
          <NormalBodyText style={{ wordWrap: 'break-word' }}>
            Zkopru is a novel layer-2 scaling solution that
            supports private transfers and private atomic
            swaps between ETH, ERC20, ERC721 at a low cost.
          </NormalBodyText>
        </Grid>
        <Grid>
          <Button style={{ backgroundColor: accentColor, color: inverseText }}>
            Read More
            {PopOutIcon}
          </Button>
        </Grid>
      </Grid>
    );

    const Feature = (props: any) => {
      return (
        <Grid item container direction='row' >
          <Grid item>
            {props.icon}
          </Grid>
          <Grid item>
            {props.children}
          </Grid>
        </Grid>
      );
    }

    const featuresPanel = (
      <Box>
        <Grid container direction='column' >
          <Grid item>
            Features
          </Grid>
          <Feature icon={SecureIcon}>zkSNARK Privacy</Feature>
          <Feature icon={ScaleIcon}>Optimistic Rollup Scaling</Feature>
          <Feature icon={StarIcon}>Compliance Compatibility</Feature>
          <Feature icon={LightningIcon}>Instant Withdrawals</Feature>
          <Feature icon={CalendarIcon}>Pay in Advance</Feature>
        </Grid>
      </Box>
    );

    return (
      <Grid container direction='row'>
        <Grid item style={{ width: '500px' }}>
          {leftPanel}
        </Grid>
        <Grid item style={{ width: '407px', left: '859px' }}>
          {featuresPanel}
        </Grid>
      </Grid>
    );
}