import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header-bg border-bottom border-subtle">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <a href="/" className="d-flex align-items-center text-decoration-none">
              <img src="images/prosperclub/sharing_prosper-club-logo.png" alt="Sharing" className="img-fluid" style={{ height: "32px" }} />
            </a>
          </div>

          {/* Desktop Menu */}
          <nav className="d-none d-md-flex">
            <a href="#" className="text-dark mx-3 text-decoration-none fw-medium border-end pe-3">
              Online Schedule
            </a>
            <a href="#" className="text-dark mx-3 text-decoration-none fw-medium border-end pe-3">
              IBO Pay Stub
            </a>
            <a href="#" className="text-dark mx-3 text-decoration-none fw-medium border-end pe-3">
              Prosper Club Cruise
            </a>
            <a href="#" className="text-dark ms-3 text-decoration-none fw-medium">
              Prosper Club Login
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="btn d-md-none text-dark border-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="d-md-none py-3 border-top mt-3">
            <nav className="d-flex flex-column">
              <a 
                href="#" 
                className="text-dark py-2 text-decoration-none fw-medium"
                onClick={() => setMenuOpen(false)}
              >
                Online Schedule
              </a>
              <a 
                href="#" 
                className="text-dark py-2 text-decoration-none fw-medium"
                onClick={() => setMenuOpen(false)}
              >
                IBO Pay Stub
              </a>
              <a 
                href="#" 
                className="text-dark py-2 text-decoration-none fw-medium"
                onClick={() => setMenuOpen(false)}
              >
                Prosper Club Cruise
              </a>
              <a 
                href="#" 
                className="text-dark py-2 text-decoration-none fw-medium"
                onClick={() => setMenuOpen(false)}
              >
                Prosper Club Login
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;