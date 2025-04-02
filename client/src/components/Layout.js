/** @format */

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

const Layout = () => {
	const location = useLocation();
	const noLayoutPages = ["/", "/register", "/forgot-password"];

	return noLayoutPages.includes(location.pathname) ? (
		<Outlet />
	) : (
		<Box sx={{ display: "flex" }}>
			<Sidebar />
			<Box sx={{ flexGrow: 1 }}>
				<Navbar />
				<Box sx={{ p: 3, mt: 8 }}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default Layout;
