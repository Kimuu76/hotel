/** @format */

const sql = require("mssql");

const createSalesTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sales') 
            BEGIN
                CREATE TABLE Sales (
                    sale_id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    food_name NVARCHAR(255) NOT NULL,
                    quantity INT NOT NULL,
                    total_price DECIMAL(10,2) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Sales_Business FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
                )
            END
        `;
		await sql.query(query);
		console.log("Sales table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Sales table:", error);
	}
};

module.exports = createSalesTable;
