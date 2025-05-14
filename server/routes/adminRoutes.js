const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

/// --- VIEW ALL ORDERS
router.get("/orders", verifyToken, requireRole("owner"), (req, res) => {
  const sql = `
    SELECT o.id, o.reference_id, o.status, o.created_at, u.name AS customer_name
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching orders" });
    res.json(rows);
  });
});

/// --- UPDATE ORDER STATUS
router.put("/orders/:id/status", verifyToken, requireRole("owner"), (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const valid = ["placed", "preparing", "dispatched", "delivered"];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    res.json({ message: "Status updated" });
  });
});

/// --- VIEW INGREDIENTS
router.get("/ingredients", verifyToken, requireRole("owner"), (req, res) => {
  db.query("SELECT * FROM ingredients ORDER BY name", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching ingredients" });
    res.json(rows);
  });
});

/// --- ADD INGREDIENT
router.post("/ingredients", verifyToken, requireRole("owner"), (req, res) => {
  const { name, stock_quantity } = req.body;

  db.query(
    "INSERT INTO ingredients (name, stock_quantity) VALUES (?, ?)",
    [name, stock_quantity],
    (err) => {
      if (err) return res.status(500).json({ error: "Add failed" });
      res.json({ message: "Ingredient added" });
    }
  );
});

/// --- UPDATE INGREDIENT
router.put("/ingredients/:id", verifyToken, requireRole("owner"), (req, res) => {
  const { name, stock_quantity } = req.body;

  db.query(
    "UPDATE ingredients SET name = ?, stock_quantity = ? WHERE id = ?",
    [name, stock_quantity, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Ingredient updated" });
    }
  );
});

/// --- GET ALL PIZZA TYPES
router.get("/pizzas", verifyToken, requireRole("owner"), (req, res) => {
  db.query("SELECT * FROM pizza_types", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching pizza types" });
    res.json(rows);
  });
});

/// --- ADD NEW PIZZA TYPE
router.post("/pizzas", verifyToken, requireRole("owner"), (req, res) => {
  const { name, price, ingredients } = req.body;

  db.query(
    "INSERT INTO pizza_types (name, price) VALUES (?, ?)",
    [name, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Pizza insert failed" });

      const pizzaTypeId = result.insertId;
      const values = ingredients.map(i => [
        pizzaTypeId,
        i.ingredient_id,
        i.quantity_required
      ]);

      db.query(
        "INSERT INTO pizza_ingredients (pizza_type_id, ingredient_id, quantity_required) VALUES ?",
        [values],
        (err) => {
          if (err) return res.status(500).json({ error: "Ingredient mapping failed" });
          res.json({ message: "Pizza type created" });
        }
      );
    }
  );
});

/// --- DELETE PIZZA TYPE
router.delete("/pizzas/:id", verifyToken, requireRole("owner"), (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM pizza_ingredients WHERE pizza_type_id = ?", [id], () => {
    db.query("DELETE FROM pizza_types WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "Pizza type deleted" });
    });
  });
});

/// --- ANALYTICS: Pizza Sales
router.get('/analytics/pizza-sales', verifyToken, requireRole('owner'), (req, res) => {
  const query = `
    SELECT pt.name, SUM(oi.quantity) AS total
    FROM order_items oi
    JOIN pizza_types pt ON pt.id = oi.pizza_type_id
    GROUP BY pt.name
    ORDER BY total DESC`;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Analytics error' });
    res.json(rows);
  });
});

/// --- ANALYTICS: Stock Levels
router.get('/analytics/stock-levels', verifyToken, requireRole('owner'), (req, res) => {
  db.query("SELECT name, stock_quantity FROM ingredients", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Stock error' });
    res.json(rows);
  });
});

module.exports = router;
