import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function OwnerDashboard() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [pizzaTypes, setPizzaTypes] = useState([]);
  const [pizzaSearch, setPizzaSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pizzaPage, setPizzaPage] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [pizzaSales, setPizzaSales] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);

  const [newPizza, setNewPizza] = useState({
    name: "",
    price: "",
    ingredients: [],
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/analytics/pizza-sales`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setPizzaSales(res.data));

    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/analytics/stock-levels`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setStockLevels(res.data));
  }, [auth.token]);

  const fetchAll = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setOrders(res.data));

    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/ingredients`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => {
        setIngredients(res.data);
        setNewPizza((prev) => ({
          ...prev,
          ingredients: res.data.map((i) => ({
            ingredient_id: i.id,
            quantity_required: 0,
          })),
        }));
      });

    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/pizzas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setPizzaTypes(res.data));
  };

  useEffect(fetchAll, [auth.token]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/orders/${id}/status`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage("Order status updated!");
      fetchAll();
    } catch {
      setMessage("Failed to update status");
    }
  };

  const handlePizzaCreate = async () => {
    const selectedIngredients = newPizza.ingredients.filter(
      (i) => i.quantity_required > 0
    );
    if (!newPizza.name || !newPizza.price || selectedIngredients.length === 0) {
      setMessage("Please fill all fields and select ingredients.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/pizzas`,
        {
          ...newPizza,
          ingredients: selectedIngredients,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage("Pizza added!");
      fetchAll();
      setNewPizza({
        name: "",
        price: "",
        ingredients: ingredients.map((i) => ({
          ingredient_id: i.id,
          quantity_required: 0,
        })),
      });
    } catch {
      setMessage("Failed to add pizza");
    }
  };

  const handlePizzaDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/pizzas/${id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      fetchAll();
    } catch {
      setMessage("Delete failed");
    }
  };

  const pizzasPerPage = 5;
  const ordersPerPage = 5;

  const filteredOrders = orders.filter((order) =>
    orderStatusFilter === "all" ? true : order.status === orderStatusFilter
  );

  const sortedPizzas = [...pizzaTypes]
    .filter((pizza) =>
      pizza.name.toLowerCase().includes(pizzaSearch.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

  const paginatedPizzas = sortedPizzas.slice(
    pizzaPage * pizzasPerPage,
    (pizzaPage + 1) * pizzasPerPage
  );

  const paginatedOrders = filteredOrders.slice(
    orderPage * ordersPerPage,
    (orderPage + 1) * ordersPerPage
  );

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-burgundy">
        🍕 Owner Dashboard
      </h2>
      {message && <div className="mb-4 text-green-600">{message}</div>}

      {/* --- Orders Section --- */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">📦 Orders</h3>
        <select
          className="mb-3 border px-3 py-1 rounded"
          value={orderStatusFilter}
          onChange={(e) => setOrderStatusFilter(e.target.value)}
        >
          {["all", "placed", "preparing", "dispatched", "delivered"].map(
            (s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            )
          )}
        </select>

        <table className="w-full text-sm border border-burgundy/20 rounded overflow-hidden">
          <thead className="bg-burgundy text-white">
            <tr>
              <th className="p-2 text-left">Ref ID</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Update</th>
            </tr>
          </thead>
          <tbody className="bg-white text-burgundy">
            {paginatedOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.reference_id}</td>
                <td className="p-2">{o.customer_name}</td>
                <td className="p-2 capitalize">{o.status}</td>
                <td className="p-2">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    {["placed", "preparing", "dispatched", "delivered"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Order Pagination */}
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setOrderPage((prev) => prev - 1)}
            disabled={orderPage === 0}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setOrderPage((prev) => prev + 1)}
            disabled={(orderPage + 1) * ordersPerPage >= filteredOrders.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* 🍅 Ingredients */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">🥫 Ingredients</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-burgundy/90">
          {ingredients.map((i) => (
            <li key={i.id} className="bg-white/60 px-4 py-2 border rounded">
              {i.name} — Stock: {i.stock_quantity}
            </li>
          ))}
        </ul>
      </div>

      {/* 🍕 Pizza Types */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">🍕 Pizza Types</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <input
            className="flex-1 border border-burgundy/20 px-4 py-2 rounded bg-white/60 placeholder-burgundy/60 focus:outline-none focus:ring-2 focus:ring-burgundy"
            placeholder="Search pizza..."
            value={pizzaSearch}
            onChange={(e) => setPizzaSearch(e.target.value)}
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="text-sm font-medium text-burgundy underline"
          >
            Sort by Price: {sortOrder === "asc" ? "Low → High" : "High → Low"}
          </button>
        </div>

        <ul className="bg-white rounded-lg shadow border border-burgundy/10 divide-y text-sm">
          {paginatedPizzas.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center px-4 py-3"
            >
              <span>
                {p.name} — Rs. {p.price}
              </span>
              <button
                onClick={() => handlePizzaDelete(p.id)}
                className="text-red-500 hover:underline text-xs"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Pizza Pagination */}
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setPizzaPage((prev) => prev - 1)}
            disabled={pizzaPage === 0}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPizzaPage((prev) => prev + 1)}
            disabled={(pizzaPage + 1) * pizzasPerPage >= sortedPizzas.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ➕ Add New Pizza */}
      <div className="p-6 bg-white/70 border border-burgundy/10 rounded-xl backdrop-blur-md shadow-sm">
        <h4 className="text-lg font-semibold mb-4">➕ Add New Pizza</h4>
        <input
          type="text"
          placeholder="Pizza Name"
          value={newPizza.name}
          onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
          className="w-full mb-3 px-4 py-2 border border-burgundy/20 rounded bg-white/60 placeholder-burgundy/50"
        />
        <input
          type="number"
          placeholder="Price"
          value={newPizza.price}
          onChange={(e) => setNewPizza({ ...newPizza, price: e.target.value })}
          className="w-full mb-4 px-4 py-2 border border-burgundy/20 rounded bg-white/60 placeholder-burgundy/50"
        />

        <div className="mb-4">
          <h5 className="font-medium mb-2">🧂 Ingredients</h5>
          <div className="grid grid-cols-2 gap-3">
            {ingredients.map((ingredient, idx) => (
              <div key={ingredient.id} className="flex items-center gap-3">
                <label className="flex-1 text-sm">{ingredient.name}</label>
                <input
                  type="number"
                  min="0"
                  value={newPizza.ingredients[idx]?.quantity_required || 0}
                  onChange={(e) => {
                    const updated = [...newPizza.ingredients];
                    updated[idx] = {
                      ...updated[idx],
                      ingredient_id: ingredient.id,
                      quantity_required: parseInt(e.target.value) || 0,
                    };
                    setNewPizza({ ...newPizza, ingredients: updated });
                  }}
                  className="w-20 px-2 py-1 border border-burgundy/20 rounded bg-white/60"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handlePizzaCreate}
          className="mt-2 bg-burgundy text-white font-medium px-5 py-2 rounded hover:opacity-90 transition"
        >
          Add Pizza
        </button>
      </div>

          {/* 📊 Pizza Sales Bar Chart */}
    <div className="mt-12 bg-white/70 backdrop-blur-md border border-burgundy/10 p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-burgundy mb-4">📊 Pizza Sales Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={pizzaSales}>
          <XAxis dataKey="name" stroke="#7c2d12" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#7c2d12" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* 🧮 Ingredient Stock Pie Chart */}
    <div className="mt-10 bg-white/70 backdrop-blur-md border border-burgundy/10 p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-burgundy mb-4">🥫 Ingredient Stock Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={stockLevels}
            dataKey="stock_quantity"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {stockLevels.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={["#c084fc", "#60a5fa", "#facc15", "#f87171"][index % 4]}
              />
            ))}
          </Pie>
          <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

  );
}
