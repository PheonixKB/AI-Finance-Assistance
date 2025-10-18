import { useState } from "react";
import PermissionToggle from "./PermissionToggle";
import "./SideMenu.css"; // <-- link to the CSS file

const SideMenu = ({ onLogout, onToggleDarkMode, permissions, onPermissionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Icon */}
      <div className="hamburger" onClick={toggleMenu}>
        &#9776;
      </div>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Side Menu */}
      <div className={`side-menu ${isOpen ? "show" : ""}`}>
        <button onClick={() => { onLogout(); closeMenu(); }}>Logout</button>
        <button onClick={() => { onToggleDarkMode(); closeMenu(); }}>
          Dark/Light Mode
        </button>

        {/* Permissions inside the side menu */}
        <PermissionToggle permissions={permissions} onChange={onPermissionChange} />
      </div>
    </>
  );
};

export default SideMenu;
