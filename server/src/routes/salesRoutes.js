/** @format */

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Record a sale with multiple items and reduce stock
router.post("/add", async (req, res) => {
	const { items, business_id } = req.body; // Expecting an array of { food_name, quantity }

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required." });
	}
	if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ error: "Items array is required." });
	}

	let transaction;

	try {
		const pool = await sql.connect();
		transaction = new sql.Transaction(pool);
		await transaction.begin();

		let totalPrice = 0;
		let receiptDetails = [];
		let saleId = null; // Store sale_id

		for (const item of items) {
			const { food_name, quantity } = item;

			// Ensure food_name is valid
			if (!food_name) {
				throw new Error("Error: food_name is null or undefined!");
			}

			// Get food details
			const foodQuery = await transaction
				.request()
				.input("food_name", sql.NVarChar, food_name)
				.input("business_id", sql.Int, business_id)
				.query(
					"SELECT price, stock FROM Food WHERE name = @food_name AND business_id = @business_id"
				);

			if (foodQuery.recordset.length === 0) {
				throw new Error(`Food item "${food_name}" not found.`);
			}

			const { price, stock } = foodQuery.recordset[0];

			// Check stock
			if (stock < quantity) {
				throw new Error(`Not enough stock for "${food_name}".`);
			}

			const itemTotal = price * quantity;
			totalPrice += itemTotal;

			// Reduce stock
			await transaction
				.request()
				.input("food_name", sql.NVarChar, food_name)
				.input("quantity", sql.Int, quantity)
				.input("business_id", sql.Int, business_id)
				.query(
					"UPDATE Food SET stock = stock - @quantity WHERE name = @food_name AND business_id = @business_id"
				);

			// Insert into Sales table and get sale_id
			const saleResult = await transaction
				.request()
				.input("food_name", sql.NVarChar, food_name)
				.input("quantity", sql.Int, quantity)
				.input("total_price", sql.Decimal(10, 2), itemTotal)
				.input("business_id", sql.Int, business_id)
				.query(
					`INSERT INTO Sales (food_name, quantity, total_price, business_id) 
					OUTPUT INSERTED.sale_id 
					VALUES (@food_name, @quantity, @total_price, @business_id)`
				);

			// Retrieve sale_id from the first insert
			if (!saleId) {
				saleId = saleResult.recordset[0].sale_id;
			}

			receiptDetails.push(`
<tr>
    <td>${food_name}</td>
    <td>${quantity}</td>
    <td>KES ${price.toFixed(2)}</td>
    <td>KES ${itemTotal.toFixed(2)}</td>
</tr>
`);
		}

		// Ensure saleId is valid
		if (!saleId) {
			throw new Error("Failed to retrieve sale ID.");
		}

		// Insert receipt into Receipts table
		const receiptText = receiptDetails.join("\n");
		await transaction
			.request()
			.input("sale_id", sql.Int, saleId)
			.input("total_price", sql.Decimal(10, 2), totalPrice)
			.input("receipt_text", sql.NVarChar, receiptText)
			.input("business_id", sql.Int, business_id)
			.query(
				`INSERT INTO Receipts (sale_id, total_price, receipt_text, business_id) 
				VALUES (@sale_id, @total_price, @receipt_text, @business_id)`
			);

		await transaction.commit();

		res.status(201).json({
			message: "Sale recorded successfully!",
			receipt: {
				saleId,
				items,
				totalPrice,
			},
		});
	} catch (error) {
		console.error(error);
		if (transaction) await transaction.rollback();
		res.status(500).json({ error: error.message || "Failed to process sale" });
	}
});

// Get all sales with receipt info for a specific business
router.get("/", async (req, res) => {
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required." });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("business_id", sql.Int, business_id)
			.query(
				`SELECT S.sale_id, S.food_name, S.quantity, S.total_price, R.receipt_text 
                 FROM Sales S
                 LEFT JOIN Receipts R ON S.sale_id = R.sale_id
                 WHERE S.business_id = @business_id`
			);

		res.status(200).json(result.recordset);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch sales" });
	}
});

// Get food list with prices for a specific business
router.get("/foods", async (req, res) => {
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required." });
	}

	try {
		const pool = await sql.connect();
		const result = await pool
			.request()
			.input("business_id", sql.Int, business_id)
			.query(
				"SELECT id, name, price FROM Food WHERE business_id = @business_id"
			);

		res.status(200).json(result.recordset);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch food items" });
	}
});

module.exports = router;
