import {
  WelcomeTitle,
  SubtleBody,
  NormalBodyText,
} from "../styles";
import Login from './Login';
import env from '../env';

export default function LoginPanel(props: any) {

  let content = [
    <WelcomeTitle key="title">{env.projectName}</WelcomeTitle>,
    <SubtleBody key="subtitle" style={{ textAlign: 'center' }}>
      {`Trusted Setup Ceremony`}
    </SubtleBody>
  ];
  // mobile
  if (window.innerWidth < 1023){
    content.push(
      <NormalBodyText key="mobile" style={{ textAlign: 'center', marginTop: '8px' }}>
        {`The ceremony has to be performed in desktop due to computation constrains. Please open this website on a desktop browser`}
      </NormalBodyText>);
  // desktop
  } else {
    content.push(
      <NormalBodyText key="desktop" style={{ display: window.innerWidth >= 1023 ? '' : 'none', textAlign: 'center', marginTop: '8px' }}>
        {`Participate using your Ethereum wallet (preferred) or using your Github account`}
      </NormalBodyText>,
      <Login key="login"/>);
  }

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px'
    }} >
    {content}
  </div>);
}
