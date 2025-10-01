import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const SignUpPage = () => {
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
      await createUserWithEmailAndPassword(auth, email, password);
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
        <h1>Get Price Smart.</h1>
        <p>Join a community of procurement professionals sharing anonymous pricing data to level the playing field.</p>
      </aside>
      <main className="auth-main-content">
        <div className="auth-form-container">
          <h2>Create Your Account</h2>
          <p>Join our community to view and contribute data.</p>
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
              placeholder="6+ characters"
            />
            {!isPending && <button className="auth-button">Create Account</button>}
            {isPending && <button className="auth-button" disabled>Creating...</button>}
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;

