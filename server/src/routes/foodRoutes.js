/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Add new food item
router.post("/add", async (req, res) => {
	const { name, price, stock, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();
		await pool
			.request()
			.input("name", sql.NVarChar, name)
			.input("price", sql.Decimal(10, 2), price)
			.input("stock", sql.Int, stock)
			.input("business_id", sql.Int, business_id).query(`
				INSERT INTO Food (name, price, stock, business_id) 
				VALUES (@name, @price, @stock, @business_id)
			`);

		res.status(201).json({ message: "Food item added successfully!" });
	} catch (error) {
		console.error("Error adding food item:", error);
		res
			.status(500)
			.json({ error: "Database insertion failed", details: error.message });
	}
});

// Get all food items for a business
router.get("/", async (req, res) => {
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT * FROM Food WHERE business_id = @business_id ORDER BY name"
			);

		res.status(200).json(result.recordset);
	} catch (error) {
		console.error("Error fetching food items:", error);
		res
			.status(500)
			.json({ error: "Failed to fetch food items", details: error.message });
	}
});

// Update food item (ensures business ownership)
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { price, stock, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the food item belongs to the business before updating
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Food WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or food item not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.input("price", sql.Decimal(10, 2), price)
			.input("stock", sql.Int, stock).query(`
				UPDATE Food 
				SET price = @price, stock = @stock 
				WHERE id = @id AND business_id = @business_id
			`);

		res.status(200).json({ message: "Food item updated successfully!" });
	} catch (error) {
		console.error("Error updating food item:", error);
		res
			.status(500)
			.json({ error: "Failed to update food item", details: error.message });
	}
});

// Delete food item (ensures business ownership)
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the food item belongs to the business before deleting
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Food WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or food item not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.query("DELETE FROM Food WHERE id = @id");

		res.status(200).json({ message: "Food item deleted successfully!" });
	} catch (error) {
		console.error("Error deleting food item:", error);
		res
			.status(500)
			.json({ error: "Failed to delete food item", details: error.message });
	}
});

module.exports = router;
