import "./Logo.css"

function Logo({ size = "medium" }) {
  const logoClasses = `logo logo-${size}`

  return (
    <div className={logoClasses}>
      <span className="logo-text">
        React<span className="logo-accent">App</span>
      </span>
    </div>
  )
}

export default Logo
