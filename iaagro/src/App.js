import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cadastrar from './components/auth/Cadastrar';
import Login from './components/auth/Login';
import EsqueciSenha from './components/auth/EsqueciSenha';
import RedefinirSenha from './components/auth/RedefinirSenha';
import { AuthProvider } from './authContext';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/" element={<Login />} />
            <Route path="/recuperarsenha" element={<EsqueciSenha />} />
            <Route path="/__/auth/action" element={<RedefinirSenha />} />
             <Route path="/Home" element={<Home />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
