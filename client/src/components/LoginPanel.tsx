import { useState } from "react";
import env from '../env';
import Login from './Login';
import { WelcomeTitle, SubtleBody, NormalBodyText } from "../styles";

export default function LoginPanel(props: any) {

  const [title, setTitle] = useState(env.projectName);
  let [intervalTime, setIntervalTime] = useState(0);

  const onClick = () => {
    if (intervalTime === 0) {
      const newIntervalTime = setInterval(() => {
        setTitle(getRandomText());
      }, 1000 / 12);
      setIntervalTime(newIntervalTime);

      setTimeout(() => {
        clearInterval(newIntervalTime);
        setIntervalTime(0);
        if (Math.random() < 0.3) {
          setTitle(env.projectName);
        }
      }, 500);
    }
  };

  const getRandomText = () => {
    let result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < title.length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  }

  let content = [
    <WelcomeTitle key="title" onClick={onClick}>{title}</WelcomeTitle>,
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
