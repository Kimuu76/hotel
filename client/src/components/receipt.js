/** @format */

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const Receipt = ({ saleId, items, totalPrice }) => {
	const receiptRef = useRef();
	const [businessName, setBusinessName] = useState("Loading...");

	// Fetch Business Name from API
	useEffect(() => {
		const fetchBusinessName = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) throw new Error("No token found");

				const response = await axios.get(
					"http://localhost:5000/api/dashboard/business-name",
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setBusinessName(response.data.businessName);
			} catch (error) {
				console.error(
					"Error fetching business name:",
					error.response?.data || error.message
				);
				setBusinessName("Unknown Business");
			}
		};

		fetchBusinessName();
	}, []);

	// Print only the receipt using a new print window
	const handlePrint = () => {
		const printWindow = window.open("", "_blank");
		printWindow.document.write(` 
      <html>
        <head>
          <title>Receipt</title>
          <style>
            .receipt-container {
              width: 300px;
              margin: auto;
              padding: 15px;
              border: 1px solid #ddd;
              box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
              font-family: Arial, sans-serif;
            }
            h2 {
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            .total {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class='receipt-container'>
            <h2>${businessName}</h2>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Receipt #: ${saleId}</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
									.map(
										(item) => ` 
                  <tr>
                    <td>${item.food_name}</td>
                    <td>${item.quantity}</td>
                    <td>KES ${item.price.toFixed(2)}</td>
                    <td>KES ${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `
									)
									.join("")}
              </tbody>
            </table>
            <p class='total'>Total: KES ${totalPrice.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `);

		printWindow.document.close();
		printWindow.print();
		printWindow.close();
	};

	return (
		<div className='receipt-container' ref={receiptRef}>
			<h2>{businessName}</h2>
			<p>Date: {new Date().toLocaleDateString()}</p>
			<p>Receipt #: {saleId}</p>

			<table>
				<thead>
					<tr>
						<th>Item</th>
						<th>Qty</th>
						<th>Price</th>
						<th>Total</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item, index) => (
						<tr key={index}>
							<td>{item.food_name}</td>
							<td>{item.quantity}</td>
							<td>KES {item.price.toFixed(2)}</td>
							<td>KES {(item.price * item.quantity).toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</table>

			<p className='total'>Total: KES {totalPrice.toFixed(2)}</p>

			<div className='btn-container'>
				<button onClick={handlePrint}>Print Receipt</button>
			</div>

			<style>
				{`
        .receipt-container {
          width: 300px;
          margin: auto;
          padding: 15px;
          border: 1px solid #ddd;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-family: Arial, sans-serif;
        }
        h2 {
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        .total {
          font-weight: bold;
        }
        .btn-container {
          margin-top: 15px;
        }
        button {
          padding: 10px 15px;
          background: #28a745;
          color: white;
          border: none;
          cursor: pointer;
          margin-right: 10px;
        }
        button:hover {
          background: #218838;
        }
      `}
			</style>
		</div>
	);
};

export default Receipt;