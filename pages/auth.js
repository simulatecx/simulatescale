import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  
  const { user, signup, login, loading, loginWithGoogle} = useAuth();
  

  useEffect(() => {
    if (!loading && user) {
      router.push('/'); // Redirect to homepage if already logged in
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push('/'); // Redirect to homepage on successful login/signup
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  if (loading || user) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="auth-page-wrapper">
      <Head>
        <title>{isLogin ? 'Log In' : 'Sign Up'} - Project Scale</title>
        <meta name="description" content="Access your account or create a new one to start sharing and viewing software discount data." />
      </Head>
      
      <aside className="auth-sidebar">
        <h1>{isLogin ? 'Stop Overpaying.' : 'Get Price Smart.'}</h1>
        <p>{isLogin ? 'Access real-time, anonymous pricing data to ensure you get the best deal on your next software purchase.' : 'Join a community of procurement professionals sharing anonymous pricing data to level the playing field.'}</p>
      </aside>

      <main className="auth-main-content">
        <div className="auth-form-container">
          <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
          <p>{isLogin ? 'Sign in to your account to continue.' : 'Join our community to view and contribute data.'}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
              <div className="social-login">
            <button onClick={loginWithGoogle} className="google-btn">
              Login with Google
            </button>
            </div>
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
            {!isPending && <button className="auth-button">{isLogin ? 'Sign In' : 'Create Account'}</button>}
            {isPending && <button className="auth-button" disabled>{isLogin ? 'Loading...' : 'Creating...'}</button>}
            {error && <div className="error">{error}</div>}
          </form>
           <p className="toggle-auth">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}