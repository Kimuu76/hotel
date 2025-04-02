/** @format */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

const ResetPassword = () => {
	const { token } = useParams(); // Get reset token from URL
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match!");
			setLoading(false);
			return;
		}

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/users/reset-password`,
				{ token, password }
			);

			if (response.status === 200) {
				setMessage("Password reset successful! Redirecting to login...");
				setTimeout(() => navigate("/"), 3000);
			}
		} catch (err) {
			setError("Failed to reset password. Try again.");
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
				<Typography variant='h5' fontWeight='bold' textAlign='center'>
					🔒 Set New Password
				</Typography>
				<Typography variant='body2' textAlign='center' color='textSecondary'>
					Enter a new password for your account.
				</Typography>

				<Card sx={{ width: "100%", p: 3, boxShadow: 3 }}>
					<CardContent>
						{error && (
							<Typography color='error' align='center'>
								{error}
							</Typography>
						)}
						{message && (
							<Typography color='primary' align='center'>
								{message}
							</Typography>
						)}

						<form onSubmit={handleSubmit}>
							<TextField
								label='New Password'
								type='password'
								fullWidth
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								margin='normal'
							/>
							<TextField
								label='Confirm Password'
								type='password'
								fullWidth
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
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
									"Reset Password"
								)}
							</Button>
						</form>

						<Button
							variant='text'
							fullWidth
							sx={{ mt: 2, color: "blue" }}
							onClick={() => navigate("/")}
						>
							Back to Login
						</Button>
					</CardContent>
				</Card>

				<Divider sx={{ width: "100%", mt: 2 }} />
				<Typography variant='body2' color='textSecondary' textAlign='center'>
					Developed by KevTech || Contact +254712992577
				</Typography>
			</Box>
		</Container>
	);
};

export default ResetPassword;
