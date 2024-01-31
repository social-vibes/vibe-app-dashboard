import { Routes, Route } from 'react-router-dom';
import Login from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import ErrorPage from "./pages/ErrorPage";

export default function App() {

  return (
      <Routes>
        <Route path = '/' element={<Login />}/>
        <Route path = '/dashboard/:id' element = {<Dashboard/>}/>
        <Route path = '*' element = { <ErrorPage/> }/>
      </Routes>
  )
}
