import { Route, Routes } from "react-router-dom";
import Error404 from "./errors/Error404";
import Home from "./views/Home";
import Prueba from "./views/Prueba";
import Slide from "./views/Slide";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<Error404 />}></Route>
        <Route index path="/" element={<Home />}></Route>
        <Route path="/prueba" element={<Prueba />}></Route>
        <Route path="/slide/:id" element={<Slide />}></Route>
      </Routes>
    </>
  );
}

export default App;
