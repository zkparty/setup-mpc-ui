import * as React from "react";
import * as ReactDOM from "react-dom";

const App = () => {
  return <div>this is the app</div>;
};

const div = document.createElement("div");
document.body.appendChild(div);

ReactDOM.render(<App></App>, div);

console.log("test");
