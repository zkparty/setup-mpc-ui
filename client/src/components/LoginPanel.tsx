import { useState, useEffect } from "react";
import {
  WelcomeTitle,
  SubtleBody,
  NormalBodyText,
} from "../styles";
import Login from './Login';
import env from '../env';

export default function LoginPanel(props: any) {

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const updateWindowDimensions = () => {
    setWindowWidth(window.innerWidth);
  }

  useEffect(() => {
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.addEventListener('resize', updateWindowDimensions);
  }, []);

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px'
    }} >
    <WelcomeTitle>{env.projectName}</WelcomeTitle>
    <div style={{ height: '41px' }} />
    <SubtleBody style={{ textAlign: 'center' }}>
      {`Trusted Setup Ceremony`}
    </SubtleBody>
    <NormalBodyText style={{ display: windowWidth < 1023 ? '' : 'none', textAlign: 'center', marginTop: '8px' }}>
      {`The ceremony has to be performed in desktop due to computation constrains. Please open this website on a desktop browser`}
    </NormalBodyText>
    <NormalBodyText style={{ display: windowWidth > 1023 ? '' : 'none', textAlign: 'center', marginTop: '8px' }}>
      {`Participate using your Ethereum wallet (preferred) or using your Github account`}
    </NormalBodyText>
    <div style={{ display: windowWidth > 1023 ? '' : 'none', }} >
      <Login/>
    </div>
  </div>);
}
