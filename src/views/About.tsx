import React from "react";

import { PageMeta } from "../components";

function About() {
  return (
    <>
      <PageMeta />
      <iframe src={"https://docs.winessy.com/"} title="about" id="about" />
    </>
  );
}

export default About;
