import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Search,
} from "lucide-react";
import api from "./services/api";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

const defaultSettings = {
  storeName: "StockPilot Store",
  adminName: "Administrator",
  email: "admin@stockpilot.com",
  currency: "INR",
  lowStockThreshold: 10,
};

const currencyFormats = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
};

function readSavedSettings() {
  try {
    const savedSettings = localStorage.getItem("stockpilotSettings");
    if (!savedSettings) {
      return defaultSettings;
    }

    const parsedSettings = JSON.parse(savedSettings);
    const savedThreshold = Number(parsedSettings.lowStockThreshold);
    return {
      ...defaultSettings,
      ...parsedSettings,
      currency: currencyFormats[parsedSettings.currency]
        ? parsedSettings.currency
        : defaultSettings.currency,
      lowStockThreshold:
        Number.isInteger(savedThreshold) && savedThreshold >= 0
          ? savedThreshold
          : defaultSettings.lowStockThreshold,
    };
  } catch (error) {
    console.error("Could not load saved settings:", error);
    return defaultSettings;
  }
}

function getCurrentPage() {
  const page = window.location.hash.slice(1);
  return ["inventory", "orders", "settings"].includes(page)
    ? page
    : "dashboard";
}

function App() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleProduct, setSaleProduct] = useState(null);
  const [saleQuantity, setSaleQuantity] = useState("");
  const [saleSaving, setSaleSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inventorySummary, setInventorySummary] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(getCurrentPage);
  const [orderingProductId, setOrderingProductId] = useState(null);
  const [settings, setSettings] = useState(readSavedSettings);
  const [exchangeRates, setExchangeRates] = useState({ INR: 1 });
  const [exchangeRateDate, setExchangeRateDate] = useState("");
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState("");
  const [exchangeRateRetry, setExchangeRateRetry] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    price: "",
    averageDailySales: "0",
    leadTimeDays: "0",
    safetyStock: "0",
  });

  const [editingProduct, setEditingProduct] = useState(null);
const [editData, setEditData] = useState({
  name: "",
  stock: "",
  price: "",
  averageDailySales: "0",
  leadTimeDays: "0",
  safetyStock: "0",
});
const [editError, setEditError] = useState("");
const [updating, setUpdating] = useState(false); 

  async function refreshDashboardData() {
  try {
    const productsResponse = await api.get("/products");
    setProducts(productsResponse.data);

    const summaryResponse = await api.get("/inventory/summary");
    setInventorySummary(summaryResponse.data);
  } catch (error) {
    console.error("Dashboard refresh error:", error);
    setError("Unable to refresh dashboard data.");
  }
}

useEffect(() => {
  async function loadDashboard() {
    try {
      await refreshDashboardData();
    } finally {
      setLoading(false);
    }
  }

  loadDashboard();
}, []);

useEffect(() => {
  function handleHashChange() {
    setCurrentPage(getCurrentPage());
  }

  window.addEventListener("hashchange", handleHashChange);
  return () => window.removeEventListener("hashchange", handleHashChange);
}, []);

