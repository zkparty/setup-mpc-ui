import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import * as React from 'react';
import { accentColor, H3Title, HighlightBodyText, NormalBodyText, SubtleBody, subtleText } from '../styles';

const Section = styled.div`
  margin-bottom: 32px;
`;

const paragraph = styled.div`
  margin-bottom: 16px;
`;

const StyledLink = styled.a`
  color: ${subtleText};
`;

const expectSection = (
  <NormalBodyText>
  Each circuit can only have one contributor at any given time.
  You may or may not be placed in a queue to contribute to any of the 16 circuits. 
  <br /><br />
  You will be notified when you are actively contributing or waiting. 
  Once you have contributed to all 16 circuits you will see a link
  to a gist showing your contributions and their hashes.
  </NormalBodyText>
);

const verifySection = (
  <Section>
    <H3Title>Verifying you contribution</H3Title>
    <NormalBodyText>
    After your participation you will be presented with a contribution
    hash. Please copy and paste it to a document you save on your computer.
    You will be able to use it to verify that your contribution was
    used by the next participant once we upload the complete contribution 
    transcript to our <StyledLink href='https://zkopru.network' target='_blank'>website</StyledLink>.
    <br /><br />
    Join us in <StyledLink href='https://t.me/zkopru' target='_blank'>Telegram</StyledLink> to be updated when
    that document becomes available. 
    </NormalBodyText>    
  </Section>
);

const howItWorksSection = (
  <Section>
    <H3Title>How exactly does the setup work?</H3Title>
    <NormalBodyText>
    Our trusted setup is done in 2 steps. The first step 
    is already done and is called Perpetual Powers of Tau. 
    It’s an ongoing effort led by Wei Jie of the Ethereum 
    Foundation and the basis for many other ceremonies 
    such as tornado.cash and Hermez. The second step is 
    called Phase 2 and is circuit-specific, so it is 
    done separately for each different SNARK circuit. Our 
    phase 2 is based on the [!insertNumber!]th 
    contribution [!insertLink!] to Perpetual Powers of Tau ceremony.
    </NormalBodyText>
  </Section>
);

const whySection = (
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
);

export default function About(props: any) {
  let body = (<></>);

  if (props.isParticipant) {
    body = (
      <div>
        <H3Title style={{ color: accentColor }}>Important!</H3Title>
        <Section>
          <HighlightBodyText>
            DO NOT CLOSE OR REFRESH THE SITE while the ceremony is running. 
          </HighlightBodyText>
          <SubtleBody>
          Your contribution and your opportunity to contribute will be lost. 
           Opening new browser tabs will not interrupt your contribution. 
          </SubtleBody>
          <br /><br />
          <HighlightBodyText>
          You can only participate once with your Github account.
          </HighlightBodyText>
          <SubtleBody>
            Do not lose your opportunity by accidentally leaving this page.
          </SubtleBody>
          <br /><br />
          <HighlightBodyText>
            Tweet about your participation!
          </HighlightBodyText>
          <SubtleBody>
            When your ceremony is complete, use our twitter link to 
            spread the word and help make Zkopru even more secure!
          </SubtleBody>
        </Section>
        <Section>
          <H3Title>What to expect while contributing</H3Title>
          {expectSection}
        </Section>
        {verifySection}
        {howItWorksSection}
        {whySection}
      </div>
    );
  } else {
    // Observer
    body = (
      <div>
        {whySection}
        {howItWorksSection}
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
          {expectSection}
        </Section>
        {verifySection}
      </div>
    );
  }

  return body;
}
  