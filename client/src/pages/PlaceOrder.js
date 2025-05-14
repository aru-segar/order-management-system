import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PlaceOrder() {
  const { auth } = useAuth();
  const [pizzas, setPizzas] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/orders/pizzas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setPizzas(res.data))
      .catch(() => setMessage('❌ Failed to load pizzas.'))
      .finally(() => setLoading(false));
  }, [auth.token]);

  const updateCart = (pizzaTypeId, quantity) => {
    if (isNaN(quantity) || quantity < 0) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.pizzaTypeId === pizzaTypeId);
      if (existing) {
        return prev
          .map((c) =>
            c.pizzaTypeId === pizzaTypeId ? { ...c, quantity } : c
          )
          .filter((c) => c.quantity > 0);
      } else if (quantity > 0) {
        return [...prev, { pizzaTypeId, quantity }];
      }
      return prev;
    });
  };

  const removeFromCart = (pizzaTypeId) => {
    setCart((prev) => prev.filter((c) => c.pizzaTypeId !== pizzaTypeId));
  };

  const hasOutOfStockInCart = cart.some((item) => {
    const pizza = pizzas.find((p) => p.id === item.pizzaTypeId);
    return !pizza?.inStock;
  });

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const pizza = pizzas.find((p) => p.id === item.pizzaTypeId);
      return total + (pizza?.price || 0) * item.quantity;
    }, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return setMessage('❌ Please select at least one pizza.');
    if (hasOutOfStockInCart) return setMessage('❌ Some pizzas are out of stock.');

    try {
      setPlacing(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/orders/place`,
        { items: cart },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMessage(`✅ Order placed! Reference ID: ${res.data.referenceId}`);
      setCart([]);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Order failed. Try again.'}`);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-ivory text-burgundy animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-heading font-semibold mb-6 text-center">
          🍕 Place Your Order
        </h2>

        {loading ? (
          <div className="text-center text-burgundy/60">Loading pizzas...</div>
        ) : (
          <>
            {pizzas.map((pizza) => (
              <div
                key={pizza.id}
                className={`mb-5 p-5 rounded-xl border border-burgundy/10 shadow-md shadow-burgundy/5 transition-all hover:shadow-lg ${
                  pizza.inStock
                    ? 'bg-white/40 backdrop-blur-md'
                    : 'bg-gray-100/60 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-medium text-lg">{pizza.name}</h4>
                    <p className="text-sm">Rs. {pizza.price}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    disabled={!pizza.inStock}
                    placeholder="Qty"
                    className="w-20 px-3 py-1 border border-burgundy/20 rounded-md bg-white/50 placeholder-burgundy/40"
                    value={cart.find((c) => c.pizzaTypeId === pizza.id)?.quantity || ''}
                    onChange={(e) =>
                      updateCart(pizza.id, parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <ul className="text-sm ml-2 list-disc text-burgundy/80">
                  {pizza.ingredients?.map((ing) => (
                    <li key={ing.name}>
                      {ing.name} — Stock: {ing.stock_quantity}
                    </li>
                  ))}
                </ul>
                {!pizza.inStock && (
                  <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                )}
              </div>
            ))}

            {/* Cart & Submit */}
            <button
              onClick={placeOrder}
              disabled={placing || hasOutOfStockInCart}
              className={`w-full py-2 mt-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                placing || hasOutOfStockInCart
                  ? 'bg-burgundy/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-burgundy to-rose-600 hover:opacity-90'
              }`}
            >
              {placing ? 'Placing Order...' : 'Submit Order'}
            </button>

            {message && (
              <p
                className={`mt-4 text-center font-medium text-sm ${
                  message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message}
              </p>
            )}

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <h4 className="text-lg font-semibold mb-2">🛒 Your Cart</h4>
                <ul className="text-sm text-burgundy space-y-2">
                  {cart.map((item) => {
                    const pizza = pizzas.find((p) => p.id === item.pizzaTypeId);
                    return (
                      <li key={item.pizzaTypeId} className="flex justify-between items-center">
                        <span>
                          {pizza?.name} × {item.quantity} = Rs. {pizza?.price * item.quantity}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateCart(item.pizzaTypeId, item.quantity + 1)
                            }
                            className="text-xs bg-gray-200 px-2 rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() =>
                              updateCart(item.pizzaTypeId, item.quantity - 1)
                            }
                            className="text-xs bg-gray-200 px-2 rounded"
                          >
                            -
                          </button>
                          <button
                            onClick={() => removeFromCart(item.pizzaTypeId)}
                            className="text-xs bg-red-500 text-white px-2 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="text-right mt-3 font-medium text-base text-burgundy">
                  Total: Rs. {getTotal()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
