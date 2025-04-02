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

const Purchases = () => {
	const [purchases, setPurchases] = useState([]);
	const [newPurchase, setNewPurchase] = useState({
		item: "",
		quantity: "",
		price: "",
	});
	const [editId, setEditId] = useState(null);
	const [editData, setEditData] = useState({
		item: "",
		quantity: "",
		price: "",
	});
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		type: "",
	});
	const businessId = getBusinessIdFromToken();

	useEffect(() => {
		if (!businessId) {
			console.error("❌ Business ID is missing. Please log in again.");
			return;
		}

		const fetchPurchases = async () => {
			try {
				const response = await axios.get(
					"http://localhost:5000/api/purchases",
					{
						params: { business_id: businessId },
					}
				);
				setPurchases(response.data);
			} catch (error) {
				console.error("Error fetching purchases:", error);
			}
		};

		fetchPurchases();
	}, [businessId]);

	const handleAddPurchase = async () => {
		const business_id = getBusinessIdFromToken(); // Use function to extract business_id

		if (!business_id) {
			console.error("❌ Business ID is missing. Please log in again.");
			alert("Business ID not found. Please log in again.");
			return;
		}

		const confirmPurchase = window.confirm(
			"Are you sure you want to add this purchase?"
		);
		if (!confirmPurchase) return;

		try {
			const response = await axios.post(
				"http://localhost:5000/api/purchases/add",
				{
					...newPurchase,
					business_id,
				}
			);

			setPurchases([...purchases, response.data]);
			setNewPurchase({ item: "", quantity: "", price: "" });

			setSnackbar({
				open: true,
				message: "✅ Purchase added successfully!",
				type: "success",
			});
		} catch (error) {
			console.error("Error adding purchase:", error);
			setSnackbar({
				open: true,
				message: "❌ Failed to add purchase!",
				type: "error",
			});
		}
	};

	const handleDelete = async () => {
		try {
			const business_id = getBusinessIdFromToken();
			if (!business_id) {
				console.error("Business ID is missing");
				return;
			}

			await axios.delete(`http://localhost:5000/api/purchases/${deleteId}`, {
				params: { business_id },
			});

			setPurchases(purchases.filter((purchase) => purchase.id !== deleteId));
			setSnackbar({
				open: true,
				message: "Purchase deleted successfully!",
				type: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to delete purchase!",
				type: "error",
			});
		}
		setOpenConfirmDialog(false);
	};

	const handleEdit = (purchase) => {
		setEditId(purchase.id);
		setEditData({
			item: purchase.item,
			quantity: purchase.quantity,
			price: purchase.price,
		});
	};

	const handleSave = async () => {
		const business_id = getBusinessIdFromToken();
		if (!business_id) {
			console.error("Business ID is missing");
			return;
		}

		const confirm = window.confirm(
			"Are you sure you want to update this purchase?"
		);
		if (!confirm) return;

		try {
			await axios.put(`http://localhost:5000/api/purchases/${editId}`, {
				...editData,
				business_id,
			});
			setPurchases(
				purchases.map((purchase) =>
					purchase.id === editId ? { ...purchase, ...editData } : purchase
				)
			);
			setEditId(null);
			setSnackbar({
				open: true,
				message: "Purchase updated successfully!",
				type: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to update purchase!",
				type: "error",
			});
		}
	};

	return (
		<div>
			<Typography variant='h4' gutterBottom>
				Purchases
			</Typography>
			<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
				<TextField
					label='Item'
					variant='outlined'
					value={newPurchase.item}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, item: e.target.value })
					}
				/>
				<TextField
					label='Quantity(L,kg)'
					type='number'
					variant='outlined'
					value={newPurchase.quantity}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, quantity: e.target.value })
					}
				/>
				<TextField
					label='Price'
					type='number'
					variant='outlined'
					value={newPurchase.price}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, price: e.target.value })
					}
				/>
				<Button variant='contained' color='primary' onClick={handleAddPurchase}>
					Add Purchase
				</Button>
			</div>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Item</TableCell>
							<TableCell>Quantity(L,Kg)</TableCell>
							<TableCell>Price (KES)</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{purchases.map((purchase) => (
							<TableRow key={purchase.id}>
								<TableCell>
									{editId === purchase.id ? (
										<TextField
											value={editData.item}
											onChange={(e) =>
												setEditData({ ...editData, item: e.target.value })
											}
										/>
									) : (
										purchase.item
									)}
								</TableCell>
								<TableCell>
									{editId === purchase.id ? (
										<TextField
											value={editData.quantity}
											onChange={(e) =>
												setEditData({ ...editData, quantity: e.target.value })
											}
										/>
									) : (
										purchase.quantity
									)}
								</TableCell>
								<TableCell>
									{editId === purchase.id ? (
										<TextField
											value={editData.price}
											onChange={(e) =>
												setEditData({ ...editData, price: e.target.value })
											}
										/>
									) : (
										`KES ${purchase.price}`
									)}
								</TableCell>
								<TableCell>
									{editId === purchase.id ? (
										<IconButton onClick={handleSave}>
											<Save />
										</IconButton>
									) : (
										<>
											<IconButton onClick={() => handleEdit(purchase)}>
												<Edit />
											</IconButton>
											<IconButton
												color='error'
												onClick={() => {
													setOpenConfirmDialog(true);
													setDeleteId(purchase.id);
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

			<Dialog
				open={openConfirmDialog}
				onClose={() => setOpenConfirmDialog(false)}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete this purchase?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenConfirmDialog(false)} color='secondary'>
						Cancel
					</Button>
					<Button onClick={handleDelete} color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

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

export default Purchases;