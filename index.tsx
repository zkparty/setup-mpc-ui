import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  HashRouter
} from "react-router-dom";

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/about"></Route>
        <Route path="/ceremony">
          <CeremonyPage></CeremonyPage>
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
    <div>
      ZK Party
      <br />
      <Link to="/ceremony"> ceremony</Link>
    </div>
  );
};

const CeremonyPage = () => {
  return <div>This is the ceremony page</div>;
};

const CeremonySummary = () => {};

const div = document.createElement("div");
document.body.appendChild(div);

ReactDOM.render(<App></App>, div);

console.log("test");
