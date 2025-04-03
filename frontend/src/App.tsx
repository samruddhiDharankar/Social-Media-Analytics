import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskList from "./components/TaskList";
import TaskCreate from "./components/TaskCreate";
import TaskDetail from "./components/TaskDetail";
import NavBar from "./components/Navbar";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    }
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/create" element={<TaskCreate />} />
            <Route path="/task/:id" element={<TaskDetail />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
