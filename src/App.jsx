import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Insurance from "./pages/Insurance";
import Policies from "./pages/Policies";
import PolicyDetails from "./pages/PolicyDetails";
import Receipt from "./pages/Receipt";
import Services from "./pages/Services";
import Feedback from "./pages/Feedback";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/:policyId" element={<PolicyDetails />} />
        <Route path="/receipt/:txHash" element={<Receipt />} />
        <Route path="/services" element={<Services />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
