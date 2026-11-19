import { useState } from "react";

function SettingsPage({
  settings,
  onSettingsChange,
  onSave,
  onChangePassword,
  onReset,
  onRetryExchangeRates,
  exchangeRate,
  exchangeRateDate,
  exchangeRateLoading,
  exchangeRateError,
}) {
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  function handleSettingsChange(event) {
    const { name, value } = event.target;
    onSettingsChange(name, value);
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave();
      setSettingsError("");
      setSettingsMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Settings save error:", error);
      setSettingsError("Could not save settings. Please try again.");
      setSettingsMessage("");
    } finally {
      setSaving(false);
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
    setPasswordMessage("");
    setPasswordError("");
  }

  async function submitPasswordChange(event) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await onChangePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage(response.message);
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError(
        error.response?.data?.message ||
          "Could not change your password. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function resetSettings() {
    try {
      onReset();
      setSettingsError("");
      setSettingsMessage("Settings reset successfully!");
    } catch (error) {
      console.error("Settings reset error:", error);
      setSettingsError("Could not reset settings. Please try again.");
      setSettingsMessage("");
    }
  }

  return (
    <section className="settings-section">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your StockPilot application preferences.</p>
        </div>
      </div>

      <form onSubmit={saveSettings}>
        <div className="settings-card">
          <h2>Administrator Profile</h2>
          <p>Manage your basic profile information.</p>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="adminName">Administrator Name</label>
              <input
                id="adminName"
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleSettingsChange}
                required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={settings.email}
                onChange={handleSettingsChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Store Preferences</h2>
          <p>Configure your inventory store details.</p>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="storeName">Store Name</label>
              <input
                id="storeName"
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleSettingsChange}
                required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleSettingsChange}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
              {settings.currency === "INR" ? (
                <small>Product prices are stored in INR.</small>
              ) : exchangeRateError ? (
                <small className="error-message" role="alert">
                  {exchangeRateError}
                  <button
                    type="button"
                    className="exchange-rate-retry"
                    onClick={onRetryExchangeRates}
                  >
                    Retry
                  </button>
                </small>
              ) : exchangeRateLoading || !Number.isFinite(exchangeRate) ? (
                <small>Loading the latest exchange rate...</small>
              ) : (
                <small>
                  1 INR = {exchangeRate.toFixed(6)} {settings.currency}
                  {exchangeRateDate && ` (rate date: ${exchangeRateDate})`}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="save-settings-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="reset-settings-btn"
            onClick={resetSettings}
          >
            Reset Settings
          </button>
        </div>
        {settingsMessage && (
          <p className="settings-success" role="status">
            {settingsMessage}
          </p>
        )}
        {settingsError && <p className="error-message">{settingsError}</p>}
      </form>

      <form className="settings-card" onSubmit={submitPasswordChange}>
        <h2>Change Password</h2>
        <p>Verify your current password before choosing a new one.</p>
        <div className="settings-grid">
          <div className="settings-field">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              maxLength={128}
              required
            />
          </div>
          <div className="settings-field">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
            <small>Use 8 to 128 characters.</small>
          </div>
          <div className="settings-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>
        </div>
        {passwordMessage && (
          <p className="settings-success" role="status">{passwordMessage}</p>
        )}
        {passwordError && (
          <p className="error-message" role="alert">{passwordError}</p>
        )}
        <div className="settings-actions">
          <button
            type="submit"
            className="save-settings-btn"
            disabled={changingPassword}
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;
