import * as React from 'react';
import { useContext, useState } from 'react';
import { CalendarIcon, LightningIcon, PopOutIcon, ScaleIcon, SecureIcon, StarIcon, } from '../icons';
import PoolIcon from '@material-ui/icons/Pool';
import { AuthStateContext } from '../state/AuthContext';
import { accentColor, darkerBackground, inverseText, lighterBackground, NormalBodyText, PanelTitle, StyledButton, SubtleBody, subtleText, AuthButton, AuthButtonText } from '../styles';
import About from './About';
import ViewLog from './ViewLog';
import { ComputeStateContext } from '../state/ComputeStateManager';

import env from '../env';

export default function AboutPanel(props: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const authState = useContext(AuthStateContext);
  const computeState = useContext(ComputeStateContext);

  const closeModal = () => {setModalOpen(false)};
  const openModal = () => {
    setModalOpen(true);
  }

  const { project } = computeState;

  const leftPanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '50px',
      marginBottom: '50px',
      marginRight: '8xp',
    }}>
      <PanelTitle>{`about ${project?.shortName || env.projectName}`}</PanelTitle>
      {  }
      <div style={{ display: 'flex' }}>
        <AuthButton
          onClick={openModal}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuthButtonText>
              Read More
            </AuthButtonText>
            <div style={{ width: '24px' }} />
            {PopOutIcon}
          </div>
        </AuthButton>
      </div>
    </div>
  )

  const Feature = (props: any) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '42px' }}>
        <div>{props.icon}</div>
        <div style={{ width: '36px' }} />
        <div>{props.children}</div>
      </div>
    )
  }

  const aboutModal = (modalOpen) ?
    <ViewLog
      open={modalOpen}
      close={closeModal}
      content={(<About isParticipant={authState.isLoggedIn} />)}
      title={`About the ${project?.shortName || env.projectName} trusted setup`} />
  :
    (<></>);

  return (
    <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
      {leftPanel}
      <div style={{ flex: 1, height: '1px', minWidth: '0px', maxWidth: '264px' }} />
      {aboutModal}
    </div>
  );
}
