/** @format */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { Edit, Delete, PersonAdd } from "@mui/icons-material";
import API_BASE_URL from "../config";

const UserManagement = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editUser, setEditUser] = useState(null);
	const [newName, setNewName] = useState("");
	const [newEmail, setNewEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const fetchUsers = async () => {
		setLoading(true);
		setError("");

		const token = localStorage.getItem("token");
		if (!token) {
			setError("Unauthorized: No token found.");
			setLoading(false);
			return;
		}

		try {
			const response = await axios.get(`${API_BASE_URL}/api/users/business`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (Array.isArray(response.data)) {
				setUsers(response.data);
			} else {
				setError("Invalid response format.");
			}
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("Failed to load users.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleEditClick = (user) => {
		setEditUser(user);
		setNewName(user.name);
		setNewEmail(user.email);
		setOpenEditDialog(true);
	};

	const handleUpdateUser = async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			setError("Unauthorized: No token found.");
			return;
		}

		try {
			await axios.put(
				`${API_BASE_URL}/api/users/${editUser.id}`,
				{
					name: newName,
					email: newEmail,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setOpenEditDialog(false);
			fetchUsers();
		} catch (err) {
			console.error("Update failed:", err);
			setError("Failed to update user.");
		}
	};

	const handleDeleteUser = async (id) => {
		const token = localStorage.getItem("token");
		if (!token) {
			setError("Unauthorized: No token found.");
			return;
		}

		try {
			await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			fetchUsers();
		} catch (err) {
			console.error("Delete failed:", err);
			setError("Failed to delete user.");
		}
	};

	const handleCreateSalesperson = async () => {
		if (!newName || !newEmail || !newPassword) {
			setError("All fields are required.");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			setError("Unauthorized: No token found.");
			return;
		}

		try {
			await axios.post(
				`${API_BASE_URL}/api/users/create`,
				{
					name: newName,
					email: newEmail,
					password: newPassword,
					role: "salesperson",
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setOpenCreateDialog(false);
			fetchUsers();
		} catch (err) {
			console.error("Create failed:", err);
			setError("Failed to create salesperson.");
		}
	};

	return (
		<Box>
			<Typography variant='h5' gutterBottom>
				User Management
			</Typography>

			<Button
				variant='contained'
				color='primary'
				startIcon={<PersonAdd />}
				onClick={() => setOpenCreateDialog(true)}
				sx={{ mb: 2, mr: 2 }}
			>
				Create Salesperson
			</Button>

			{loading ? (
				<CircularProgress />
			) : error ? (
				<Typography color='error'>{error}</Typography>
			) : users.length === 0 ? (
				<Typography>No users found.</Typography>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Role</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
									<TableCell>
										<IconButton onClick={() => handleEditClick(user)}>
											<Edit />
										</IconButton>
										<IconButton onClick={() => handleDeleteUser(user.id)}>
											<Delete />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Edit User Dialog */}
			<Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
				<DialogTitle>Edit User</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label='Name'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						margin='normal'
					/>
					<TextField
						fullWidth
						label='Email'
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						margin='normal'
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
					<Button onClick={handleUpdateUser} color='primary'>
						Update
					</Button>
				</DialogActions>
			</Dialog>

			{/* Create Salesperson Dialog */}
			<Dialog
				open={openCreateDialog}
				onClose={() => setOpenCreateDialog(false)}
			>
				<DialogTitle>Create Salesperson</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label='Name'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						margin='normal'
					/>
					<TextField
						fullWidth
						label='Email'
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						margin='normal'
					/>
					<TextField
						fullWidth
						label='Password'
						type='password'
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						margin='normal'
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
					<Button onClick={handleCreateSalesperson} color='primary'>
						Create
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default UserManagement;