useEffect(() => {
  if (settings.currency === "INR") {
    setExchangeRateLoading(false);
    setExchangeRateError("");
    return undefined;
  }

  const controller = new AbortController();

  async function loadExchangeRates() {
    setExchangeRateLoading(true);
    setExchangeRateError("");

    try {
      const response = await fetch(
        "https://api.frankfurter.dev/v1/latest?base=INR&symbols=USD,EUR",
        { signal: controller.signal }
      );
      if (!response.ok) {
        throw new Error(`Exchange-rate service returned ${response.status}`);
      }

      const data = await response.json();
      const usdRate = Number(data.rates?.USD);
      const eurRate = Number(data.rates?.EUR);

      if (
        data.base !== "INR" ||
        !Number.isFinite(usdRate) ||
        usdRate <= 0 ||
        !Number.isFinite(eurRate) ||
        eurRate <= 0
      ) {
        throw new Error("Exchange-rate service returned invalid rates");
      }

      setExchangeRates({ INR: 1, USD: usdRate, EUR: eurRate });
      setExchangeRateDate(data.date);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Exchange rate load error:", error);
        setExchangeRateError(
          "Could not load current exchange rates. Check your connection and try again."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setExchangeRateLoading(false);
      }
    }
  }

  loadExchangeRates();
  return () => controller.abort();
}, [settings.currency, exchangeRateRetry]);



  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockThreshold = Number(settings.lowStockThreshold);
  const currencyLocale = currencyFormats[settings.currency] || currencyFormats.INR;
  const currencySymbol = currencySymbols[settings.currency] || currencySymbols.INR;
  const exchangeRate = exchangeRates[settings.currency];
  const formatCurrency = (amount) => {
    if (!Number.isFinite(exchangeRate)) {
      return "—";
    }

    return new Intl.NumberFormat(currencyLocale, {
      style: "currency",
      currency: currencyFormats[settings.currency] ? settings.currency : "INR",
    }).format(amount * exchangeRate);
  };
  const convertToBaseCurrency = (amount) =>
    Number.isFinite(amount) && Number.isFinite(exchangeRate)
      ? amount / exchangeRate
      : null;
  const lowStock = products.filter(
    (product) => product.stock <= lowStockThreshold
  ).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.price,
    0,
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  
async function handleAddProduct(event) {
  event.preventDefault();

  const basePrice = convertToBaseCurrency(Number(formData.price));
  if (basePrice === null) {
    setFormError("Cannot save this price until the exchange rate is available.");
    return;
  }

  setSaving(true);
  setFormError("");

  try {
    const payload = {
      name: formData.name.trim(),
      stock: Number(formData.stock),
      price: basePrice,
      averageDailySales: Number(formData.averageDailySales),
      leadTimeDays: Number(formData.leadTimeDays),
      safetyStock: Number(formData.safetyStock),
    };

    await api.post("/products", payload);

    // Fetch the latest product list from the backend
   const productsResponse = await api.get("/products");
   setProducts(productsResponse.data);

const summaryResponse = await api.get("/inventory/summary");
setInventorySummary(summaryResponse.data);

alert("Product recorded successfully!");

    // Close the form and reset its fields
    setFormData({
      name: "",
      stock: "",
      price: "",
      averageDailySales: "0",
      leadTimeDays: "0",
      safetyStock: "0",
    });

    setShowForm(false);
  } catch (error) {
  console.error("Product save error:", error);

  const backendError = error.response?.data;

  setFormError(
    backendError?.error ||
    backendError?.message ||
    "Something went wrong. Please try again."
  );
} finally {
    setSaving(false);
  }
}

function openSaleModal(product) {
  setSaleProduct(product);
  setSaleQuantity("");
  setShowSaleModal(true);
}

function startEditing(product) {
  if (!Number.isFinite(exchangeRate)) {
    setError("Cannot edit this price until the exchange rate is available.");
    return;
  }

  setError("");
  setEditingProduct(product);
  setEditError("");

  setEditData({
    name: product.name,
    stock: String(product.stock),
    price: String((product.price * exchangeRate).toFixed(2)),
    averageDailySales: String(product.averageDailySales ?? 0),
    leadTimeDays: String(product.leadTimeDays ?? 0),
    safetyStock: String(product.safetyStock ?? 0),
  });
}



function handleEditChange(event) {
  const { name, value } = event.target;

  setEditData((previous) => ({
    ...previous,
    [name]: value,
  }));
}


async function handleUpdateProduct(event) {
  event.preventDefault();

  const basePrice = convertToBaseCurrency(Number(editData.price));
  if (basePrice === null) {
    setEditError("Cannot save this price until the exchange rate is available.");
    return;
  }

  setUpdating(true);
  setEditError("");

  try {
      
await api.put(`/products/${editingProduct._id}`, {
  name: editData.name.trim(),
  stock: Number(editData.stock),
  price: basePrice,
  averageDailySales: Number(editData.averageDailySales),
  leadTimeDays: Number(editData.leadTimeDays),
  safetyStock: Number(editData.safetyStock),
}
);


    await refreshDashboardData();

    // Close the edit form
    setEditingProduct(null);
  } catch (error) {
  console.error("Update product error:", error);

  const backendError = error.response?.data;

  setEditError(
    backendError?.error ||
    backendError?.message ||
    "Could not update product. Please try again."
  );
} finally {
    setUpdating(false);
  }
}

