import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import { ReactNode } from "react";
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../../styles";

const TabLink = styled.span`
  ${(props: { selected: boolean }) => {
    return css`
      text-decoration: ${props.selected ? "underline" : "none"};
      cursor: pointer;
      color: ${props.selected ? "black" : accentColor};
      background-color: ${props.selected ? accentColor : "unset"};
      margin-right: 16px;

      &:hover {
        background-color: ${secondAccent};
        color: ${textColor};
      }
    `;
  }}
`;

const CeremonyContainer = styled.div`
  background-color: ${lighterBackground};
  margin: 10px;
  width: 512px;
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border: 2px solid ${secondAccent};
  }
`;

const LandingPageTitle = styled.div`
  font-size: 50pt;
  margin-bottom: 32px;
  font-weight: bold;
  color: ${accentColor};
  cursor: pointer;
  user-select: none;
`;

export const LandingPage = () => {
  console.log("LandingPage");

  return (
    <PageContainer>
      <ZKTitle>zkparty</ZKTitle>

      <Tabs titles={["Participants", "Coordinators", "About"]}>
        {[
          <ParticipantsSection key="participants" />,
          <CoordinatorsSection key="coordinators" />,
          <AboutSection key="about" />
        ]}
      </Tabs>
    </PageContainer>
  );
};

const Tabs = (props: { children: ReactNode[]; titles: string[] }) => {
  const [selectedTitleIndex, updateIndex] = useState(0);

  return (
    <>
      <div>
        {props.titles.map((title, i) => (
          <span key={title} onClick={() => updateIndex(i)}>
            <TabLink selected={i === selectedTitleIndex}>{title}</TabLink>
          </span>
        ))}
      </div>

      <SectionContainer>{props.children[selectedTitleIndex]}</SectionContainer>
    </>
  );
};

const ParticipantsSection = () => {
  const [ceremonies, setCeremonies] = useState([]);
  console.log("ParticipantSection");

  useEffect(() => {
    fetch("http://zkparty.io/api/ceremonies")
      .then(response => {
        return response.json();
      })
      .then(json => {
        console.log(json);
        setCeremonies(json);
      });
  }, []);

  return (
    <>
      {ceremonies.map((c, i) => (
        <CeremonySummary key={i} ceremony={c} />
      ))}
    </>
  );
};

const CoordinatorsSection = () => {
  return (
    <div>
      Welcome to zkparty. <br />
      <Link to="/register">register</Link>
    </div>
  );
};

const AboutSection = () => {
  return <div>this is the about</div>;
};

const CeremonySummary = (props: { ceremony } & RouteProps) => {
  const c = props.ceremony;

  let history = useHistory();

  const onClick = () => {
    history.push(`/ceremony/${c.id}`);
  };

  return (
    <CeremonyContainer onClick={onClick}>
      <CeremonyTitle>{c.name}</CeremonyTitle>
      {c.description}
    </CeremonyContainer>
  );
};

class ZKTitle extends React.Component {
  readonly refreshInterval = 1000 / 12;
  readonly secondsOfLit = 0.5;
  private interval = null;

  state = {
    actualText: "zkparty"
  };

  onClick = () => {
    if (this.interval == null) {
      this.interval = setInterval(() => {
        this.setState({
          actualText: this.getRandomText()
        });
      }, this.refreshInterval);

      setTimeout(() => {
        clearInterval(this.interval);
        this.interval = null;

        if (Math.random() < 0.3) {
          this.setState({
            actualText: "zkparty"
          });
        }
      }, this.secondsOfLit * 1000);
    }
  };

  getRandomText() {
    let result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < "zkparty".length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }

    return result;
  }

  render() {
    return (
      <LandingPageTitle onClick={this.onClick}>
        {this.state.actualText}
      </LandingPageTitle>
    );
  }
}
