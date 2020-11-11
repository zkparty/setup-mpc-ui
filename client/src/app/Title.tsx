import * as React from "react";
import styled from "styled-components";
import {
  accentColor,
} from "../styles";

const LandingPageTitle = styled.div`
  font-size: 50pt;
  margin-bottom: 32px;
  font-weight: bold;
  color: ${accentColor};
  cursor: pointer;
  user-select: none;
`;

const TITLE_TEXT = "zkparty";

export class ZKTitle extends React.Component {
  refreshInterval: number;
  secondsOfLit: number;
  interval: number | undefined; 

  constructor(props: any) {
    super(props);
    this.refreshInterval = 1000 / 12;
    this.secondsOfLit = 0.5;
    this.interval = undefined;
  }

  state = {
    actualText: TITLE_TEXT
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
        this.interval = undefined;

        if (Math.random() < 0.3) {
          this.setState({
            actualText: TITLE_TEXT
          });
        }
      }, this.secondsOfLit * 1000);
    }
  };

  getRandomText() {
    let result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < TITLE_TEXT.length; i++) {
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
