import { HashRouter, Route, Routes } from "react-router-dom";
import { Architecture, CommandCenter, Investigation, LandingPage, Performance, Privacy } from "./pages";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<CommandCenter />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/investigate/:id" element={<Investigation />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/privacy/:uid" element={<Privacy />} />
      </Routes>
    </HashRouter>
  );
}
