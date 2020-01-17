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
import color from "color";

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
        <Route exact path="/register">
          <RegisterPage />
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

const RegisterPage = () => {
  return (
    <PageContainer>
      here is where you will register
      <Link to="/"> home</Link>
      <br />
      <form>
        <label>
          name: <input name="name" type="text" />
        </label>
        <br />
        <label>
          org: <input name="name" type="text" />
        </label>
        <br />
        <label>
          email: <input name="name" type="text" />
        </label>
        <br />
        <label>
          desc: <input name="name" type="text" />
        </label>
        <br />

        <input type="submit" />
      </form>
    </PageContainer>
  );
};

const LandingPage = () => {
  return (
    <PageContainer>
      <LandingPageTitle>zkparty</LandingPageTitle>

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
      <Link to="/register">register</Link>
    </div>
  );
};

let participants = [
  {
    progress: 1,
    online: true,
    address: "ofdlajfho2hpqui34hfqliufhasdkajbdkjasbd",
    org: "EF"
  },
  {
    progress: 1,
    online: true,
    address: "ofdlajfho2hpqui34hfqliufh",
    org: "EF"
  },
  {
    progress: 0.3,
    online: true,
    address: "ofdlajfho2hpqui34hfqliufh",
    org: "EF"
  },
  {
    progress: 0,
    online: true,
    address: "ofdlajfho2hpqui34hfqliufh",
    org: "EF"
  }
];

const CeremonyDetails = (props: { ceremony: Ceremony }) => {
  return (
    <CeremonyDetailsContainer>
      <CeremonyTitle>{props.ceremony.title}</CeremonyTitle>

      <CeremonyDetailsSubSection>
        status: <br />
        start time: <br />
        end time: <br />
        for participants: <br />
        homepage: <br />
        github: <br />
      </CeremonyDetailsSubSection>
      <CeremonyDetailsSubSection>
        It is a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English. Many desktop publishing packages and web
        page editors now use Lorem Ipsum as their default model text, and a
        search for 'lorem ipsum' will uncover many web sites still in their
        infancy. Various versions have evolved over the years, sometimes by
        accident, sometimes on purpose (injected humour and the like).
      </CeremonyDetailsSubSection>
    </CeremonyDetailsContainer>
  );
};

const CeremonyPage = (props: RouteProps) => {
  let { id } = useParams();

  const ceremony = ceremonies.find(c => c.id == id);

  return (
    <PageContainer>
      <Link to="/"> </Link>
      <br />
      <CeremonyDetails ceremony={ceremony}></CeremonyDetails>
      <br />
      <ParticipantTable
        participants={participants}
        headers={[
          { title: "online?", width: "100px" },
          { title: "address", width: "200px" },
          { title: "org", width: "100px" },
          { title: "status", width: "150px" }
        ]}
      />
    </PageContainer>
  );
};

interface ParticipantInfo {
  progress: number; // 0 to 1
  online: boolean;
  address: string;
  org: string;
}

const progressToStatusString = (progress: number) => {
  if (progress === 0) {
    return "Waiting";
  }

  if (progress === 1) {
    return "Complete";
  }

  return `Running (${Math.round(progress * 100)}%)`;
};
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
          <ProgressBar progress={p.progress} />

          <div>
            {[
              p.online,
              p.address,
              p.org,
              progressToStatusString(p.progress)
            ].map((content, i) => {
              return (
                <span
                  style={{
                    width: props.headers[i].width,
                    maxWidth: props.headers[i].width,
                    overflow: "hidden",
                    textOverflow: "ellipses",
                    display: "inline-block",
                    zIndex: 100,
                    position: "relative"
                  }}
                >
                  {content + ""}
                </span>
              );
            })}
          </div>
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
      <CeremonyTitle>{c.title}</CeremonyTitle>
      {c.description}
    </CeremonyContiner>
  );
};

/////////////////////////////////////////////////////////////////////////////////////////////////

const background = "#081a24";
const lighterBackground = color(background)
  .lighten(0.4)
  .toString();
const textColor = "#eee";
const accentColor = "#31c41d";
const secondAccent = "#731dc4";

const CeremonyDetailsContainer = styled.div`
  width: 80%;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
`;

const CeremonyDetailsSubSection = styled.div`
  width: 50%;
  height: 100%;
  display: inline-block;
`;

const ParticipantContainer = styled.div`
  position: relative;
  height: 32px;
  background-color: purple;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  ${(props: { progress: number }) => {
    return css`
      width: ${props.progress * 100}%;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: green;
      z-index: 1;
    `;
  }}
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
  color: ${accentColor};
`;

const CeremonyContiner = styled.div`
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

const CeremonyTitle = styled.div`
  font-size: 18pt;
  margin-bottom: 16px;
  color: ${accentColor};
`;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #081a24;
    color: ${textColor};
    margin: 0;
    margin-top: 64px;
    margin-bottom: 64px;
    font-family: 'Inconsolata', monospace;
    font-size: 11pt;

  }
`;

const TabLink = styled.span`
  ${(props: { selected: boolean }) => {
    return css`
      text-decoration: ${props.selected ? "underline" : "none"};
      cursor: pointer;
      color: ${props.selected ? "black" : accentColor};
      background-color: ${props.selected ? accentColor : "unset"};

      &:hover {
        background-color: ${secondAccent};
        color: black;
      }
    `;
  }}
`;

const SectionContainer = styled.div`
  margin-top: 32px;
`;

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<App></App>, div);
