/** @format */

const express = require("express");
const {
	insertReceipt,
	getReceiptsByBusiness,
} = require("../models/receiptsModel"); // ✅ Added getReceiptsByBusiness
const router = express.Router();

// Add a new receipt
router.post("/add-receipt", async (req, res) => {
	const { sale_id, total_price, receipt_text, business_id } = req.body; // ✅ Added business_id

	// Validate request body
	if (!sale_id || !total_price || !receipt_text || !business_id) {
		return res.status(400).json({ error: "All fields are required." });
	}

	try {
		const result = await insertReceipt(
			sale_id,
			total_price,
			receipt_text,
			business_id
		);
		res.status(201).json(result);
	} catch (error) {
		console.error("Error adding receipt:", error);
		res
			.status(500)
			.json({ error: "Failed to add receipt", details: error.message });
	}
});

// Get receipts for a specific business
router.get("/", async (req, res) => {
	const { business_id } = req.query;

	if (!business_id) {
		return res.status(400).json({ error: "Business ID is required." });
	}

	try {
		const receipts = await getReceiptsByBusiness(business_id);
		res.status(200).json(receipts);
	} catch (error) {
		console.error("Error fetching receipts:", error);
		res
			.status(500)
			.json({ error: "Failed to fetch receipts", details: error.message });
	}
});

module.exports = router;
