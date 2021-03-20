import { Box, Button, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { useState } from 'react';
import { CalendarIcon, LightningIcon, PopOutIcon, ScaleIcon, SecureIcon, StarIcon } from '../icons';
import { accentColor, darkerBackground, inverseText, lighterBackground, NormalBodyText, StyledButton, SubtleBody, subtleText } from '../styles';
import About from './About';
import ViewLog from './ViewLog';

const project = 'zkopru';

export default function AboutPanel(props: any) {
  const [modalOpen, setModalOpen] = useState(false);
  //const [modalContent, setModalContent] = useState('');

  const closeModal = () => {setModalOpen(false)};
  const openModal = () => {
    //setModalContent(`about zkopru ...`);
    setModalOpen(true);
  }

  const leftPanel = (
    <Grid container direction='column'>
      <Grid item>
        <Typography style={{ marginBottom: '40px', fontSize: '48px' }}>{`about ${project}`}</Typography>
      </Grid>
      <Grid item>
        <SubtleBody style={{ marginBottom: '121px' }}>
          [zk-optimistic-rollup]
        </SubtleBody>
      </Grid>
      <Grid item>
        <NormalBodyText style={{ wordWrap: 'break-word', marginBottom: '40px' }}>
          Zkopru is a novel layer-2 scaling solution that
          supports private transfers and private atomic
          swaps between ETH, ERC20, ERC721 at a low cost.
        </NormalBodyText>
      </Grid>
      <Grid>
        <StyledButton style={{ width: '217px', height: '53px', justifyContent: 'space-evenly' }}
          onClick={openModal}
        >
          Read More
          {PopOutIcon}
        </StyledButton>
      </Grid>
    </Grid>
  );

  const Feature = (props: any) => {
    return (
      <Grid item container direction='row' style={{ marginBottom: '42px' }}>
        <Grid item style={{ marginLeft: '50px', marginRight: '36px' }}>
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
        <Grid item style={{ 
            fontFamily: 'Inconsolata', 
            fontSize: '24px', 
            letterSpacing: '0.1em', 
            color: subtleText, 
            textTransform: 'uppercase',
            borderBottom: '1px',
            borderBottomColor: subtleText,
            paddingLeft: '41px',
            paddingRight: '51px',
            paddingTop: '37px',
          }}>
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
    <Box>
      <Grid container direction='row'>
        <Grid item style={{ width: '500px' }}>
          {leftPanel}
        </Grid>
        <Grid item style={{ width: '407px', left: '859px', background: darkerBackground, marginTop: '50px' }}>
          {featuresPanel}
        </Grid>
      </Grid>
        <ViewLog 
          open={modalOpen} 
          close={closeModal} 
          content={(<About />)} 
          title={`About the zkopru trusted setup`} />
    </Box>
  );
}