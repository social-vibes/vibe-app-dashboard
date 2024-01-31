import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth"; 
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayError, setDisplayError] = useState(null);
  const navigate = useNavigate();

    function handleSignIn() {
      if (email === "dev.pixelworks@gmail.com" || email === "megan@vibesapp.ca" || email === "hana@vibesapp.ca") {
        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            const id = crypto.randomUUID();
            navigate(`/dashboard/${id}`);
          })
          .catch(() => {
            setDisplayError('Incorrect password')
          });
      } else {
        setDisplayError('You are not authorized to access this page.');
      }
    }

  return (
    <div className="login-container">
      <img className="logo" src={logo} alt="Vibe App. logo"/>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className= "login" onClick={handleSignIn}>Sign In</button>
      <div className="error-container" style={{ height: '30px' }}>
        <p className="errorMsg">{displayError}</p>
      </div>
    </div>
  );
}