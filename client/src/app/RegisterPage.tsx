import { PageContainer } from "../styles";
import { Link } from "react-router-dom";
import * as React from "react";

export const RegisterPage = () => {
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
