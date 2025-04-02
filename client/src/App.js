/** @format */

import React, { useState, useEffect, useCallback } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Foodsalesperson from "./pages/Foodsalesperson";
import FoodManagement from "./pages/FoodManagement";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const AppContent = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const noLayoutPages = ["/", "/register", "/forgot-password"];
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

	// Logout function
	const logoutUser = useCallback(() => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("businessId");
		navigate("/");
	}, [navigate]);

	useEffect(() => {
		let timeout;

		const resetTimeout = () => {
			clearTimeout(timeout);
			timeout = setTimeout(logoutUser, IDLE_TIMEOUT);
		};

		const handleActivity = () => {
			resetTimeout();
		};

		// Events to track user activity
		const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

		events.forEach((event) => window.addEventListener(event, handleActivity));

		// Start initial timeout
		resetTimeout();

		return () => {
			clearTimeout(timeout);
			events.forEach((event) =>
				window.removeEventListener(event, handleActivity)
			);
		};
	}, [logoutUser]);

	return noLayoutPages.includes(location.pathname) ? (
		<Routes>
			<Route path='/' element={<Login />} />
			<Route path='/register' element={<Register />} />
			<Route path='/forgot-password' element={<ForgotPassword />} />
		</Routes>
	) : (
		<div
			style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}
		>
			{!isMobile || sidebarOpen ? (
				<Sidebar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
			) : null}

			<div
				style={{
					flexGrow: 1,
					marginLeft: isMobile ? "60px" : "80px",
					width: "100%",
				}}
			>
				<Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
				<div style={{ padding: isMobile ? "70px 10px" : "80px 20px" }}>
					<Routes>
						<Route
							path='/dashboard'
							element={
								<PrivateRoute allowedRoles={["admin"]}>
									<Dashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path='/salesperson-dashboard'
							element={
								<PrivateRoute allowedRoles={["salesperson"]}>
									<UserDashboard />
								</PrivateRoute>
							}
						/>
						<Route path='/food' element={<FoodManagement />} />
						<Route path='/foodsales' element={<Foodsalesperson />} />
						<Route path='/expenses' element={<Expenses />} />
						<Route path='/sales' element={<Sales />} />
						<Route path='/purchases' element={<Purchases />} />
						<Route path='/users' element={<UserManagement />} />
						<Route path='/reports' element={<Reports />} />
						<Route path='/reset-password/:token' element={<ResetPassword />} />
					</Routes>
				</div>
			</div>
		</div>
	);
};

const App = () => {
	return (
		<Router>
			<AppContent />
		</Router>
	);
};

export default App;
