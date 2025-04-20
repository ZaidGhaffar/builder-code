import { NavLink } from "react-router-dom"
import "./Navigation.css"

function Navigation() {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink to={item.path} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
