/** @format */

const sql = require("mssql");

const createPurchaseTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Purchases') 
            BEGIN
                CREATE TABLE Purchases (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    item NVARCHAR(255) NOT NULL,
                    quantity INT NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Purchases_Business FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
                )
            END
        `;
		await sql.query(query);
		console.log("Purchases table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Purchases table:", error);
	}
};

module.exports = createPurchaseTable;
