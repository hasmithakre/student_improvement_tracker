import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import StudentDashboard from "./pages/StudentDashboard";
// import MentorDashboard from "./pages/MentorDashboard";
// import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/student" element={<StudentDashboard />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
