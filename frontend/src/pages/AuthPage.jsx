import { useState } from "react";
import api from "../services/api";

function AuthPage({ onAuthenticated, onClearNotice, notice }) {
  const [resetToken] = useState(
    () => new URLSearchParams(window.location.search).get("resetToken") || ""
  );
  const [mode, setMode] = useState(() => (resetToken ? "reset" : "login"));
  const [storeName, setStoreName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    onClearNotice();
    setSubmitting(true);
    setError("");
    setErrorDetail("");
    setSuccess("");

    try {
      if (mode === "forgot") {
        const response = await api.post("/auth/forgot-password", { email });
        setSuccess(response.data.message);
        return;
      }

      if (mode === "reset") {
        if (password !== confirmPassword) {
          setError("The passwords do not match.");
          return;
        }

        const response = await api.post("/auth/reset-password", {
          token: resetToken,
          newPassword: password,
        });
        setSuccess(response.data.message);
        setPassword("");
        setConfirmPassword("");
        setMode("login");

        const url = new URL(window.location.href);
        url.searchParams.delete("resetToken");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        return;
      }

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
      setErrorDetail(typeof backendDetail === "string" ? backendDetail : "");

      if (status === 404) {
        setError(
          "The StockPilot backend has not been updated with account recovery yet. Please deploy the latest backend and try again."
        );
      } else if (!requestError.response) {
        setError(
          "Cannot reach the StockPilot backend. Check that it is online and try again."
        );
      } else {
        setError(
          backendMessage ||
            `Could not complete the request (HTTP ${status}).`
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    const switchingBetweenLoginAndForgot =
      (mode === "login" && nextMode === "forgot") ||
      (mode === "forgot" && nextMode === "login");
    setMode(nextMode);
    setStoreName("");
    setAdminName("");
    if (!switchingBetweenLoginAndForgot) {
      setEmail("");
    }
    setPassword("");
    setConfirmPassword("");
    setError("");
    setErrorDetail("");
    setSuccess("");

    if (nextMode !== "reset" && resetToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete("resetToken");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  const title = {
    register: "Create your store account",
    forgot: "Forgot your password?",
    reset: "Set a new password",
  }[mode] || "Welcome back";
  const description = {
    forgot: "Enter the email address linked to your store account and we will send a reset link.",
    reset: "Choose a new password for your StockPilot account.",
  }[mode] || "Sign in on any device to manage your store's private inventory.";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="brand">
          StockPilot<span>.</span>
        </h1>
        <p className="eyebrow">YOUR STORE WORKSPACE</p>
        <h2>{title}</h2>
        <p className="auth-description">{description}</p>

        {(mode === "login" || mode === "register") && (
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
        )}

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
          {mode !== "reset" && (
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
          )}
          {(mode === "login" || mode === "register" || mode === "reset") && (
            <label>
              {mode === "reset" ? "New password" : "Password"}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>
          )}
          {mode === "reset" && (
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </label>
          )}
          {mode === "register" && (
            <small className="auth-hint">Use at least 8 characters.</small>
          )}
          {mode === "reset" && (
            <small className="auth-hint">Use 8 to 128 characters.</small>
          )}
          {notice && <p className="error-message" role="alert">{notice}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
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
                : mode === "forgot"
                  ? "Send reset link"
                  : mode === "reset"
                    ? "Reset password"
                    : "Sign in"}
          </button>
          {mode === "login" && (
            <button
              className="auth-link"
              type="button"
              onClick={() => changeMode("forgot")}
            >
              Forgot password?
            </button>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button
              className="auth-link"
              type="button"
              onClick={() => changeMode("login")}
            >
              Back to sign in
            </button>
          )}
        </form>

        {/* <p className="auth-privacy">
          The first store account keeps the existing inventory. Every other
          store starts with its own empty products, orders, and sales.
        </p> */}
      </section>
    </main>
  );
}

export default AuthPage;
