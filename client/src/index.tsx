import * as ReactDOM from "react-dom";
import App from "./app/App";
import * as React from "react";
import queryString from 'query-string';
//import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const qsProj: string | string[] | null = queryString.parse(location.search).project;
const project: string = qsProj == null ? '' : typeof qsProj === 'string' ? qsProj : qsProj[0];

ReactDOM.render(
    <React.StrictMode>
      <App project={project}/>
    </React.StrictMode>,
    document.getElementById('root')
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
//serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
