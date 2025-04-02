/** @format */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
	MonetizationOn,
	ShoppingCart,
	MoneyOff,
	TrendingUp,
	BarChart,
} from "@mui/icons-material";
import {
	BarChart as ReBarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import API_BASE_URL from "../config";

const Dashboard = () => {
	const navigate = useNavigate();
	const [businessId, setBusinessId] = useState(null);
	const [summary, setSummary] = useState({
		totalSales: 0,
		totalExpenses: 0,
		totalPurchases: 0,
		totalProfit: 0,
		monthlyData: [],
	});
	const [error, setError] = useState(null);

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "admin") {
			alert("Access Denied! Redirecting...");
			navigate("/");
		}
	}, [navigate]);

	useEffect(() => {
		const fetchBusinessId = () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) throw new Error("No token found");

				const decodedToken = JSON.parse(atob(token.split(".")[1]));
				if (!decodedToken.business_id) throw new Error("Business ID missing");

				setBusinessId(decodedToken.business_id);
			} catch (err) {
				console.error("Error retrieving business ID:", err.message);
				setError(err.message);
			}
		};

		fetchBusinessId();
	}, []);

	useEffect(() => {
		if (!businessId) return;

		const fetchDashboardStats = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) throw new Error("No token found");

				const response = await axios.get(
					`${API_BASE_URL}/api/dashboard/stats?business_id=${businessId}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				setSummary(response.data);
			} catch (err) {
				console.error(
					"Error fetching dashboard stats:",
					err.response?.data || err.message
				);
				setError("Failed to load dashboard statistics");
			}
		};

		fetchDashboardStats();
	}, [businessId]);

	if (error) return <p>{error}</p>;

	const cardStyle = {
		borderRadius: 3,
		boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
		transition: "transform 0.2s ease-in-out",
		"&:hover": { transform: "scale(1.05)" },
	};

	const statCards = [
		{
			label: "Total Sales",
			value: summary.totalSales,
			icon: <MonetizationOn sx={{ fontSize: 40, marginRight: 2 }} />,
			color: "#007bff",
		},
		{
			label: "Total Expenses",
			value: summary.totalExpenses,
			icon: <MoneyOff sx={{ fontSize: 40, marginRight: 2 }} />,
			color: "#dc3545",
		},
		{
			label: "Total Purchases",
			value: summary.totalPurchases,
			icon: <ShoppingCart sx={{ fontSize: 40, marginRight: 2 }} />,
			color: "#17a2b8",
		},
		{
			label: summary.totalProfit >= 0 ? "Profit" : "Loss",
			value: summary.totalProfit,
			icon: <TrendingUp sx={{ fontSize: 40, marginRight: 2 }} />,
			color: summary.totalProfit >= 0 ? "#28a745" : "#d9534f",
		},
	];

	return (
		<Box sx={{ padding: 4 }}>
			<Typography variant='h4' gutterBottom sx={{ fontWeight: "bold" }}>
				Dashboard
			</Typography>

			<Grid container spacing={3}>
				{statCards.map((card, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<Card sx={{ ...cardStyle, bgcolor: card.color, color: "white" }}>
							<CardContent>
								<Box display='flex' alignItems='center'>
									{card.icon}
									<Box>
										<Typography variant='h6'>{card.label}</Typography>
										<Typography variant='h5'>
											KES {card.value.toLocaleString()}
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}

				{/* Sales vs Purchases Chart */}
				<Grid item xs={12}>
					<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
						<CardContent>
							<Box display='flex' alignItems='center' mb={2}>
								<BarChart
									sx={{ fontSize: 40, marginRight: 2, color: "#007bff" }}
								/>
								<Typography variant='h6'>
									Sales vs Purchases Per Month
								</Typography>
							</Box>
							<ResponsiveContainer width='100%' height={300}>
								<ReBarChart data={summary.monthlyData}>
									<XAxis dataKey='month' />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey='monthlySales' fill='#28a745' name='Sales' />
									<Bar
										dataKey='monthlyPurchases'
										fill='#17a2b8'
										name='Purchases'
									/>
								</ReBarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Dashboard;
