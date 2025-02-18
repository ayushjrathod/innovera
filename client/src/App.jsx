import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Test from "./components/test";
function App() {
  return (
    <Router>
      {/* <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/view" element={<ViewBroadcast />} />
        </Routes>
      </div> */}
      <Routes>
        <Route path="/" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
