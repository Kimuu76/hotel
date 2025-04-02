/** @format */

const sql = require("mssql");

// Function to create Users table if not exists
const createUsersTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users') 
            BEGIN
                CREATE TABLE Users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    business_id INT NOT NULL,
                    name NVARCHAR(100) NOT NULL,
                    email NVARCHAR(100) UNIQUE NOT NULL,
                    password NVARCHAR(255) NOT NULL,
                    role NVARCHAR(20) NOT NULL DEFAULT 'salesperson',
                    reset_token NVARCHAR(255) NULL,
                    reset_expires DATETIME NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Users_Business FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
                )
            END
             ELSE
            BEGIN
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'reset_token')
                    ALTER TABLE Users ADD reset_token NVARCHAR(255) NULL;

                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'reset_expires')
                    ALTER TABLE Users ADD reset_expires DATETIME NULL;
            END
        `;
		await sql.query(query);
		console.log("Users table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Users table:", error);
	}
};

module.exports = createUsersTable;
