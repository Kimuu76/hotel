/** @format */

const sql = require("mssql");

const createBusinessTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Businesses')
            BEGIN
                CREATE TABLE Businesses (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL UNIQUE,
                    email NVARCHAR(255) UNIQUE NOT NULL,
                    phone NVARCHAR(50) NULL,
                    address NVARCHAR(255) NULL,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
            BEGIN
                CREATE TABLE Users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    email NVARCHAR(255) UNIQUE NOT NULL,
                    password NVARCHAR(255) NOT NULL,
                    role NVARCHAR(50) CHECK (role IN ('admin', 'salesperson', 'user')) NOT NULL DEFAULT 'user',
                    business_id INT NULL,
                    FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE SET NULL
                )
            END
        `;
		await sql.query(query);
		console.log("Businesses and Users tables checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating tables:", error);
	}
};

module.exports = createBusinessTable;

/** @format 

const sql = require("mssql");

const createBusinessTable = async () => {
	try {
		const query = `
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Businesses')
            BEGIN
                CREATE TABLE Businesses (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL UNIQUE,
                    email NVARCHAR(255) UNIQUE NOT NULL,
                    phone NVARCHAR(50) NULL,
                    address NVARCHAR(255) NULL,
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
        `;
		await sql.query(query);
		console.log("Businesses table checked/created successfully.");
	} catch (error) {
		console.error("❌ Error creating Businesses table:", error);
	}
};

module.exports = createBusinessTable;*/
