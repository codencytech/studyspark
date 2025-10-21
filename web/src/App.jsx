import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Extension from "./pages/Extension";
import About from "./pages/About";
import APIs from "./pages/APIs";
import Team from "./pages/Team";
import Guide from "./pages/Guide";
import Result from "./pages/Result";
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Webai from "./pages/Webai";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ai" element={<Webai />} />
          <Route path="/extension" element={<Extension />} />
          <Route path="/about" element={<About />} />
          <Route path="/apis" element={<APIs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/result" element={<Result />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}