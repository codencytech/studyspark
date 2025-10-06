import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Extension from "./pages/Extension";
import About from "./pages/About";
import APIs from "./pages/APIs";
import Team from "./pages/Team";
import Guide from "./pages/Guide";
import Result from "./pages/Result";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ai" element={<Home />} />
          <Route path="/extension" element={<Extension />} />
          <Route path="/about" element={<About />} />
          <Route path="/apis" element={<APIs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Layout>
    </Router>
  );
}