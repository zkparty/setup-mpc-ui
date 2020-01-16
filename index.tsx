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
    <div>
      ZK Party
      <br />
      <Link to="/ceremony"> ceremony</Link>
    </div>
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

const CeremonySummary = () => {};

const div = document.createElement("div");
document.body.appendChild(div);

ReactDOM.render(<App></App>, div);

console.log("test");
