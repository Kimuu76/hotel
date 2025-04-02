/** @format */

import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
	const role = localStorage.getItem("role");
	const businessId = localStorage.getItem("businessId");

	if (!allowedRoles.includes(role) || !businessId) {
		return <Navigate to='/' />;
	}

	return children;
};

export default PrivateRoute;