/** @format */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");
const morgan = require("morgan");
require("dotenv").config();

const createBusinessTable = require("./models/businessesModel");
const createFoodTable = require("./models/foodModel");
const createSalesTable = require("./models/salesModel");
const createPurchaseTable = require("./models/purchaseModel");
const createExpenseTable = require("./models/expenseModel");
//const createUsersTable = require("./models/userModel");
const { createReceiptsTable } = require("./models/receiptsModel");

const foodRoutes = require("./routes/foodRoutes");
const salesRoutes = require("./routes/salesRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportsRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const receiptRoutes = require("./routes/receiptRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Connect to Database
const dbConfig = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	server: process.env.DB_SERVER,
	database: process.env.DB_NAME,
	options: { encrypt: false },
};

sql
	.connect(dbConfig)
	.then(() => {
		console.log("Connected to MSSQL Database");
		createBusinessTable();
		createFoodTable();
		createSalesTable();
		createReceiptsTable();
		createPurchaseTable();
		createExpenseTable();
		//createUsersTable();
	})
	.catch((err) => {
		console.error("❌ Database Connection Error:", err);
		process.exit(1); // Exit the process if DB connection fails
	});

// Use Routes
app.use("/api/food", foodRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/receipts", receiptRoutes);

const PORT = 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
	res.send("✅ Backend is running successfully!");
});

// Graceful Shutdown
process.on("SIGINT", async () => {
	console.log("🔴 Shutting down server...");
	await sql.close();
	server.close(() => {
		console.log("✅ Server closed.");
		process.exit(0);
	});
});
