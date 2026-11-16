import { useEffect, useState } from "react";
import api from "../services/api";

function OrdersPage({ onRestocked, formatCurrency, exchangeRateError }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restockingId, setRestockingId] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (loadError) {
        console.error("Order history error:", loadError);
        setError(
          loadError.response?.data?.message || "Could not load order history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function handleRestock(order) {
    setRestockingId(order._id);
    setError("");

    try {
      await api.post(`/orders/${order._id}/restock`);
      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder._id !== order._id)
      );
      await onRestocked();
    } catch (restockError) {
      console.error("Restock order error:", restockError);
      setError(
        restockError.response?.data?.message ||
          "Could not restock this order. Please try again."
      );
    } finally {
      setRestockingId(null);
    }
  }

  return (
    <section className="orders-section">
      <header className="orders-header">
        <div>
          <p className="eyebrow">PURCHASING</p>
          <h1>Orders</h1>
          <p>Review purchase orders placed from inventory suggestions.</p>
        </div>
      </header>

      {exchangeRateError && (
        <p className="error-message" role="alert">
          {exchangeRateError}
        </p>
      )}
      {error ? (
        <p className="error-message">{error}</p>
      ) : loading ? (
        <p className="empty-state">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders have been placed yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div>
                <strong>{order.productName}</strong>
                <span>Placed {new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span>Quantity</span>
                <strong>{order.quantity} units</strong>
              </div>
              <div>
                <span>Order value</span>
                <strong>
                  {formatCurrency(order.quantity * order.unitPrice)}
                </strong>
              </div>
              <span className="order-status">{order.status}</span>
              <button
                type="button"
                className="restock-button"
                onClick={() => handleRestock(order)}
                disabled={restockingId === order._id}
              >
                {restockingId === order._id ? "Restocking..." : "Restock"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
