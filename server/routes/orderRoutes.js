const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");

// ✅ Get all available pizzas
router.get("/pizzas", verifyToken, requireRole("customer"), (req, res) => {
  db.query("SELECT * FROM pizza_types", (err, result) => {
    if (err) return res.status(500).json({ error: "Error fetching pizzas" });
    res.json(result);
  });
});

// ✅ Place a new order
router.post("/place", verifyToken, requireRole("customer"), (req, res) => {
  const customerId = req.user.id;
  const { items } = req.body; // [{ pizzaTypeId, quantity }]
  const referenceId = uuidv4().slice(0, 8); // short ID

  const pizzaIds = items.map((p) => p.pizzaTypeId);

  const ingredientQuery = `
    SELECT pi.pizza_type_id, pi.ingredient_id, i.name AS ingredient_name, i.stock_quantity, pi.quantity_required
    FROM pizza_ingredients pi
    JOIN ingredients i ON i.id = pi.ingredient_id
    WHERE pi.pizza_type_id IN (?)`;

  db.query(ingredientQuery, [pizzaIds], (err, ingredients) => {
    if (err) return res.status(500).json({ error: "Ingredient check failed" });

    const stockMap = {};
    for (const { ingredient_id, stock_quantity } of ingredients) {
      stockMap[ingredient_id] = stock_quantity;
    }

    const required = {};
    for (const item of items) {
      for (const ing of ingredients.filter(i => i.pizza_type_id === item.pizzaTypeId)) {
        const needed = ing.quantity_required * item.quantity;
        required[ing.ingredient_id] = (required[ing.ingredient_id] || 0) + needed;

        if (required[ing.ingredient_id] > stockMap[ing.ingredient_id]) {
          return res.status(400).json({
            error: `Insufficient stock for ingredient: ${ing.ingredient_name}`
          });
        }
      }
    }

    const insertOrderQuery = `INSERT INTO orders (user_id, reference_id) VALUES (?, ?)`;
    db.query(insertOrderQuery, [customerId, referenceId], (err, result) => {
      if (err) return res.status(500).json({ error: "Order creation failed" });

      const orderId = result.insertId;
      const orderItems = items.map(i => [orderId, i.pizzaTypeId, i.quantity]);

      db.query(
        `INSERT INTO order_items (order_id, pizza_type_id, quantity) VALUES ?`,
        [orderItems],
        (err) => {
          if (err) return res.status(500).json({ error: "Order item insert failed" });

          for (const [ingredientId, qty] of Object.entries(required)) {
            db.query(
              `UPDATE ingredients SET stock_quantity = stock_quantity - ? WHERE id = ?`,
              [qty, ingredientId]
            );
          }

          return res.json({ message: "Order placed!", referenceId });
        }
      );
    });
  });
});

// ✅ Track order by reference ID
router.get("/track/:refId", (req, res) => {
  const refId = req.params.refId;

  const query = `
    SELECT o.id, o.status, o.created_at, p.name AS pizza_name, oi.quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN pizza_types p ON p.id = oi.pizza_type_id
    WHERE o.reference_id = ?`;

  db.query(query, [refId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Tracking failed" });
    if (rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const { status, created_at } = rows[0];
    const items = rows.map((r) => ({
      name: r.pizza_name,
      quantity: r.quantity,
    }));

    res.json({ status, created_at, items });
  });
});

// ✅ Get all orders of logged-in customer
router.get("/my-orders", verifyToken, requireRole("customer"), (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT o.reference_id, o.status, o.created_at, pt.name AS pizza_name, oi.quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN pizza_types pt ON pt.id = oi.pizza_type_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC`;

  db.query(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching orders" });
    if (rows.length === 0) return res.json([]);

    const ordersMap = {};
    for (const row of rows) {
      if (!ordersMap[row.reference_id]) {
        ordersMap[row.reference_id] = {
          reference_id: row.reference_id,
          status: row.status,
          created_at: row.created_at,
          items: [],
        };
      }
      ordersMap[row.reference_id].items.push({
        name: row.pizza_name,
        quantity: row.quantity,
      });
    }

    res.json(Object.values(ordersMap));
  });
});

module.exports = router;
