/** @format */

const sql = require("mssql");

const createFoodTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Food') 
            BEGIN
                CREATE TABLE Food (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    name NVARCHAR(255) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    stock INT NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Food_Business FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
                )
            END
        `;
		await sql.query(query);
		console.log("Food table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Food table:", error);
	}
};

module.exports = createFoodTable;
