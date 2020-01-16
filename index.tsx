import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  HashRouter,
  RouteProps,
  useParams
} from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";

interface Ceremony {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

const ceremonies: Ceremony[] = [
  {
    id: "one",
    title: "goblin",
    description:
      "Ingredients. 1 1/2 cups (355 ml) warm water (105°F-115°F) 1 package (2 1/4 teaspoons) of active dry yeast. 3 3/4 cups (490 g) bread flour. 2 tablespoons extra virgin olive oil (omit if cooking pizza in a wood-fired pizza oven) 2 teaspoons salt. 1 teaspoon sugar.",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    id: "two",
    title: "this is a test ceremony",
    description:
      "noun a flowerless plant which has feathery or leafy fronds and reproduces by spores released from the undersides of the fronds. Ferns have a vascular system for the transport of water and nutrients.",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    id: "three",
    title: "pandas are kinda the best",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    id: "four",
    title: "zk snark test ceremony",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  },
  {
    id: "five",
    title: "fluffy shmufy",
    description: "test description",
    start: "2020-01-16",
    end: "2020-01-17"
  }
];

const App = () => {
  return (
    <HashRouter>
      <GlobalStyle />
      <Switch>
        <Route exact path="/coordinators">
          <CoordinatorPage />
        </Route>
        <Route exact path="/ceremony/:id">
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
      {ceremonies.map((c, i) => (
        <CeremonySummary key={i} ceremony={c} />
      ))}
    </LandingPageContainer>
  );
};

const CeremonyPage = (props: RouteProps) => {
  let { id } = useParams();

  return (
    <div>
      <Link to="/"> home</Link>
      <br />
      This is the ceremony page for the ceremony of id: {id}
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

const CeremonySummary = (props: { ceremony: Ceremony } & RouteProps) => {
  const c = props.ceremony;

  const onClick = () => {
    console.log("ok", c.id);
  };

  return (
    <CeremonyContiner onClick={onClick}>
      <CeremonyLinkTitle>{c.title}</CeremonyLinkTitle>
      {c.description} <br />
      <Link to="/ceremony"> ceremony</Link>
    </CeremonyContiner>
  );
};

const LandingPageContainer = styled.div`
  display: flex;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LinksContainer = styled.div``;

const LandingPageTitle = styled.div`
  font-size: 50pt;
  margin-bottom: 32px;
  font-weight: bold;
`;

const CeremonyContiner = styled.div`
  background-color: #eee;
  margin: 10px;
  width: 512px;
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const CeremonyLinkTitle = styled.div`
  font-size: 18pt;
  margin-bottom: 16px;
`;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #fefefe;
    color: #222;
    margin: 0;
    margin-top: 64px;
    margin-bottom: 64px;
    font-family: 'Inconsolata', monospace;
  }
`;
const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<App></App>, div);
