"use client"
import "./Button.css"

function Button({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const buttonClasses = [
    "button",
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? "button-full-width" : "",
    disabled ? "button-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
