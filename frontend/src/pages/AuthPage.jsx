import { useState } from "react";
import api from "../services/api";

function AuthPage({ onAuthenticated, onClearNotice, notice }) {
  const [mode, setMode] = useState("login");
  const [storeName, setStoreName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    onClearNotice();
    setSubmitting(true);
    setError("");
    setErrorDetail("");

    try {
      const response = await api.post(
        mode === "register" ? "/auth/register" : "/auth/login",
        mode === "register"
          ? { storeName, adminName, email, password }
          : { email, password }
      );
      localStorage.setItem("stockpilotToken", response.data.token);
      onAuthenticated(response.data.user);
    } catch (requestError) {
      const status = requestError.response?.status;
      const backendMessage = requestError.response?.data?.message;
      const backendDetail = requestError.response?.data?.error;
      setErrorDetail(
        typeof backendDetail === "string" ? backendDetail : ""
      );

      if (status === 404) {
        setError(
          "The StockPilot backend has not been updated with store accounts yet. Please deploy the latest backend and try again."
        );
      } else if (!requestError.response) {
        setError(
          "Cannot reach the StockPilot backend. Check that it is online and try again."
        );
      } else {
        setError(
          backendMessage || `Could not create or sign in to your account (HTTP ${status}).`
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setStoreName("");
    setAdminName("");
    setEmail("");
    setPassword("");
    setError("");
    setErrorDetail("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="brand">
          StockPilot<span>.</span>
        </h1>
        <p className="eyebrow">YOUR STORE WORKSPACE</p>
        <h2>{mode === "register" ? "Create your store account" : "Welcome back"}</h2>
        <p className="auth-description">
          Sign in on any device to manage your store&apos;s private inventory.
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account options">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>
                Store name
                <input
                  type="text"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  maxLength={100}
                  autoComplete="organization"
                  required
                />
              </label>
              <label>
                Your name
                <input
                  type="text"
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>
            </>
          )}
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
            />
          </label>
          {mode === "register" && (
            <small className="auth-hint">Use at least 8 characters.</small>
          )}
          {notice && <p className="error-message" role="alert">{notice}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {errorDetail && (
            <details className="auth-error-details">
              <summary>Technical details</summary>
              <code>{errorDetail}</code>
            </details>
          )}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "register"
                ? "Create store account"
                : "Sign in"}
          </button>
        </form>

         {/* <p className="auth-privacy">
          The first store account keeps the existing inventory. Every other
          store starts with its own empty products, orders, and sales.
        </p>  */}
      </section>
    </main>
  );
}

export default AuthPage;
