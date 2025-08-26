import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./common/Navbar";
import Foooter from "./common/Foooter";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TasksPage from "./pages/TasksPage";
import { AuthRoute } from "./guard/Guard"
import TaskFormPage from "./pages/TaskFormPage";
import AdminTasksPage from "./pages/AdminTasksPage";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/tasks" element={<AuthRoute element={<TasksPage />} />} />
        <Route path="/tasks/add" element={<AuthRoute element={<TaskFormPage />} />} />
        <Route path="/tasks/edit/:id" element={<AuthRoute element={<TaskFormPage />} />} />
        <Route path="/admin/tasks" element={<AuthRoute element={<AdminTasksPage />} />} />

      {/* FALL BACK ROUTE FOR UNKOWN PAGES */}
        <Route path="*" element={<Navigate to="/tasks"/>}/>
      </Routes>

      <Foooter />

    </BrowserRouter>
  );
}

export default App;
