/** @format */
const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles) => {
	return (req, res, next) => {
		const authHeader = req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res
				.status(401)
				.json({ message: "Access Denied. No Token Provided." });
		}

		try {
			const token = authHeader.split(" ")[1]; // Extract token
			const verified = jwt.verify(token, process.env.JWT_SECRET);

			console.log("Decoded JWT Payload:", verified); // Debugging output

			// Ensure business_id exists
			if (!verified.business_id) {
				return res
					.status(400)
					.json({ message: "Business ID is missing in token" });
			}

			req.user = verified;

			if (!allowedRoles.includes(req.user.role)) {
				return res
					.status(403)
					.json({ message: "Forbidden: Insufficient Permissions" });
			}

			next();
		} catch (error) {
			console.error("JWT Verification Error:", error);
			res.status(400).json({ message: "Invalid Token" });
		}
	};
};

module.exports = authMiddleware;
