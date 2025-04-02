/** @format */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
	Container,
	Card,
	CardContent,
	TextField,
	Button,
	Typography,
	CircularProgress,
	Box,
	Divider,
} from "@mui/material";
import API_BASE_URL from "../config";

const Login = () => {
	const [form, setForm] = useState({ identifier: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/users/login`,
				form
			);

			if (!response.data.token) {
				throw new Error("No token received from API");
			}

			localStorage.setItem("token", response.data.token);
			localStorage.setItem("role", response.data.user.role);
			localStorage.setItem("businessId", response.data.user.business_id);

			// Redirect based on role
			navigate(
				response.data.user.role === "admin"
					? "/dashboard"
					: "/salesperson-dashboard"
			);
		} catch (err) {
			setError("Invalid username/email or password!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth='xs'>
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
				{/* Welcome Message */}
				<Typography variant='h4' fontWeight='bold' textAlign='center'>
					🍽️ Meal Joint Management System
				</Typography>
				<Typography variant='body1' textAlign='center' color='textSecondary'>
					Efficiently manage your restaurant, track sales, purchases, and
					expenses.
				</Typography>

				{/* Login Card */}
				<Card sx={{ width: "100%", p: 3, boxShadow: 3 }}>
					<CardContent>
						<Typography
							variant='h5'
							align='center'
							fontWeight='bold'
							gutterBottom
						>
							Welcome Back 👋
						</Typography>
						<Typography
							variant='body2'
							align='center'
							color='textSecondary'
							gutterBottom
						>
							Sign in to continue
						</Typography>

						{error && (
							<Typography color='error' align='center'>
								{error}
							</Typography>
						)}

						<form onSubmit={handleSubmit}>
							<TextField
								label='Username or Email'
								name='identifier'
								fullWidth
								onChange={handleChange}
								required
								margin='normal'
							/>
							<TextField
								label='Password'
								name='password'
								type='password'
								fullWidth
								onChange={handleChange}
								required
								margin='normal'
							/>

							<Button
								variant='contained'
								color='primary'
								type='submit'
								fullWidth
								disabled={loading}
								sx={{ mt: 2, py: 1.2, fontSize: "16px", textTransform: "none" }}
							>
								{loading ? (
									<CircularProgress size={24} color='inherit' />
								) : (
									"Login"
								)}
							</Button>
						</form>

						{/* Forgot Password */}
						<Typography
							variant='body2'
							align='center'
							sx={{ mt: 2, color: "blue", cursor: "pointer" }}
							onClick={() => navigate("/forgot-password")}
						>
							Forgot Password?
						</Typography>

						{/*<Typography variant='body2' align='center' sx={{ mt: 2 }}>
							Don't have an account? <Link to='/register'>Register here</Link>
						</Typography>*/}
					</CardContent>
				</Card>

				{/* Footer */}
				<Divider sx={{ width: "100%", mt: 2 }} />
				<Typography variant='body2' color='textSecondary' textAlign='center'>
					Developed by KevTech || Contact +254712992577
				</Typography>
			</Box>
		</Container>
	);
};

export default Login;
