/** @format */

import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Logout } from "@mui/icons-material";
import axios from "axios";
import { useMediaQuery } from "@mui/material";

const Navbar = ({ toggleSidebar }) => {
	const navigate = useNavigate();
	const [businessName, setBusinessName] = useState("Loading...");
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Fetch Business Name from API
	useEffect(() => {
		const fetchBusinessName = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) throw new Error("No token found");

				const response = await axios.get(
					"http://localhost:5000/api/dashboard/business-name",
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setBusinessName(response.data.businessName);
			} catch (error) {
				console.error(
					"Error fetching business name:",
					error.response?.data || error.message
				);
				setBusinessName("Unknown Business");
			}
		};

		fetchBusinessName();
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		navigate("/");
	};

	return (
		<AppBar
			position='fixed'
			sx={{
				width: isMobile ? "100%" : `calc(100% - 260px)`,
				ml: isMobile ? 0 : "260px",
				bgcolor: "#0B2447",
				boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
			}}
		>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				{/* Sidebar Toggle Button for Mobile */}
				{isMobile && (
					<IconButton color='inherit' onClick={toggleSidebar}>
						<MenuIcon fontSize='large' />
					</IconButton>
				)}

				{/* Business Name (Centered) */}
				<Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
					<Typography variant='h6' fontWeight='bold'>
						{businessName}
					</Typography>
				</Box>

				{/* Logout Button */}
				<IconButton
					color='inherit'
					onClick={handleLogout}
					sx={{ transition: "0.3s", "&:hover": { color: "#FF4C4C" } }}
				>
					<Logout fontSize='medium' />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;