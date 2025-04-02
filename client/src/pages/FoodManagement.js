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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import API_BASE_URL from "../config";

const FoodManagement = () => {
	const [foods, setFoods] = useState([]);
	const [open, setOpen] = useState(false);
	const [foodData, setFoodData] = useState({ name: "", price: "", stock: "" });
	const [editingId, setEditingId] = useState(null);
	const businessId = localStorage.getItem("businessId");

	useEffect(() => {
		fetchFoods();
	}, []);

	const fetchFoods = async () => {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/api/food?business_id=${businessId}`
			);
			setFoods(response.data);
		} catch (error) {
			alert("Error fetching food data.");
		}
	};

	const handleOpen = (food = null) => {
		if (food) {
			setFoodData(food);
			setEditingId(food.id);
		} else {
			setFoodData({ name: "", price: "", stock: "" });
			setEditingId(null);
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSave = async () => {
		if (!foodData.name || !foodData.price || !foodData.stock) {
			alert("Please fill in all fields.");
			return;
		}

		const payload = {
			...foodData,
			business_id: businessId, // Add business_id here
		};

		try {
			if (editingId) {
				await axios.put(`${API_BASE_URL}/api/food/${editingId}`, payload);
				alert("Food item updated successfully!");
			} else {
				await axios.post(`${API_BASE_URL}/api/food/add`, payload);
				alert("Food item added successfully!");
			}
			setOpen(false);
			fetchFoods();
		} catch (error) {
			alert("Operation failed. Please try again.");
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this food item?")) {
			try {
				await axios.delete(`${API_BASE_URL}/api/food/${id}`);
				alert("Food item deleted successfully!");
				setFoods(foods.filter((food) => food.id !== id));
			} catch (error) {
				alert("Error deleting food item.");
			}
		}
	};

	return (
		<div>
			<Typography variant='h4' gutterBottom>
				Food Management
			</Typography>
			<Button
				variant='contained'
				color='primary'
				onClick={() => handleOpen()}
				style={{ marginBottom: 20 }}
			>
				Add New Food
			</Button>

			<TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
				<Table>
					<TableHead sx={{ backgroundColor: "#f5f5f5" }}>
						<TableRow>
							<TableCell>
								<strong>Name</strong>
							</TableCell>
							<TableCell>
								<strong>Price (KES)</strong>
							</TableCell>
							<TableCell>
								<strong>Stock</strong>
							</TableCell>
							<TableCell>
								<strong>Actions</strong>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{foods.map((food) => (
							<TableRow key={food.id}>
								<TableCell>{food.name}</TableCell>
								<TableCell>KES {food.price}</TableCell>
								<TableCell>{food.stock}</TableCell>
								<TableCell>
									<IconButton color='primary' onClick={() => handleOpen(food)}>
										<Edit />
									</IconButton>
									<IconButton
										color='error'
										onClick={() => handleDelete(food.id)}
									>
										<Delete />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Dialog for Adding/Editing Food */}
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>{editingId ? "Edit Food" : "Add New Food"}</DialogTitle>
				<DialogContent>
					<TextField
						label='Food Name'
						fullWidth
						margin='dense'
						value={foodData.name}
						onChange={(e) => setFoodData({ ...foodData, name: e.target.value })}
					/>
					<TextField
						label='Price (KES)'
						type='number'
						fullWidth
						margin='dense'
						value={foodData.price}
						onChange={(e) =>
							setFoodData({ ...foodData, price: e.target.value })
						}
					/>
					<TextField
						label='Stock'
						type='number'
						fullWidth
						margin='dense'
						value={foodData.stock}
						onChange={(e) =>
							setFoodData({ ...foodData, stock: e.target.value })
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='secondary'>
						Cancel
					</Button>
					<Button onClick={handleSave} color='primary'>
						{editingId ? "Update" : "Save"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default FoodManagement;
