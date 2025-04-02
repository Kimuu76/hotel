/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Define table-specific column mappings
const tableColumns = {
	sales:
		"sale_id AS id, food_name AS name, quantity, total_price AS amount, created_at",
	expenses: "id, description AS name, amount, created_at",
	purchases: "id, item AS name, quantity, price AS amount, created_at",
};

// Fetch reports based on type (sales, purchases, expenses) & filter
router.get("/:type", async (req, res) => {
	const { type } = req.params;
	const { filter, business_id } = req.query;

	// Validate input
	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required." });
	}
	if (!tableColumns[type]) {
		return res.status(400).json({ error: "Invalid report type" });
	}

	// Select appropriate columns for the given table type
	let query = `SELECT ${tableColumns[type]} FROM ${type} WHERE business_id = @business_id`;

	// Apply filters
	if (filter) {
		switch (filter) {
			case "daily":
				query += ` AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)`;
				break;
			case "weekly":
				query += ` AND DATEPART(week, created_at) = DATEPART(week, GETDATE()) 
                            AND YEAR(created_at) = YEAR(GETDATE())`;
				break;
			case "monthly":
				query += ` AND MONTH(created_at) = MONTH(GETDATE()) 
                            AND YEAR(created_at) = YEAR(GETDATE())`;
				break;
			case "yearly":
				query += ` AND YEAR(created_at) = YEAR(GETDATE())`;
				break;
			default:
				return res.status(400).json({ error: "Invalid filter option" });
		}
	}

	try {
		let pool = await sql.connect();
		let result = await pool
			.request()
			.input("business_id", sql.Int, business_id)
			.query(query);

		// If no data is found, return a message
		if (result.recordset.length === 0) {
			return res
				.status(200)
				.json({ message: "No data available for the selected filter." });
		}

		// Format data properly
		let data = result.recordset.map((row) => ({
			id: row.id || row.sale_id, // Use correct ID field
			name: row.name, // Mapped correctly due to aliasing
			date: new Date(row.created_at).toISOString().split("T")[0], // Convert to YYYY-MM-DD
			amount: row.amount, // Use the correct amount field
			quantity: row.quantity || null, // Include quantity if available
		}));

		return res.json(data);
	} catch (error) {
		console.error("Database Query Error:", error);
		return res
			.status(500)
			.json({ error: "Internal Server Error", details: error.message });
	}
});

module.exports = router;
