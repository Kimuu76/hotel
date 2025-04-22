/** @format */

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
	Drawer,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Typography,
	Divider,
	Box,
	IconButton,
} from "@mui/material";
import {
	Dashboard,
	Fastfood,
	ShoppingCart,
	AttachMoney,
	BarChart,
	People,
	Sell,
	Menu as MenuIcon,
	ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

const Sidebar = () => {
	const location = useLocation();
	const role = localStorage.getItem("role");

	const [isOpen, setIsOpen] = useState(true);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const adminMenu = [
		{ text: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
		{ text: "Food Management", path: "/food", icon: <Fastfood /> },
		{ text: "Sales", path: "/sales", icon: <Sell /> },
		{ text: "Purchases", path: "/purchases", icon: <ShoppingCart /> },
		{ text: "Expenses", path: "/expenses", icon: <AttachMoney /> },
		{ text: "Users Management", path: "/users", icon: <People /> },
		{ text: "Reports", path: "/reports", icon: <BarChart /> },
	];

	const salespersonMenu = [
		{
			text: "Sales Dashboard",
			path: "/salesperson-dashboard",
			icon: <Dashboard />,
		},
		{ text: "Food Management", path: "/foodsales", icon: <Fastfood /> },
		{ text: "Sales", path: "/sales", icon: <Sell /> },
	];

	const menuItems = role === "admin" ? adminMenu : salespersonMenu;

	return (
		<Drawer
			variant='permanent'
			sx={{
				width: isOpen ? 250 : 70,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: isOpen ? 250 : 70,
					boxSizing: "border-box",
					bgcolor: "#0B2447",
					color: "white",
					borderRight: "2px solid #1E3A5F",
					transition: "width 0.3s ease-in-out",
					overflowX: "hidden",
				},
			}}
		>
			<Box
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: isOpen ? "space-between" : "center",
					bgcolor: "#1B3B6F",
				}}
			>
				{isOpen && (
					<Typography variant='h6' fontWeight='bold' color='inherit'>
						Menu
					</Typography>
				)}
				<IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
					{isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
				</IconButton>
			</Box>

			<Divider sx={{ bgcolor: "#2E4A7B" }} />

			<List sx={{ p: 1 }}>
				{menuItems.map((item) => (
					<ListItem
						button
						component={Link}
						to={item.path}
						key={item.text}
						sx={{
							bgcolor:
								location.pathname === item.path ? "#1E3A5F" : "transparent",
							borderRadius: 2,
							mb: 1,
							"&:hover": { bgcolor: "#162447" },
							transition: "0.3s ease-in-out",
							display: "flex",
							justifyContent: isOpen ? "flex-start" : "center",
							paddingLeft: isOpen ? 2 : 0,
						}}
					>
						<ListItemIcon
							sx={{ color: "white", minWidth: isOpen ? "auto" : "unset" }}
						>
							{item.icon}
						</ListItemIcon>
						{isOpen && (
							<ListItemText primary={item.text} sx={{ color: "white" }} />
						)}
					</ListItem>
				))}
			</List>
		</Drawer>
	);
};

export default Sidebar;
