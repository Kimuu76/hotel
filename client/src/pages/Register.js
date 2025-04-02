/** @format */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Container,
	Card,
	CardContent,
	TextField,
	Button,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Typography,
	Box,
	Divider,
	Alert,
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../config";

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "admin", // Default to admin
		businessName: "",
		businessEmail: "",
	});

	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");

		try {
			const res = await axios.post(
				`${API_BASE_URL}/api/users/register`,
				formData
			);

			if (res.status === 201) {
				setSuccessMessage("🎉 Registration successful! Redirecting...");
				setTimeout(() => {
					navigate("/");
				}, 2000);
			}
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed!");
		}
	};

	return (
		<Container maxWidth='sm'>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					flexDirection: "column",
					gap: 2,
				}}
			>
				{/* Welcome Section */}
				<Typography variant='h4' fontWeight='bold' textAlign='center'>
					🍽️ Get Started with Meal Joint
				</Typography>
				<Typography variant='body1' textAlign='center' color='textSecondary'>
					Manage your restaurant with ease—track sales, orders, and expenses.
				</Typography>

				{/* Registration Form */}
				<Card sx={{ width: "100%", p: 3, boxShadow: 3 }}>
					<CardContent>
						<Typography
							variant='h5'
							align='center'
							fontWeight='bold'
							gutterBottom
						>
							Register Your Business
						</Typography>

						{error && <Alert severity='error'>{error}</Alert>}
						{successMessage && (
							<Alert severity='success'>{successMessage}</Alert>
						)}

						<form onSubmit={handleSubmit}>
							{/* Business Details */}
							<TextField
								label='Business Name'
								fullWidth
								name='businessName'
								value={formData.businessName}
								onChange={handleChange}
								required
								margin='normal'
							/>
							<TextField
								label='Business Email'
								fullWidth
								name='businessEmail'
								type='email'
								value={formData.businessEmail}
								onChange={handleChange}
								required
								margin='normal'
							/>

							{/* Admin Details */}
							<Typography variant='subtitle1' fontWeight='bold' sx={{ mt: 2 }}>
								Admin Details
							</Typography>
							<TextField
								label='Admin Name'
								fullWidth
								name='name'
								value={formData.name}
								onChange={handleChange}
								required
								margin='normal'
							/>
							<TextField
								label='Email'
								type='email'
								fullWidth
								name='email'
								value={formData.email}
								onChange={handleChange}
								required
								margin='normal'
							/>
							<TextField
								label='Password'
								type='password'
								fullWidth
								name='password'
								value={formData.password}
								onChange={handleChange}
								required
								margin='normal'
							/>

							{/* Role Selection (Disabled for now) */}
							<FormControl fullWidth margin='normal'>
								<InputLabel>Role</InputLabel>
								<Select
									name='role'
									value={formData.role}
									onChange={handleChange}
									disabled
								>
									<MenuItem value='admin'>Admin</MenuItem>
								</Select>
							</FormControl>

							{/* Register Button */}
							<Button
								variant='contained'
								color='primary'
								type='submit'
								fullWidth
								sx={{ mt: 2, py: 1.2, fontSize: "16px", textTransform: "none" }}
							>
								Register
							</Button>
						</form>

						<Typography variant='body2' align='center' sx={{ mt: 2 }}>
							Already have an account? <Link to='/'>Login here</Link>
						</Typography>
					</CardContent>
				</Card>

				{/* Footer */}
				<Divider sx={{ width: "100%", mt: 2 }} />
				<Typography variant='body2' color='textSecondary' textAlign='center'>
					Developed by KevTech || contact support +254712992577
				</Typography>
			</Box>
		</Container>
	);
};

export default Register;
