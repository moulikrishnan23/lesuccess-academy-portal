import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

// Header

import Navbar from "./components/Navbar";
import OfferHeader from "./components/OfferHeader";

// pages

import Home from "./pages/Home";
import Contact from "./pages/Contact";

const App = () => {
  return (
    <BrowserRouter>
      <OfferHeader />
      <Navbar />
      {/* <h1>Hello</h1> */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
