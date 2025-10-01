import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      setIsPending(false);
      navigate('/'); 
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <aside className="auth-sidebar">
        <h1>Stop Overpaying.</h1>
        <p>Access real-time, anonymous pricing data to ensure you get the best deal on your next software purchase.</p>
      </aside>
      <main className="auth-main-content">
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              placeholder="name@company.com"
            />
            <label>Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              placeholder="••••••••"
            />
            {!isPending && <button className="auth-button">Sign In</button>}
            {isPending && <button className="auth-button" disabled>Loading...</button>}
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

