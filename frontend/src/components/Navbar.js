import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logoContainer}>
        <h1 style={styles.logo}>Savor<span style={{ color: "var(--accent-gold)", fontWeight: "600" }}>Sphere</span></h1>
      </Link>
      <div style={styles.navLinks}>
        <Link to="/restaurants" style={styles.link}>Explore</Link>
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} style={styles.link}>Dashboard</Link>
            <span style={styles.welcomeText}>Hi, {user.name.split(" ")[0]}</span>
            <button onClick={handleLogoutClick} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "rgba(9, 10, 15, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  logoContainer: {
    textDecoration: "none",
  },
  logo: {
    fontSize: "24px",
    color: "var(--text-primary)",
    fontWeight: "300",
    letterSpacing: "1px",
    margin: 0,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  welcomeText: {
    color: "var(--text-muted)",
    fontSize: "14px",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    paddingLeft: "16px",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "var(--accent-crimson)",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  registerBtn: {
    backgroundColor: "var(--accent-gold)",
    color: "var(--bg-primary)",
    textDecoration: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  }
};

export default Navbar;
