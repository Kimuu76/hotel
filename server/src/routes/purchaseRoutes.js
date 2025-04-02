/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Add a purchase
router.post("/add", async (req, res) => {
	const { item, quantity, price, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("item", sql.NVarChar, item)
			.input("quantity", sql.Int, quantity)
			.input("price", sql.Decimal(10, 2), price)
			.input("business_id", sql.Int, business_id).query(`
				INSERT INTO Purchases (item, quantity, price, business_id) 
				OUTPUT INSERTED.* 
				VALUES (@item, @quantity, @price, @business_id)
			`);

		res.status(201).json(result.recordset[0]); // Return the inserted purchase
	} catch (error) {
		console.error("Error adding purchase:", error);
		res.status(500).json({ error: error.message });
	}
});

// Get all purchases for a business
router.get("/", async (req, res) => {
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("business_id", sql.Int, business_id).query(`
				SELECT * FROM Purchases 
				WHERE business_id = @business_id 
				ORDER BY created_at DESC
			`);
		res.status(200).json(result.recordset);
	} catch (error) {
		console.error("Error fetching purchases:", error);
		res.status(500).json({ error: error.message });
	}
});

// Update a purchase (ensuring business ownership)
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { item, quantity, price, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the purchase belongs to the business before updating
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Purchases WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or purchase not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.input("item", sql.NVarChar, item)
			.input("quantity", sql.Int, quantity)
			.input("price", sql.Decimal(10, 2), price).query(`
				UPDATE Purchases 
				SET item = @item, quantity = @quantity, price = @price 
				WHERE id = @id AND business_id = @business_id
			`);

		res.status(200).json({ message: "Purchase updated successfully" });
	} catch (error) {
		console.error("Error updating purchase:", error);
		res.status(500).json({ error: error.message });
	}
});

// Delete a purchase (ensuring business ownership)
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the purchase belongs to the business before deleting
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Purchases WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or purchase not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.query("DELETE FROM Purchases WHERE id = @id");

		res.status(200).json({ message: "Purchase deleted successfully" });
	} catch (error) {
		console.error("Error deleting purchase:", error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
