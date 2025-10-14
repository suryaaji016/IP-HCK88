import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Navbar from "./components/Navbar";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Playlist from "./pages/Playlist";

function AuthLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AuthLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/playlist" element={<Playlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
