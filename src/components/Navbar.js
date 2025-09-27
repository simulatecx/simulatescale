import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">
          <a>Project Scale</a>
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link href="/companies">
            <a>All Companies</a>
          </Link>
        </li>
        {/* Only render login/logout buttons once loading is complete */}
        {!loading && (
          <>
            {user ? (
              <li>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
              </li>
            ) : (
              <li>
                <Link href="/auth">
                  <a>Login / Sign Up</a>
                </Link>
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}