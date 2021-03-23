import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import * as React from 'react';
import { H3Title, HighlightBodyText, NormalBodyText, SubtleBody } from '../styles';

const Section = styled.div`
  margin-bottom: 32px;
`;

const paragraph = styled.div`
  margin-bottom: 16px;
`;

export default function About(props: any) {
  let body = (<></>);

  if (props.isParticipant) {
    body = (
      <div>
        <Typography variant='h5' id="simple-modal-title">About the trusted setup</Typography>
        <Typography variant='body1' id="simple-modal-description">
          Welcome to the trusted setup ceremony. This page will show the ceremonies that have been set up to collect contributions 
          as well as allowing you to contribute to these ceremonies. 
        </Typography>
        <Typography variant='h6'>What's a trusted setup?</Typography>
        <Typography variant='body1'>Zero-knowledge proofs are utilised in some decentralized applications as they provide security guarantees required by
        the application. A Trusted Setup is a part of the preparation for some zero-knowledge proofs. A ceremony consists of collection successive 
        contributions from a number of participants. Each participant performs a computation that combines some unique secret data with the ceremony data and the previous
        contributions. 
        <p /> 
        Now, a trusted setup computation, if it were done by the application developers, would function perfectly well, but it would open 
        up the possibility of interference with the proofs, which would reduce the security of the application. So, trusted setups are performed 
        by community contributors such as you. It only takes one contributor to provide a truly private contribution for the proof to 
        be secure against interference. 
        <p />
        Your contribution will help ensure the security of the application.  
        </Typography>
        <Typography variant='h6'>How to contribute</Typography>
        <Typography variant='body1'>Your initial view will be a list of ceremonies, each with some brief summary details. Click on the 'PARTICIPATE' tab if you wish to 
        contribute your computation. Here you will see a 'LAUNCH' button. Click this when you are ready to start. All subsequent steps will automatically run 
        without further interaction.
        <p />
        Once the 'LAUNCH' button is clicked, a ceremony will be found for you to contribute to. If other participants are already waiting to contribute to the ceremony, you 
        will join the queue. Once your turn arrives, the computation will begin. The computation takes place in three stages: download, compute, and upload. Once these are
        complete, another ceremony will be sought, and, if found, the process will repeat.

        </Typography>
      </div>
    );
  } else {
    // Observer
    body = (
      <div>
        <Section>
          <H3Title>Why a trusted setup?</H3Title>
          <NormalBodyText>
            Zkopru relies on a number of different zk-SNARKs
            and each requires a trusted setup which ensures that
            no one is able to fake proofs and steal user funds or
            compromise privacy. The setup is performed in such a way
            that, to fake a proof, an attacker must compromise every
            single participant of the ceremony. Therefore, the security
            goes up with the number of participants.
          </NormalBodyText>
        </Section>
        <Section>
          <H3Title>How exactly does the setup work?</H3Title>
          <NormalBodyText>
          Our trusted setup is done in 2 steps. The first step 
          is already done and is called Perpetual Powers of Tau. 
          It’s an ongoing effort led by Wei Jie of the Ethereum 
          Foundation and the basis for many other ceremonies 
          such as tornado.cash and Hermez. The second step is 
          called Phase 2 and is circuit-specific, so it should 
          be done separately for each different SNARK. Our 
          phase 2 is based on the [!insertNumber!]th 
          contribution [!insertLink!] to Perpetual Powers of Tau ceremony.
          </NormalBodyText>
        </Section>
        <Section>
          <H3Title>How to contribute</H3Title>
          <NormalBodyText>
          Simply log in with your Github account and launch a ceremony. 
          When your ceremony is complete, tweet about your participation! 
          Spread the word and help make Zkopru even more secure.
          </NormalBodyText>
          <br />
          <br />
          <HighlightBodyText>
          DO NOT CLOSE OR REFRESH THE SITE while the ceremony is running. 
          </HighlightBodyText>
          <SubtleBody>
          Your contribution will be aborted and you will lose your opportunity
          to contribute. Opening new browser tabs is ok. 
          </SubtleBody>
          <br /><br />
          <HighlightBodyText>
          You can only participate once with your Github account.
          </HighlightBodyText>
        </Section>
        <Section>
          <H3Title>What to expect</H3Title>
          <NormalBodyText>
          Each circuit can only have one contributor at any given time.
          You may or may not be placed in a que to contribute to any of the 16 circuits. 
          <br /><br />
          You will be notified when you are actively contributing or waiting. 
          Once you have contributed to all 16 circuits you will see a link
          to a gist showing your contributions and their hashes.
          </NormalBodyText>
        </Section>
        <Section>
          <H3Title>Verifying you contribution</H3Title>
          <NormalBodyText>
          After your participation you will be presented with a contribution
          hash. Please copy and paste it to a document you save on your computer.
          You will be able to use it to verify that your contribution was
          used by the next participant once we upload the complete contribution 
          transcript to our website, _______.
          <br /><br />
          Follow us on Twitter @_____ or Telegram @____ to be updated when
          that document becomes available. 
          </NormalBodyText>    
        </Section>
      </div>
    );
  }

  return body;
}
  