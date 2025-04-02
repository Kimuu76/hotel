/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	Typography,
	TextField,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@mui/material";
import Receipt from "../components/receipt";
import API_BASE_URL from "../config";

// Function to extract business_id from token
const getBusinessIdFromToken = () => {
	try {
		const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
		if (!token) return null;

		const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
		return payload.business_id || null; // Ensure business_id exists
	} catch (error) {
		console.error("Error extracting business_id:", error);
		return null;
	}
};

const Sales = () => {
	const [sales, setSales] = useState([]);
	const [foods, setFoods] = useState([]);
	const [selectedFood, setSelectedFood] = useState("");
	const [quantity, setQuantity] = useState("");
	const [cart, setCart] = useState([]);
	const [receipt, setReceipt] = useState("");
	const businessId = getBusinessIdFromToken();

	// Fetch sales and foods data
	useEffect(() => {
		if (!businessId) {
			console.error("Business ID is missing.");
			return;
		}

		const fetchData = async () => {
			try {
				const [salesRes, foodsRes] = await Promise.all([
					axios.get(`${API_BASE_URL}/api/sales`, {
						params: { business_id: businessId },
					}),
					axios.get(`${API_BASE_URL}/api/sales/foods`, {
						params: { business_id: businessId },
					}),
				]);
				setSales(salesRes.data);
				setFoods(foodsRes.data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		fetchData();
	}, [businessId]);

	// Add selected food to cart with stock validation
	const handleAddToCart = () => {
		if (!selectedFood || !quantity || quantity <= 0) return;

		const foodItem = foods.find((food) => food.name === selectedFood);
		if (!foodItem) return;

		if (foodItem.stock < quantity) {
			alert(`Stock unavailable for "${selectedFood}".`);
			return;
		}

		setCart((prevCart) => {
			const existingItem = prevCart.find(
				(item) => item.food_name === selectedFood
			);
			return existingItem
				? prevCart.map((item) =>
						item.food_name === selectedFood
							? { ...item, quantity: item.quantity + Number(quantity) }
							: item
				  )
				: [
						...prevCart,
						{
							food_name: foodItem.name,
							price: foodItem.price,
							quantity: Number(quantity),
						},
				  ];
		});

		setSelectedFood("");
		setQuantity("");
	};

	// Remove an item from the cart
	const handleRemoveFromCart = (foodName) => {
		setCart((prevCart) =>
			prevCart.filter((item) => item.food_name !== foodName)
		);
	};

	// Process sale and generate receipt with stock check
	const handleProcessSale = async () => {
		if (cart.length === 0) return;

		try {
			const response = await axios.post(`${API_BASE_URL}/api/sales/add`, {
				items: cart.map(({ food_name, price, quantity }) => ({
					food_name,
					price,
					quantity,
				})),
				business_id: businessId,
			});

			setReceipt(response.data.receipt);
			setCart([]);
			alert("Sale processed successfully!");
		} catch (error) {
			alert(error.response?.data?.error || "Error processing sale.");
		}
	};

	return (
		<div>
			<Typography variant='h4' gutterBottom>
				Sales
			</Typography>

			{/* Add Sale Section */}
			<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
				<FormControl variant='outlined' style={{ minWidth: 200 }}>
					<InputLabel>Food Item</InputLabel>
					<Select
						value={selectedFood}
						onChange={(e) => setSelectedFood(e.target.value)}
						label='Food Item'
					>
						{foods.map((food) => (
							<MenuItem key={food.name} value={food.name}>
								{food.name} - KES {food.price} {/*(Stock: {food.stock})*/}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<TextField
					label='Quantity(C,P)'
					type='number'
					variant='outlined'
					value={quantity}
					onChange={(e) => setQuantity(e.target.value)}
				/>

				<Button variant='contained' color='primary' onClick={handleAddToCart}>
					Add to Cart
				</Button>
			</div>

			{/* Cart Table */}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Food Name</TableCell>
							<TableCell>Quantity(C,P)</TableCell>
							<TableCell>Price (KES)</TableCell>
							<TableCell>Total (KES)</TableCell>
							<TableCell>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{cart.map((item, index) => (
							<TableRow key={index}>
								<TableCell>{item.food_name}</TableCell>
								<TableCell>{item.quantity}</TableCell>
								<TableCell>KES {item.price}</TableCell>
								<TableCell>KES {item.quantity * item.price}</TableCell>
								<TableCell>
									<Button
										variant='contained'
										color='secondary'
										onClick={() => handleRemoveFromCart(item.food_name)}
									>
										Remove
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Button
				variant='contained'
				color='secondary'
				onClick={handleProcessSale}
				style={{ marginTop: 20 }}
			>
				Process Sale
			</Button>

			{/* Receipt Section */}
			{receipt && (
				<Receipt
					saleId={receipt.saleId}
					items={receipt.items || []}
					totalPrice={receipt.totalPrice || 0}
				/>
			)}

			{/* Recent Sales Table */}
			<Typography variant='h5' style={{ marginTop: 20 }}>
				Recent Sales
			</Typography>
			<TableContainer component={Paper} style={{ marginTop: 10 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Sale ID</TableCell>
							<TableCell>Food Name</TableCell>
							<TableCell>Quantity(C,P)</TableCell>
							<TableCell>Total Price (KES)</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sales.map((sale, index) => (
							<TableRow key={index}>
								<TableCell>{sale.sale_id}</TableCell>
								<TableCell>{sale.food_name}</TableCell>
								<TableCell>{sale.quantity}</TableCell>
								<TableCell>KES {sale.total_price}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
};

export default Sales;
