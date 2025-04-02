/** @format */

const sql = require("mssql");

const createReceiptsTable = async () => {
	try {
		const pool = await sql.connect();
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Receipts')
            BEGIN
                CREATE TABLE Receipts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    sale_id INT NOT NULL,
                    total_price DECIMAL(10,2) NOT NULL,
                    receipt_text NVARCHAR(MAX) NOT NULL,
                    receipt_date DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Receipts_Business FOREIGN KEY (business_id) 
                        REFERENCES Businesses(id) ON DELETE CASCADE,
                    CONSTRAINT FK_Receipts_Sales FOREIGN KEY (sale_id) 
                        REFERENCES Sales(sale_id) ON DELETE NO ACTION
                )
            END
        `;
		await pool.request().query(query);
		console.log("✅ Receipts table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Receipts table:", error);
	}
};

// Function to delete receipts before deleting a sale
const deleteReceiptsBySaleId = async (sale_id) => {
	try {
		const pool = await sql.connect();
		await pool
			.request()
			.input("sale_id", sql.Int, sale_id)
			.query(`DELETE FROM Receipts WHERE sale_id = @sale_id`);

		console.log(`🗑️ Receipts for sale_id ${sale_id} deleted successfully.`);
	} catch (error) {
		console.error("❌ Error deleting receipts:", error);
	}
};

// Function to insert a new receipt
const insertReceipt = async (
	business_id,
	sale_id,
	total_price,
	receipt_text
) => {
	try {
		const pool = await sql.connect();

		// Check if sale_id exists and belongs to the business
		const salesCheck = await pool
			.request()
			.input("sale_id", sql.Int, sale_id)
			.input("business_id", sql.Int, business_id).query(`
                SELECT COUNT(*) AS count 
                FROM Sales 
                WHERE sale_id = @sale_id AND business_id = @business_id
            `);

		const salesCount = salesCheck.recordset[0]?.count || 0;
		if (salesCount === 0) {
			return {
				message:
					"⚠️ No valid sale found for this sale_id and business. Please check your inputs.",
			};
		}

		// Insert receipt
		const query = `
            INSERT INTO Receipts (business_id, sale_id, total_price, receipt_text)
            VALUES (@business_id, @sale_id, @total_price, @receipt_text)
        `;

		await pool
			.request()
			.input("business_id", sql.Int, business_id)
			.input("sale_id", sql.Int, sale_id)
			.input("total_price", sql.Decimal(10, 2), total_price)
			.input("receipt_text", sql.NVarChar(sql.MAX), receipt_text)
			.query(query);

		return { message: "✅ Receipt created successfully." };
	} catch (error) {
		console.error("❌ Error inserting receipt:", error);
		return { error: "Failed to create receipt." };
	}
};

module.exports = { createReceiptsTable, insertReceipt, deleteReceiptsBySaleId };
