/** @format */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	TextField,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
	Alert,
} from "@mui/material";
import { Delete, Edit, Save } from "@mui/icons-material";
import API_BASE_URL from "../config";

// Function to extract business_id from token
const getBusinessIdFromToken = () => {
	try {
		const token = localStorage.getItem("token"); // Retrieve token from localStorage
		if (!token) return null;

		const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
		return payload.business_id || null; // Ensure business_id exists
	} catch (error) {
		console.error("Error extracting business_id:", error);
		return null;
	}
};

const Expenses = () => {
	const [expenses, setExpenses] = useState([]);
	const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
	const [editId, setEditId] = useState(null);
	const [editData, setEditData] = useState({ description: "", amount: "" });
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		type: "",
	});

	const businessId = getBusinessIdFromToken();

	// Fetch expenses
	useEffect(() => {
		if (!businessId) {
			console.error("❌ Business ID is missing. Please log in again.");
			return;
		}
		const fetchExpenses = async () => {
			try {
				const response = await axios.get(`${API_BASE_URL}/api/expenses`, {
					params: { business_id: businessId },
				});
				setExpenses(response.data);
			} catch (error) {
				console.error("Error fetching expenses:", error);
			}
		};
		fetchExpenses();
	}, [businessId]);

	// Add expense
	const handleAddExpense = async () => {
		if (!newExpense.description || !newExpense.amount) {
			setSnackbar({
				open: true,
				message: "Description and amount required!",
				type: "error",
			});
			return;
		}

		const confirm = window.confirm(
			"Are you sure you want to add this expense?"
		);
		if (!confirm) return;

		try {
			const response = await axios.post(`${API_BASE_URL}/api/expenses/add`, {
				...newExpense,
				business_id: businessId,
			});
			setExpenses([...expenses, response.data]);
			setNewExpense({ description: "", amount: "" });
			setSnackbar({
				open: true,
				message: "Expense added successfully!",
				type: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to add expense!",
				type: "error",
			});
		}
	};

	// Delete expense
	const handleDelete = async (id) => {
		try {
			await axios.delete(
				`${API_BASE_URL}/api/expenses/${id}?business_id=${businessId}`
			);
			setExpenses(expenses.filter((expense) => expense.id !== id)); // ✅ use id directly
			setSnackbar({
				open: true,
				message: "Expense deleted successfully!",
				type: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to delete expense!",
				type: "error",
			});
		}
		setOpenConfirmDialog(false);
	};

	// Enable edit mode
	const handleEdit = (expense) => {
		setEditId(expense.id);
		setEditData({ description: expense.description, amount: expense.amount });
	};

	// Save updated expense
	const handleSave = async () => {
		if (!editData.description || !editData.amount) {
			setSnackbar({
				open: true,
				message: "Description and amount required!",
				type: "error",
			});
			return;
		}

		const confirm = window.confirm(
			"Are you sure you want to update this expense?"
		);
		if (!confirm) return;

		try {
			await axios.put(`${API_BASE_URL}/api/expenses/${editId}`, {
				...editData,
				business_id: businessId,
			});
			setExpenses(
				expenses.map((expense) =>
					expense.id === editId ? { ...expense, ...editData } : expense
				)
			);
			setEditId(null);
			setSnackbar({
				open: true,
				message: "Expense updated successfully!",
				type: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to update expense!",
				type: "error",
			});
		}
	};

	return (
		<div style={{ padding: "20px" }}>
			<Typography variant='h4' gutterBottom>
				Expenses
			</Typography>
			<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
				<TextField
					label='Description'
					variant='outlined'
					value={newExpense.description}
					onChange={(e) =>
						setNewExpense({ ...newExpense, description: e.target.value })
					}
				/>
				<TextField
					label='Amount'
					type='number'
					variant='outlined'
					value={newExpense.amount}
					onChange={(e) =>
						setNewExpense({ ...newExpense, amount: e.target.value })
					}
				/>
				<Button variant='contained' color='primary' onClick={handleAddExpense}>
					Add Expense
				</Button>
			</div>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Description</TableCell>
							<TableCell>Amount (KES)</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{expenses.map((expense) => (
							<TableRow key={expense.id}>
								<TableCell>
									{editId === expense.id ? (
										<TextField
											value={editData.description}
											onChange={(e) =>
												setEditData({
													...editData,
													description: e.target.value,
												})
											}
										/>
									) : (
										expense.description
									)}
								</TableCell>
								<TableCell>
									{editId === expense.id ? (
										<TextField
											value={editData.amount}
											onChange={(e) =>
												setEditData({ ...editData, amount: e.target.value })
											}
										/>
									) : (
										`KES ${expense.amount}`
									)}
								</TableCell>
								<TableCell>
									{editId === expense.id ? (
										<IconButton onClick={handleSave}>
											<Save />
										</IconButton>
									) : (
										<>
											<IconButton onClick={() => handleEdit(expense)}>
												<Edit />
											</IconButton>
											<IconButton
												color='error'
												onClick={() => {
													setOpenConfirmDialog(true);
													setDeleteId(expense.id);
												}}
											>
												<Delete />
											</IconButton>
										</>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={openConfirmDialog}
				onClose={() => setOpenConfirmDialog(false)}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this expense?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenConfirmDialog(false)} color='secondary'>
						Cancel
					</Button>
					<Button onClick={() => handleDelete(deleteId)} color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar Notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
			>
				<Alert severity={snackbar.type}>{snackbar.message}</Alert>
			</Snackbar>
		</div>
	);
};

export default Expenses;
