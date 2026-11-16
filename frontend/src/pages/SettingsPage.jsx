import { useState } from "react";

function SettingsPage({
  settings,
  onSettingsChange,
  onSave,
  onReset,
  onRetryExchangeRates,
  exchangeRate,
  exchangeRateDate,
  exchangeRateLoading,
  exchangeRateError,
}) {
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");

  function handleSettingsChange(event) {
    const { name, value } = event.target;
    onSettingsChange(name, value);
  }

  function saveSettings(event) {
    event.preventDefault();
    try {
      onSave();
      setSettingsError("");
      setSettingsMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Settings save error:", error);
      setSettingsError("Could not save settings. Please try again.");
      setSettingsMessage("");
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

        <div className="settings-card">
          <h2>Inventory Preferences</h2>
          <p>Set your low-stock notification threshold.</p>
          <div className="settings-field">
            <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
            <input
              id="lowStockThreshold"
              type="number"
              name="lowStockThreshold"
              min="0"
              step="1"
              value={settings.lowStockThreshold}
              onChange={handleSettingsChange}
              required
            />
            <small>
              Products with stock at or below this quantity should be considered
              low stock.
            </small>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="save-settings-btn">
            Save Changes
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
    </section>
  );
}

export default SettingsPage;
