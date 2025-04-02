/** @format */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sql = require("mssql");
const nodemailer = require("nodemailer");
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
	const {
		name,
		email,
		password,
		role,
		businessName,
		businessEmail,
		business_id,
	} = req.body;

	try {
		let pool = await sql.connect();

		// Check if email already exists
		let existingUser = await pool
			.request()
			.input("email", sql.VarChar, email)
			.query("SELECT * FROM users WHERE email = @email");

		if (existingUser.recordset.length > 0) {
			return res.status(400).json({ message: "Email already exists" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		let finalBusinessId = business_id;

		// If registering as an admin and no business_id is provided, create a new business
		if (role === "admin" && !business_id) {
			if (!businessName || !businessEmail) {
				// <-- Ensure businessEmail is provided
				return res.status(400).json({
					message:
						"Business name and email are required for admin registration",
				});
			}

			const businessResult = await pool
				.request()
				.input("name", sql.VarChar, businessName)
				.input("email", sql.VarChar, businessEmail)
				.query(
					"INSERT INTO businesses (name, email) OUTPUT INSERTED.id VALUES (@name, @email)"
				);

			finalBusinessId = businessResult.recordset[0].id;
		}

		// Insert new user
		await pool
			.request()
			.input("name", sql.VarChar, name)
			.input("email", sql.VarChar, email)
			.input("password", sql.VarChar, hashedPassword)
			.input("role", sql.VarChar, role || "user")
			.input("business_id", sql.Int, finalBusinessId)
			.query(
				"INSERT INTO users (name, email, password, role, business_id) VALUES (@name, @email, @password, @role, @business_id)"
			);

		res.status(201).json({
			message: "User registered successfully",
			business_id: finalBusinessId,
		});
	} catch (error) {
		console.error("Registration Error:", error);
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

// User Login
router.post("/login", async (req, res) => {
	const { identifier, password } = req.body; // Can be email or username

	try {
		let pool = await sql.connect();

		// Check if the identifier is an email or username
		let user = await pool
			.request()
			.input("identifier", sql.VarChar, identifier)
			.query(
				"SELECT * FROM users WHERE email = @identifier OR name = @identifier"
			);

		if (user.recordset.length === 0) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const validPassword = await bcrypt.compare(
			password,
			user.recordset[0].password
		);

		if (!validPassword) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const businessId = user.recordset[0].business_id || null;

		// Generate JWT Token
		const token = jwt.sign(
			{
				id: user.recordset[0].id,
				role: user.recordset[0].role,
				business_id: businessId,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		console.log("Generated Token:", token);

		res.json({
			token,
			user: {
				id: user.recordset[0].id,
				name: user.recordset[0].name,
				email: user.recordset[0].email,
				role: user.recordset[0].role,
				business_id: businessId,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// 1️⃣ **Forgot Password - Send Reset Link**
router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		let pool = await sql.connect();

		// Check if user exists
		let user = await pool
			.request()
			.input("email", sql.VarChar, email)
			.query("SELECT id FROM users WHERE email = @email");

		if (user.recordset.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetExpires = new Date();
		resetExpires.setMinutes(resetExpires.getMinutes() + 15); // Expire in 15 minutes

		// Store reset token in database
		await pool
			.request()
			.input("userId", sql.Int, user.recordset[0].id)
			.input("resetToken", sql.VarChar, resetToken)
			.input("resetExpires", sql.DateTime, resetExpires)
			.query(
				`UPDATE users SET reset_token = @resetToken, reset_expires = @resetExpires WHERE id = @userId`
			);

		// Email reset link
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
		await transporter.sendMail({
			to: email,
			from: process.env.EMAIL_USER,
			subject: "Password Reset Request",
			html: `<h2>Password Reset</h2>
			       <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
			       <p>This link expires in 15 minutes.</p>`,
		});

		res.json({ message: "Password reset link sent to email." });
	} catch (error) {
		console.error("Forgot Password Error:", error);
		res.status(500).json({ message: "Server error, try again later." });
	}
});

// 2️⃣ **Reset Password**
router.post("/reset-password", async (req, res) => {
	try {
		const { token, password } = req.body;
		let pool = await sql.connect();

		// Validate token
		let user = await pool
			.request()
			.input("resetToken", sql.VarChar, token)
			.query(
				"SELECT id FROM users WHERE reset_token = @resetToken AND reset_expires > GETDATE()"
			);

		if (user.recordset.length === 0) {
			return res.status(400).json({ message: "Invalid or expired token." });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Update password
		await pool
			.request()
			.input("userId", sql.Int, user.recordset[0].id)
			.input("password", sql.VarChar, hashedPassword)
			.query(
				"UPDATE users SET password = @password, reset_token = NULL, reset_expires = NULL WHERE id = @userId"
			);

		res.json({ message: "Password has been reset successfully!" });
	} catch (error) {
		console.error("Reset Password Error:", error);
		res.status(500).json({ message: "Server error, try again later." });
	}
});

// Fetch all users of the logged-in admin's business
router.get("/business", authMiddleware(["admin"]), async (req, res) => {
	const businessId = req.user.business_id; // Extract from token

	if (!businessId) {
		return res.status(400).json({ message: "Invalid business ID." });
	}

	try {
		let pool = await sql.connect();
		let users = await pool
			.request()
			.input("business_id", sql.Int, businessId)
			.query(
				"SELECT id, name, email, role FROM users WHERE business_id = @business_id"
			);

		res.json(users.recordset);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

// Get Single User
router.get("/:id", authMiddleware(["admin", "user"]), async (req, res) => {
	const { id } = req.params;
	const requestingUserId = req.user.id;
	const requestingUserRole = req.user.role;
	const adminBusinessId = req.user.business_id;

	try {
		let pool = await sql.connect();
		let user = await pool
			.request()
			.input("id", sql.Int, id)
			.query(
				"SELECT id, name, email, role, business_id FROM users WHERE id = @id"
			);

		if (user.recordset.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		// Admins can only view users from their own business
		if (
			requestingUserRole === "admin" &&
			user.recordset[0].business_id !== adminBusinessId
		) {
			return res
				.status(403)
				.json({ message: "Unauthorized to access this user" });
		}

		// Normal users can only access their own profile
		if (
			requestingUserRole === "user" &&
			requestingUserId !== user.recordset[0].id
		) {
			return res
				.status(403)
				.json({ message: "Unauthorized to access this user" });
		}

		res.json(user.recordset[0]);
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

router.put("/:id", authMiddleware(["admin"]), async (req, res) => {
	const { id } = req.params;
	const { name, email } = req.body;
	const adminBusinessId = req.user.business_id;

	try {
		let pool = await sql.connect();
		let user = await pool
			.request()
			.input("id", sql.Int, id)
			.query("SELECT business_id FROM users WHERE id = @id");

		if (user.recordset.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.recordset[0].business_id !== adminBusinessId) {
			return res.status(403).json({ message: "Unauthorized action" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.input("name", sql.VarChar, name)
			.input("email", sql.VarChar, email)
			.query("UPDATE users SET name = @name, email = @email WHERE id = @id");

		res.json({ message: "User updated successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

// Delete User (Admin Only, Only Within Their Business)
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
	const { id } = req.params;
	const adminBusinessId = req.user.business_id;

	try {
		let pool = await sql.connect();
		let userToDelete = await pool
			.request()
			.input("id", sql.Int, id)
			.query("SELECT business_id FROM users WHERE id = @id");

		if (userToDelete.recordset.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		if (userToDelete.recordset[0].business_id !== adminBusinessId) {
			return res.status(403).json({ message: "Unauthorized action" });
		}

		await pool
			.request()
			.input("id", sql.Int, id)
			.query("DELETE FROM users WHERE id = @id");

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

// Create a new salesperson account (Admin Only)
router.post("/create", authMiddleware(["admin"]), async (req, res) => {
	const { name, email, password, role = "salesperson" } = req.body;
	const adminBusinessId = req.user.business_id; // Extract from token

	if (!name || !email || !password) {
		return res.status(400).json({ error: "All fields are required." });
	}

	if (!adminBusinessId) {
		return res
			.status(403)
			.json({ error: "Unauthorized: No business ID found." });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		let pool = await sql.connect();

		await pool
			.request()
			.input("name", sql.VarChar, name)
			.input("email", sql.VarChar, email)
			.input("password", sql.VarChar, hashedPassword)
			.input("role", sql.VarChar, role)
			.input("business_id", sql.Int, adminBusinessId) // ✅ Assign admin's business ID
			.query(
				"INSERT INTO users (name, email, password, role, business_id) VALUES (@name, @email, @password, @role, @business_id)"
			);

		res.status(201).json({ message: "Salesperson created successfully!" });
	} catch (error) {
		console.error("User Creation Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
