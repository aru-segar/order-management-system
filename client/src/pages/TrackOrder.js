import { useState } from 'react';
import axios from 'axios';

export default function TrackOrder() {
  const [refId, setRefId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const trimmedId = refId.trim();
    if (!trimmedId) {
      setError('Please enter a valid Reference ID.');
      setOrder(null);
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/track/${trimmedId}`);
      setOrder(res.data);
      setError('');
    } catch (err) {
      setOrder(null);
      setError(err.response?.data?.error || 'Order not found.');
    }
  };

  const statusSteps = ['placed', 'preparing', 'dispatched', 'delivered'];
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-ivory text-burgundy animate-fadeIn">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-heading font-bold mb-6 text-center">
          📦 Track Your Order
        </h1>

        {/* Input Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3 animate-fadeInScale">
          <input
            type="text"
            placeholder="Enter Reference ID"
            className="w-full sm:flex-1 border border-burgundy/30 px-4 py-2 rounded-lg bg-white/60 placeholder-burgundy/50 text-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy transition"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
          />
          <button
            onClick={handleTrack}
            disabled={!refId.trim()}
            className={`px-5 py-2 rounded-lg text-white font-semibold transition-all duration-300 ${
              !refId.trim()
                ? 'bg-burgundy/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-burgundy to-rose-600 hover:opacity-90'
            }`}
          >
            Track Order
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-center text-red-600 font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Result */}
        {order && (
          <section className="mt-6 p-6 bg-[rgba(255,255,255,0.45)] backdrop-blur-lg border border-burgundy/20 shadow-md shadow-burgundy/10 rounded-xl animate-slideUp">
            <p className="mb-1">
              <strong>Status:</strong>{' '}
              <span className="capitalize">{order.status}</span>
            </p>
            <p className="mb-1">
              <strong>Placed On:</strong>{' '}
              {new Date(order.created_at).toLocaleString()}
            </p>

            {/* Progress Bar */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">🚚 Order Progress</h2>
              <div className="flex justify-between items-center text-xs font-medium text-burgundy/80">
                {['Placed', 'Preparing', 'Dispatched', 'Delivered'].map((step, index) => {
                  const isCompleted = index <= currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-4 h-4 rounded-full mb-1 transition-all duration-300 ${
                          isCompleted ? 'bg-burgundy' : 'bg-burgundy/30'
                        }`}
                      ></div>
                      <span
                        className={`${
                          isCompleted ? 'text-burgundy' : 'text-burgundy/50'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-1 bg-burgundy/20 rounded-full mt-2 relative">
                <div
                  className="absolute h-1 bg-burgundy rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentStep + 1) * 25}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Order Items */}
            <h2 className="mt-6 font-semibold">🧾 Order Items:</h2>
            <ul className="list-disc ml-6 mt-1 text-sm text-burgundy/90 space-y-1">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
