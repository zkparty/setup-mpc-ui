import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  HashRouter
} from "react-router-dom";
import styled from "styled-components";

interface Ceremony {
  title: string;
  description: string;
  start: string;
  end: string;
}

const ceremonies: Ceremony[] = [
  {
    title: "test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    title: "test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    title: "test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    title: "test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    title: "test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  }
];

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/coordinators">
          <CoordinatorPage />
        </Route>
        <Route exact path="/ceremony">
          <CeremonyPage />
        </Route>
        <Route exact path="/">
          <LandingPage></LandingPage>
        </Route>
      </Switch>
    </HashRouter>
  );
};

const LandingPage = () => {
  return (
    <LandingPageContainer>
      <LandingPageTitle>ZK Party</LandingPageTitle>
      <br />
      <br />
      {ceremonies.map(c => (
        <CeremonySummary ceremony={c} />
      ))}
      <Link to="/ceremony"> ceremony</Link>
    </LandingPageContainer>
  );
};

const CeremonyPage = () => {
  return (
    <div>
      <Link to="/"> home</Link>
      <br />
      This is the ceremony page
    </div>
  );
};

const CoordinatorPage = () => {
  return (
    <div>
      <Link to="/"> home</Link>
      <br />
      this is the coordinators page
    </div>
  );
};

const CeremonySummary = (props: { ceremony: Ceremony }) => {
  const c = props.ceremony;

  return (
    <CeremonyContiner>
      {c.title} <br />
      {c.description} <br />
    </CeremonyContiner>
  );
};

const LandingPageContainer = styled.div`
  padding-top: 48px;
  display: flex;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LinksContainer = styled.div``;

const LandingPageTitle = styled.div`
  font-size: 30pt;
`;

const CeremonyContiner = styled.div`
  background-color: green;
  margin: 10px;
  width: 512px;
  padding: 16px;
`;

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<App></App>, div);
