/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure auth middleware is used

// Protect this route with authentication middleware
router.get(
	"/stats",
	authMiddleware(["admin", "salesperson"]),
	async (req, res) => {
		try {
			const { business_id } = req.user;
			if (!business_id) {
				return res.status(400).json({ error: "Business ID is required" });
			}

			const pool = await sql.connect();

			// Fetch aggregated data efficiently
			const statsResult = await pool
				.request()
				.input("business_id", sql.Int, business_id).query(`
				SELECT 
					COALESCE((SELECT SUM(total_price) FROM sales WHERE business_id = @business_id), 0) AS totalSales,
					COALESCE((SELECT SUM(amount) FROM expenses WHERE business_id = @business_id), 0) AS totalExpenses,
					COALESCE((SELECT SUM(price) FROM purchases WHERE business_id = @business_id), 0) AS totalPurchases
			`);

			const { totalSales, totalExpenses, totalPurchases } =
				statsResult.recordset[0] || {};

			const totalProfit = totalSales - (totalExpenses + totalPurchases);

			// Fetch monthly sales and purchases
			const monthlyDataResult = await pool
				.request()
				.input("business_id", sql.Int, business_id).query(`
				SELECT 
					FORMAT(s.created_at, 'yyyy-MM') AS month, 
					SUM(s.total_price) AS monthlySales, 
					COALESCE((
						SELECT SUM(p.price) 
						FROM purchases p 
						WHERE FORMAT(p.created_at, 'yyyy-MM') = FORMAT(s.created_at, 'yyyy-MM') 
						AND p.business_id = @business_id
					), 0) AS monthlyPurchases
				FROM sales s
				WHERE s.business_id = @business_id
				GROUP BY FORMAT(s.created_at, 'yyyy-MM')
				ORDER BY month
			`);

			const monthlyData = monthlyDataResult.recordset || [];

			res.json({
				totalSales,
				totalExpenses,
				totalPurchases,
				totalProfit,
				monthlyData,
			});
		} catch (error) {
			console.error("Database Query Error:", error);
			res
				.status(500)
				.json({ error: "Internal Server Error", details: error.message });
		}
	}
);

router.get(
	"/business-name",
	authMiddleware(["admin", "salesperson"]),
	async (req, res) => {
		try {
			const { business_id } = req.user;

			if (!business_id) {
				return res.status(400).json({ error: "Business ID is required" });
			}

			const pool = await sql.connect();
			const businessResult = await pool
				.request()
				.input("business_id", sql.Int, business_id)
				.query("SELECT name FROM businesses WHERE id = @business_id");

			if (!businessResult.recordset.length) {
				return res.status(404).json({ error: "Business not found" });
			}

			const { name } = businessResult.recordset[0];

			res.json({ businessName: name });
		} catch (error) {
			console.error("Database Query Error:", error);
			res
				.status(500)
				.json({ error: "Internal Server Error", details: error.message });
		}
	}
);

module.exports = router;
