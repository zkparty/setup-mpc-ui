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
  name: string;
  description: string;
  start: string;
  end: string;
}

const ceremonies: Ceremony[] = [
  {
    id: "one",
    title: "ZKSnark Ceremony Number One",
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
    title: "cheese recipe ceremony",
    description:
      "olive magazine presents: the best cheese recipes in the world! We’re major cheese fiends at olive HQ, so we have hundreds of cheese recipes to pick our favourites from. Make pies oozing with brie, mac ‘n’ cheese laden with crisp bacon, or toasties stuffed with Fontina.    ",
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
            <TabLink selected={i === selectedTitleIndex}>{title}</TabLink>
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
const ParticipantsSection = () => {
  const [ceremonies, setCeremonies] = useState([]);

  fetch("http://zkparty.io/api/ceremonies")
    .then(response => {
      return response.json();
    })
    .then(json => {
      console.log(json);
      setCeremonies(json);
    })
    .catch(err => {
      console.log(err);
    });

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

const CeremonyDetails = (props: { ceremony: any }) => {
  return (
    <CeremonyDetailsContainer>
      <CeremonyTitle>{props.ceremony.name}</CeremonyTitle>

      <CeremonyDetailsSubSection>
        <Center>
          <CeremonyDetailsTable>
            <tr>
              <td>status</td> <td>{props.ceremony.status}</td>
            </tr>
            <tr>
              <td>start time</td> <td>{props.ceremony.startTime}</td>
            </tr>
            <tr>
              <td>end time</td> <td>{props.ceremony.endTime}</td>
            </tr>
            <tr>
              <td>hompage</td>{" "}
              <td>
                <a href={props.ceremony.homepage}>HOMEPAGE</a>
              </td>
            </tr>
            <tr>
              <td>github</td>{" "}
              <td>
                <a href={props.ceremony.github}>GITHUB</a>
              </td>
            </tr>
          </CeremonyDetailsTable>
        </Center>
      </CeremonyDetailsSubSection>
      <CeremonyDetailsSubSection>
        {props.ceremony.description}
      </CeremonyDetailsSubSection>
    </CeremonyDetailsContainer>
  );
};

const CeremonyPage = (props: RouteProps) => {
  let { id } = useParams();

  const [loaded, setLoaded] = useState(false);
  const [ceremony, setCeremony] = useState({});

  fetch(`http://zkparty.io/api/ceremony/${id}`)
    .then(response => {
      return response.json();
    })
    .then(json => {
      setLoaded(true);
      setCeremony(json);
    })
    .catch(err => {
      console.log(err);
    });

  return (
    <>
      <HomeLinkContainer>
        <Link to="/">home</Link>
      </HomeLinkContainer>
      {loaded ? (
        <PageContainer>
          <br />
          <CeremonyDetails ceremony={ceremony}></CeremonyDetails>
          <br />
          <ParticipantTable
            participants={ceremony.participants ? ceremony.participants : []}
            headers={[
              { title: "connection", width: "100px" },
              { title: "address", width: "400px" },
              { title: "status", width: "100px" }
            ]}
            cols={[
              p => (p.online ? "online" : "offline"),
              p => p.address,
              participantStatusString
            ]}
          />
        </PageContainer>
      ) : null}
    </>
  );
};

interface ParticipantInfo {
  computeProgress: number; // 0 to 100
  online: boolean;
  address: string;
  state: "WAITING" | "RUNNING" | "COMPLETE" | "INVALIDATED";
}

const participantStatusString = (participant: ParticipantInfo) => {
  let statusString: string = participant.state;
  if (participant.state === "RUNNING" && participant.computeProgress < 1) {
    statusString = `RUNNING: ${Math.round(participant.computeProgress)}%`;
  } else if (
    participant.state === "RUNNING" &&
    participant.computeProgress === 1
  ) {
    statusString = "VERIFYING";
  }

  return statusString;
};
const ParticipantTable = (props: {
  participants: ParticipantInfo[];
  headers: { title: string; width: string }[];
  cols: Array<(p: ParticipantInfo) => ReactNode | null>;
}) => {
  return (
    <div>
      <br />
      {props.headers.map((header, i) => {
        return (
          <TableHeader key={i} style={{ width: header.width }}>
            {header.title}
          </TableHeader>
        );
      })}

      {props.participants.map(p => {
        return (
          <div>
            {props.cols.map((col, i) => {
              return (
                <TableCell
                  style={{
                    width: props.headers[i].width,
                    maxWidth: props.headers[i].width,
                    overflow: "hidden",
                    textOverflow: "ellipses",
                    display: "inline-block",
                    zIndex: 100,
                    position: "relative"
                  }}
                  key={i}
                >
                  {col(p) + ""}
                </TableCell>
              );
            })}
          </div>
        );
      })}
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
      <CeremonyTitle>{c.name}</CeremonyTitle>
      {c.description}
    </CeremonyContiner>
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

/////////////////////////////////////////////////////////////////////////////////////////////////

const background = "#081a24";
const lighterBackground = color(background)
  .lighten(0.6)
  .toString();
const textColor = "#aaa";
const accentColor = "#31c41d";
const secondAccent = "#731dc4";

const CeremonyDetailsTable = styled.table`
  text-align: right;
  font-size: 11pt;
  width: 100%;

  td {
    padding-left: 10px;
  }
`;

const HomeLinkContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;

  a {
    color: ${accentColor};

    &:hover {
      color: ${textColor};
      background-color: ${secondAccent};
    }
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const TableCell = styled.span`
  padding: 2px 5px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableHeader = styled(TableCell)`
  display: inline-block;
  color: ${accentColor};
`;

const CeremonyDetailsContainer = styled.div`
  width: 512px;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
`;

const CeremonyDetailsSubSection = styled.div`
  width: 80%;
  display: inline-block;
  padding: 16px;
  box-sizing: border-box;
`;

const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
  margin-bottom: 64px;
`;

const LandingPageTitle = styled.div`
  font-size: 50pt;
  margin-bottom: 32px;
  font-weight: bold;
  color: ${accentColor};
  cursor: pointer;
  user-select: none;
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
      margin-right: 16px;

      &:hover {
        background-color: ${secondAccent};
        color: ${textColor};
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
