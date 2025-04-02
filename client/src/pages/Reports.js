/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Select,
	MenuItem,
	CircularProgress,
	Alert,
	Box,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Function to extract business_id from token
const getBusinessIdFromToken = () => {
	try {
		const token = localStorage.getItem("token");
		if (!token) return null;
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.business_id || null;
	} catch (error) {
		console.error("Error extracting business_id:", error);
		return null;
	}
};

const Reports = () => {
	const [reportType, setReportType] = useState("sales");
	const [filter, setFilter] = useState("daily");
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const businessId = getBusinessIdFromToken();

	// Fetch reports
	useEffect(() => {
		if (!businessId) {
			setError("Business ID is missing. Please log in again.");
			return;
		}
		fetchReports();
	}, [reportType, filter, businessId]);

	const fetchReports = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await axios.get(
				`http://localhost:5000/api/reports/${reportType}`,
				{
					params: { filter, business_id: businessId }, // ✅ Added business_id
				}
			);
			if (response.data.message) {
				setReports([]);
				setError(response.data.message);
			} else {
				setReports(response.data);
			}
		} catch (error) {
			console.error("Error fetching reports:", error);
			setError("Failed to fetch reports. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Generate PDF Report
	const generatePDF = () => {
		const doc = new jsPDF();
		doc.text(`${reportType.toUpperCase()} REPORT`, 14, 10);
		autoTable(doc, {
			head: [["ID", "NAME", "Date", "Amount (KES)"]],
			body: reports.map((r) => [
				r.id,
				r.name,
				new Date(r.date).toLocaleDateString(),
				`KES ${r.amount}`,
			]),
		});
		doc.save(`${reportType}-report.pdf`);
	};

	// Export Excel Report
	const exportExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(
			reports.map(({ id, name, date, amount }) => ({
				ID: id,
				Name: name,
				Date: new Date(date).toLocaleDateString(),
				"Amount (KES)": amount,
			}))
		);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
		XLSX.writeFile(workbook, `${reportType}-report.xlsx`);
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant='h4' gutterBottom>
				Reports
			</Typography>

			<Box sx={{ display: "flex", gap: 2, mb: 3 }}>
				<Select
					value={reportType}
					onChange={(e) => setReportType(e.target.value)}
					variant='outlined'
				>
					<MenuItem value='sales'>Sales</MenuItem>
					<MenuItem value='purchases'>Purchases</MenuItem>
					<MenuItem value='expenses'>Expenses</MenuItem>
				</Select>

				<Select
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					variant='outlined'
				>
					<MenuItem value='daily'>Daily</MenuItem>
					<MenuItem value='weekly'>Weekly</MenuItem>
					<MenuItem value='monthly'>Monthly</MenuItem>
					<MenuItem value='yearly'>Yearly</MenuItem>
				</Select>

				<Button variant='contained' color='primary' onClick={generatePDF}>
					Download PDF
				</Button>
				<Button variant='contained' color='secondary' onClick={exportExcel}>
					Export Excel
				</Button>
			</Box>

			{loading ? (
				<Box sx={{ textAlign: "center", mt: 4 }}>
					<CircularProgress />
					<Typography variant='body1' sx={{ mt: 2 }}>
						Loading reports...
					</Typography>
				</Box>
			) : error ? (
				<Alert severity='warning'>{error}</Alert>
			) : (
				<TableContainer component={Paper} sx={{ mt: 3 }}>
					<Table>
						<TableHead sx={{ backgroundColor: "#f5f5f5" }}>
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell>NAME</TableCell>
								<TableCell>Date</TableCell>
								<TableCell>Amount (KES)</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{reports.length > 0 ? (
								reports.map((report) => (
									<TableRow key={report.id}>
										<TableCell>{report.id}</TableCell>
										<TableCell>{report.name}</TableCell>
										<TableCell>
											{new Date(report.date).toLocaleDateString()}
										</TableCell>
										<TableCell>KES {report.amount}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} align='center'>
										No data available
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
};

export default Reports;