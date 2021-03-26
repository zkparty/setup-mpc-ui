import * as React from 'react';
import { useContext } from 'react';
import {
  AuthButton,
  WelcomeTitle,
  SubtleBody,
} from "../styles";
import { ComputeDispatchContext } from '../state/ComputeStateManager';


const Acknowledge = ({ contribute }: { contribute: () => void}) =>
  (<div style={{ display: 'grid', marginTop: '78px' }}>
    <AuthButton onClick={contribute}>
      Launch Ceremony
    </AuthButton>
   </div>);

export default function WelcomePanel(props: any) {
  const dispatch = useContext(ComputeDispatchContext);
  const handleClick = () => {
    if (dispatch) dispatch({type: 'ACKNOWLEDGE' });
  }

  return (
  <div style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
    <WelcomeTitle>Welcome.</WelcomeTitle>
    <div style={{ height: '41px' }} />
    <SubtleBody>
      {`Thank you for joining us for our trusted setup ceremony!`}
    </SubtleBody>
    <SubtleBody>
      {`Ready to make your contribution?`}
    </SubtleBody>
    <Acknowledge contribute={handleClick} />
  </div>);
}