async function submitSale() {
  if (!saleQuantity || !Number.isInteger(Number(saleQuantity)) || Number(saleQuantity) <= 0) {
    setError("Please enter a valid positive whole number.");
    return;
  }
setSaleSaving(true);
  try {
    setError("");

    await api.post(`/products/${saleProduct._id}/sales`, {
      quantity: Number(saleQuantity),
    });

    await refreshDashboardData();

    setShowSaleModal(false);
    setSaleProduct(null);
    setSaleQuantity("");

    alert("Sale recorded successfully!");
  } catch (error) {
    console.error("Record sale error:", error);

    setError(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Could not record sale. Please try again."
    );
  }
  finally {
  setSaleSaving(false);
}
}

async function handleDeleteProduct(productId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/products/${productId}`);

    await refreshDashboardData();
  } catch (error) {
    console.error("Delete product error:", error);
    alert(
      error.response?.data?.message ||
        "Could not delete product. Please try again."
    );
  }
}

async function handlePlaceOrder(product, quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    setError("This product does not have a valid suggested order quantity.");
    return;
  }

  if (!window.confirm(`Place an order for ${quantity} units of ${product.name}?`)) {
    return;
  }

  setOrderingProductId(product._id);
  setError("");

  try {
    await api.post("/orders", {
      productId: product._id,
      quantity,
    });
    window.alert("Order placed successfully. View it on the Orders page.");
  } catch (orderError) {
    console.error("Place order error:", orderError);
    setError(
      orderError.response?.data?.message ||
        "Could not place order. Please try again."
    );
  } finally {
    setOrderingProductId(null);
  }
}

function handleSettingsChange(name, value) {
  setSettings((currentSettings) => ({
    ...currentSettings,
    [name]: value,
  }));
}

function saveSettings() {
  localStorage.setItem("stockpilotSettings", JSON.stringify(settings));
}

function resetSettings() {
  localStorage.setItem("stockpilotSettings", JSON.stringify(defaultSettings));
  setSettings(defaultSettings);
}

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="brand">
          StockPilot<span>.</span>
        </h2>
        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          <a
            className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
            href="#dashboard"
          >
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a
            className={`nav-link ${currentPage === "inventory" ? "active" : ""}`}
            href="#inventory"
          >
            <Package size={19} /> Inventory
          </a>
          <a
            className={`nav-link ${currentPage === "orders" ? "active" : ""}`}
            href="#orders"
          >
            <ShoppingCart size={19} /> Orders
          </a>
          <a
            className={`nav-link ${currentPage === "settings" ? "active" : ""}`}
            href="#settings"
          >
            <Settings size={19} /> Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">SP</div>
          <div>
            <strong>{settings.adminName}</strong>
            <small>{settings.storeName}</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {currentPage === "dashboard" ? (
          <>
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>{settings.storeName} Dashboard</h1>
          </div>

          <div className="topbar-actions">
            <div className="avatar">SP</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <h2>Welcome back, {settings.adminName}!</h2>
            <p>Here's what's happening at {settings.storeName} today.</p>
          </div>
          <span className="live-status">● Live inventory</span>
        </section>

        {error && <p className="error-message">{error}</p>}
        {settings.currency !== "INR" && (
          exchangeRateError ? (
            <p className="error-message" role="alert">{exchangeRateError}</p>
          ) : exchangeRateLoading || !Number.isFinite(exchangeRate) ? (
            <p className="exchange-rate-notice">Loading the latest exchange rate...</p>
          ) : (
            <p className="exchange-rate-notice">
              Prices converted from INR using {exchangeRateDate} rates.
            </p>
          )
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <p>Total Products</p>
            <h2>{loading ? "—" : totalProducts}</h2>
            <span>Unique inventory records</span>
          </article>

          <article className="stat-card">
            <p>Total Units in Stock</p>
            <h2>{loading ? "—" : totalUnits}</h2>
            <span>Units currently available</span>
          </article>

          <article className="stat-card">
            <p>Low Stock Items</p>
            <h2>{loading ? "—" : lowStock}</h2>
            <span>Products with stock at or below {lowStockThreshold} units</span>
          </article>

          <article className="stat-card">
            <p>Inventory Value</p>
            <h2>
              {loading ? "—" : formatCurrency(inventoryValue)}
            </h2>
            <span>Current stock × unit price</span>
          </article>
        </section>
          </>
        ) : currentPage === "inventory" ? (
          <>
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCT MANAGEMENT</p>
            <h1>Inventory</h1>
          </div>
          <div className="topbar-actions">
            <div className="avatar">SP</div>
          </div>
        </header>

        {error && <p className="error-message">{error}</p>}
        {settings.currency !== "INR" && (
          exchangeRateError ? (
            <p className="error-message" role="alert">{exchangeRateError}</p>
          ) : exchangeRateLoading || !Number.isFinite(exchangeRate) ? (
            <p className="exchange-rate-notice">Loading the latest exchange rate...</p>
          ) : (
            <p className="exchange-rate-notice">
              Prices converted from INR using {exchangeRateDate} rates.
            </p>
          )
        )}

        <section className="inventory-section" id="inventory">
          <div className="section-heading">
            
{editingProduct && (
  <form className="product-form" onSubmit={handleUpdateProduct}>
    <h3>Edit Product</h3>

    <div className="form-grid">
      <label>
        Product Name *
        <input
          name="name"
          value={editData.name}
          onChange={handleEditChange}
          required
          maxLength={100}
        />
      </label>

      <label>
        Stock *
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          value={editData.stock}
          onChange={handleEditChange}
          required
        />
      </label>

      <label>
        Unit Price ({currencySymbol}) *
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={editData.price}
          onChange={handleEditChange}
          required
        />
      </label>
      
<label>
  Average Daily Sales
  <input
    name="averageDailySales"
    type="number"
    min="0"
    step="0.1"
    value={editData.averageDailySales}
    onChange={handleEditChange}
    required
  />
</label>

<label>
  Lead Time (days)
  <input
    name="leadTimeDays"
    type="number"
    min="0"
    step="1"
    value={editData.leadTimeDays}
    onChange={handleEditChange}
    required
  />
</label>

<label>
  Safety Stock (units)
  <input
    name="safetyStock"
    type="number"
    min="0"
    step="1"
    value={editData.safetyStock}
    onChange={handleEditChange}
    required
  />
</label>

    </div>

    {editError && (
      <p className="error-message">{editError}</p>
    )}

    <button
      className="add-button"
      type="submit"
      disabled={updating}
    >
      {updating ? "Updating..." : "Save Changes"}
    </button>

    <button
      className="cancel-button"
      type="button"
      onClick={() => setEditingProduct(null)}
    >
      Cancel
    </button>
  </form>
)}

            <div>
              <h2>Inventory Overview</h2>
              <p>Review your products and current stock levels.</p>
            </div>
            <div className="inventory-actions">
  <div className="search-box">
    <Search size={17} />
    <input
      placeholder="Search products..."
      aria-label="Search products"
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  </div>

  <button
  type="button"
  className="add-button"
  onClick={() => {
    setFormError("");
    setShowForm((previous) => !previous);
  }}
>
  + Add Product
</button>
            
          </div>

       
  
{showForm && (
  <form className="product-form" onSubmit={handleAddProduct}>
    <h3>Add New Product</h3>

    <div className="form-grid">
      <label>
        Product Name *
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="e.g. Wireless Keyboard"
        />
      </label>

      <label>
        Initial Stock *
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          value={formData.stock}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Unit Price ({currencySymbol}) *
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Average Daily Sales
        <input
          name="averageDailySales"
          type="number"
          min="0"
          value={formData.averageDailySales}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Lead Time (days)
        <input
          name="leadTimeDays"
          type="number"
          min="0"
          value={formData.leadTimeDays}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Safety Stock (units)
        <input
          name="safetyStock"
          type="number"
          min="0"
          value={formData.safetyStock}
          onChange={handleInputChange}
        />
      </label>
    </div>

    {formError && <p className="error-message">{formError}</p>}

    <button className="add-button" type="submit" disabled={saving}>
      {saving ? "Saving..." : "Save Product"}
    </button>
  </form>
)}
          </div>
          

          {loading ? (
            <p className="empty-state">Loading inventory...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="empty-state"> {searchTerm ? "No matching products found." : "No products found."}</p>
          ) : (
           
<div className="inventory-grid">
  {filteredProducts.map((product) => {
    const insight = inventorySummary.find(
      (item) => String(item.id) === String(product._id)
    );
    const suggestedOrder = Math.ceil(insight?.suggestedOrder ?? 0);

    return (
      <div className="product-card" key={product._id}>
        <div className="product-card-header">
          <div className="product-cell">
            <div className="product-icon">
              <Package size={19} />
            </div>
            <strong>{product.name || "Unnamed Product"}</strong>
          </div>

          <span
            className={`stock-badge ${
              product.stock <= lowStockThreshold ? "low" : "healthy"
            }`}
          >
            {product.stock <= lowStockThreshold ? "Low stock" : "In stock"}
          </span>
        </div>

        <div className="product-card-details">
          <div>
            <span>Unit Price</span>
            <strong>{formatCurrency(product.price ?? 0)}</strong>
          </div>

          <div>
            <span>Available Stock</span>
            <strong>{product.stock ?? 0} units</strong>
          </div>

          <div>
            <span>Days Remaining</span>
            <strong>
              {insight?.daysRemaining == null
                ? "N/A"
                : `${insight.daysRemaining.toFixed(1)} days`}
            </strong>
          </div>

          <div>
            <span>Suggested Order</span>
            <strong>{suggestedOrder} units</strong>
          </div>
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="edit-button"
            onClick={() => startEditing(product)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => handleDeleteProduct(product._id)}
          >
            Delete
          </button>

          <button
            type="button"
            className="order-button"
            disabled={
              orderingProductId === product._id ||
              suggestedOrder <= 0
            }
            onClick={() => handlePlaceOrder(product, suggestedOrder)}
          >
            {orderingProductId === product._id
              ? "Placing Order..."
              : suggestedOrder > 0
                ? `Order ${suggestedOrder}`
                : "No Order Needed"}
          </button>

          <button
            type="button"
            className="sale-button"
            onClick={() => openSaleModal(product)}
          >
            Record Sale
          </button>
        </div>
      </div>
    );
  })}
</div>
)}
{showSaleModal && saleProduct && (
  <div className="modal-overlay">
    <div className="sale-modal">
      <h2>Record Sale</h2>

      <p>
        Product: <strong>{saleProduct.name}</strong>
      </p>

      <p>
        Available Stock: <strong>{saleProduct.stock}</strong>
      </p>

      <label>
        Quantity Sold
        <input
          type="number"
          min="1"
          step="1"
          value={saleQuantity}
          onChange={(event) => {
            setSaleQuantity(event.target.value);
            setError("");
          }}
          placeholder="Enter quantity"
        />
      </label>

      {error && <p className="error-message">{error}</p>}

      <div className="modal-actions">
        <button
          type="button"
          onClick={submitSale}
          disabled={saleSaving}
        >
          {saleSaving ? "Recording..." : "Confirm Sale"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowSaleModal(false);
            setSaleProduct(null);
            setError("");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

          )}
        </section>
          </>
        ) : currentPage === "orders" ? (
          <OrdersPage
            formatCurrency={formatCurrency}
            onRestocked={refreshDashboardData}
            exchangeRateError={exchangeRateError}
          />
        ) : (
          <SettingsPage
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onSave={saveSettings}
            onReset={resetSettings}
            onRetryExchangeRates={() => setExchangeRateRetry((retry) => retry + 1)}
            exchangeRate={exchangeRate}
            exchangeRateDate={exchangeRateDate}
            exchangeRateLoading={exchangeRateLoading}
            exchangeRateError={exchangeRateError}
          />
        )}
      </main>
    </div>

        
  );

}
export default App;