/** @format */

const sql = require("mssql");

const createExpenseTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Expenses') 
            BEGIN
                CREATE TABLE Expenses (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    description NVARCHAR(255) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Expenses_Business FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
                )
            END
        `;
		await sql.query(query);
		console.log("Expenses table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Expenses table:", error);
	}
};

module.exports = createExpenseTable;
