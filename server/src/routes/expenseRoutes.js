/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Add a new expense
router.post("/add", async (req, res) => {
	const { description, amount, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("description", sql.NVarChar, description)
			.input("amount", sql.Decimal(10, 2), amount)
			.input("business_id", sql.Int, business_id).query(`
				INSERT INTO Expenses (description, amount, business_id) 
				OUTPUT INSERTED.* 
				VALUES (@description, @amount, @business_id)
			`);

		res.status(201).json(result.recordset[0]);
	} catch (error) {
		console.error("Error adding expense:", error);
		res
			.status(500)
			.json({ error: "Internal Server Error", details: error.message });
	}
});

// Get all expenses for a business
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
				SELECT * FROM Expenses 
				WHERE business_id = @business_id 
				ORDER BY created_at DESC
			`);

		res.status(200).json(result.recordset);
	} catch (error) {
		console.error("Error fetching expenses:", error);
		res
			.status(500)
			.json({ error: "Internal Server Error", details: error.message });
	}
});

// Update an expense (ensures business ownership)
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { description, amount, business_id } = req.body;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the expense belongs to the business before updating
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Expenses WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or expense not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.input("description", sql.NVarChar, description)
			.input("amount", sql.Decimal(10, 2), amount).query(`
				UPDATE Expenses 
				SET description = @description, amount = @amount 
				WHERE id = @id AND business_id = @business_id
			`);

		res.status(200).json({ message: "Expense updated successfully" });
	} catch (error) {
		console.error("Error updating expense:", error);
		res
			.status(500)
			.json({ error: "Internal Server Error", details: error.message });
	}
});

// Delete an expense (ensures business ownership)
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required" });
	}

	try {
		const pool = await sql.connect();

		// Ensure the expense belongs to the business before deleting
		const checkResult = await pool
			.request()
			.input("id", sql.Int, id)
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id FROM Expenses WHERE id = @id AND business_id = @business_id"
			);

		if (checkResult.recordset.length === 0) {
			return res
				.status(403)
				.json({ error: "Unauthorized or expense not found" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.query("DELETE FROM Expenses WHERE id = @id");

		res.status(200).json({ message: "Expense deleted successfully" });
	} catch (error) {
		console.error("Error deleting expense:", error);
		res
			.status(500)
			.json({ error: "Internal Server Error", details: error.message });
	}
});

module.exports = router;
