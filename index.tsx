import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  HashRouter,
  RouteProps,
  useParams,
  withRouter,
  RouteComponentProps,
  useHistory
} from "react-router-dom";
import styled, { createGlobalStyle, css } from "styled-components";
import { ReactNode } from "react";

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
          <AboutSection />
        </Route>
        <Route exact path="/ceremony/:id">
          <CeremonyPage />
        </Route>
        <Route exact path="/">
          <LandingPage />
        </Route>
      </Switch>
    </HashRouter>
  );
};

const Tabs = (props: { children: ReactNode; titles: string[] }) => {
  const [selectedTitleIndex, updateIndex] = useState(0);

  return (
    <>
      <div>
        {props.titles.map((title, i) => (
          <span key={title} onClick={() => updateIndex(i)}>
            <TabLink selected={i === selectedTitleIndex}>{title}</TabLink>{" "}
          </span>
        ))}
      </div>

      <SectionContainer>{props.children[selectedTitleIndex]}</SectionContainer>
    </>
  );
};

const LandingPage = () => {
  return (
    <PageContainer>
      <LandingPageTitle>ZK Party</LandingPageTitle>

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
const ParticipantsSection = () => {
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
      wecome to zkparty ... <br />
      <input type="button" value="register" />
    </div>
  );
};

const CeremonyPage = (props: RouteProps) => {
  let { id } = useParams();

  let participants = [
    {
      online: true,
      address: "ofdlajfho2hpqui34hfqliufhasdkajbdkjasbd",
      org: "EF",
      status: "Complete"
    },
    {
      online: true,
      address: "ofdlajfho2hpqui34hfqliufh",
      org: "EF",
      status: "Complete"
    },
    {
      online: true,
      address: "ofdlajfho2hpqui34hfqliufh",
      org: "EF",
      status: "Complete"
    },
    {
      online: true,
      address: "ofdlajfho2hpqui34hfqliufh",
      org: "EF",
      status: "Complete"
    }
  ];

  return (
    <PageContainer>
      <Link to="/"> home</Link>
      <br />
      This is the ceremony page for the ceremony of id: {id}
      <ParticipantTable
        participants={participants}
        headers={[
          { title: "online?", width: "100px" },
          { title: "address", width: "200px" },
          { title: "org", width: "100px" },
          { title: "status", width: "50px" }
        ]}
      />
    </PageContainer>
  );
};

interface ParticipantInfo {
  online: boolean;
  address: string;
  org: string;
  status: string;
}

const ParticipantTable = (props: {
  participants: ParticipantInfo[];
  headers: { title: string; width: string }[];
}) => {
  return (
    <div>
      <br />
      {props.headers.map(header => {
        return (
          <span style={{ width: header.width, display: "inline-block" }}>
            {header.title}
          </span>
        );
      })}
      <br />
      <br />

      {props.participants.map((p, i) => (
        <ParticipantContainer key={i}>
          <ProgressBar />

          {[p.online, p.address, p.org, p.status].map((content, i) => {
            return (
              <span
                style={{
                  width: props.headers[i].width,
                  maxWidth: props.headers[i].width,
                  overflow: "hidden",
                  textOverflow: "ellipses",
                  display: "inline-block"
                }}
              >
                {content}
              </span>
            );
          })}
        </ParticipantContainer>
      ))}
    </div>
  );
};

const AboutSection = () => {
  return <div>this is the about</div>;
};

const CeremonySummary = (props: { ceremony: Ceremony } & RouteProps) => {
  const c = props.ceremony;

  let history = useHistory();

  const onClick = () => {
    history.push(`/ceremony/${c.id}`);
  };

  return (
    <CeremonyContiner onClick={onClick}>
      <CeremonyLinkTitle>{c.title}</CeremonyLinkTitle>
      {c.description}
    </CeremonyContiner>
  );
};

/////////////////////////////////////////////////////////////////////////////////////////////////

const ParticipantContainer = styled.div`
  position: relative;
  height: 32px;
  background-color: purple;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 33%;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: green;
  z-index: 1;
`;

const PageContainer = styled.div`
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
  border: 2px solid transparent;

  &:hover {
    border: 2px solid #aaa;
  }
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

const TabLink = styled.span`
  ${(props: { selected: boolean }) => {
    return css`
      text-decoration: ${props.selected ? "underline" : "none"};
      cursor: pointer;
    `;
  }}
`;

const SectionContainer = styled.div`
  margin-top: 32px;
`;

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<App></App>, div);
