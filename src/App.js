import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateAssignment from './page/CreateAssignment';
import StudentSubmit from './page/StudentSubmit';
import TeacherSubmissions from './page/TeacherSubmissions';
import { ConfigProvider } from 'antd';
function App() {
  return (
    <Router>
     

      <Routes>
       
       <Route path="/create-assignment" element={<CreateAssignment />} />
        <Route path="/student-submit" element={<StudentSubmit />} />
        <Route path="/teacher-submissions" element={<TeacherSubmissions />} />
        <Route path="*" element={<StudentSubmit />} />

       
      </Routes>
    </Router>
  );
}

export default App;
