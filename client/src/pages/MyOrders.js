import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaClipboardList } from "react-icons/fa";

export default function MyOrders() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/orders/my-orders`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setOrders(res.data);
      } catch (err) {
        setError("Failed to load your orders. Please try again.");
      }
    };

    fetchOrders();
  }, [auth.token]);

  return (
    <div className="min-h-screen px-4 py-10 text-burgundy bg-ivory animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading font-semibold mb-6 flex items-center gap-2">
          <FaClipboardList className="text-burgundy" />
          My Orders
        </h2>

        {error && (
          <div className="text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <p className="text-burgundy/70 text-center">
            You haven’t placed any orders yet.
          </p>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-[rgba(255,255,255,0.5)] border border-burgundy/10 backdrop-blur-md shadow-md shadow-burgundy/10 p-5 rounded-xl transition-all hover:shadow-lg hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                     Ref ID:{" "}
                    <span className="font-semibold">{order.reference_id}</span>
                  </span>
                  <span className="text-sm font-medium text-rose-600 capitalize">
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-burgundy/70 mb-2">
                  Placed on:{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

                <ul className="list-disc ml-5 text-sm text-burgundy/90">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
