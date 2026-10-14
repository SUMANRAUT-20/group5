
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";

export default function DemoAuth({ register = false }) {
  const navigate = useNavigate();
  const { saveProfile } = useFinance();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (register && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Demo only: no real authentication.
    // Do not store passwords in localStorage.
    saveProfile({
      email: email.trim(),
      ...(register ? { name: name.trim() } : {})
    });

    navigate("/");
  }

  return (
    <div className="pm-login-page">
      <div className="pm-login-card">
        <h1>ProMoney</h1>
        <p>Manage your money smarter</p>

        <h2>{register ? "Create Account" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {register && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="pm-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          {error && <p className="pm-login-error">{error}</p>}

          <button type="submit">
            {register ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="pm-login-switch">
          {register ? "Already have an account?" : "New user?"}
          {" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Login" : "Create Account"}
          </Link>
        </p>

        <small>Frontend demonstration only</small>
      </div>
    </div>
  );
}
