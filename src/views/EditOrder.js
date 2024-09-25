import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Spinner,
  Button,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import "../assets/css/OrderDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";

const EditOrder = () => {
  const { id } = useParams();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const notificationAlertRef = useRef(null);
  const navigate = useNavigate();

  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);

  const [totalSellingPrice, setTotalSellingPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [markStatus, setMarkStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items/${id}`
        );
        const itemData = response.data.Item;
        // console.log("itemData", itemData);

        // Parse senderAddress JSON string
        const senderAddressParsed = JSON.parse(itemData?.senderAddress || "{}");

        setOrderDetails(itemData);
        setOrderStatus(itemData.Status);
        setSenderEmail(senderAddressParsed.email);
        setRecipientEmail(itemData.useremail);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    if (orderDetails?.Products) {
      let totalSelling = 0;
      let totalCostAmount = 0;

      // Iterate through products to calculate totals
      orderDetails?.Products.forEach((product) => {
        const price = parseFloat(product.price.replace(/[$,]/g, ""));
        const cost = parseFloat(product.cost.replace(/[$,]/g, ""));
        const quantity = parseFloat(product.quantity);

        totalSelling += price * quantity;
        totalCostAmount += cost * quantity;
      });

      // Set the totals in the state
      setTotalSellingPrice(totalSelling);
      setTotalCost(totalCostAmount);
    }

    fetchOrderDetails();
  }, [id, orderDetails?.Products]);

  //   // Initialize variables for row rendering
  //   let productRows = [];
  //   const contentObj = orderDetails?.Products || [];
  //
  //   // Iterate through products to create rows
  //   contentObj.forEach((product, index) => {
  //     productRows.push(
  //       <tr key={index}>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {index + 1}
  //         </td>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {product.name}
  //         </td>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {product.country}
  //         </td>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {product.quantity}
  //         </td>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {product.cost}
  //         </td>
  //         <td
  //           style={{
  //             border: "1px solid #ccc",
  //             padding: "8px",
  //             textAlign: "center",
  //           }}
  //         >
  //           {product.price}
  //         </td>
  //       </tr>
  //     );
  //   });
  //
  //   // JSX for rendering the table and totals
  //   return (
  //     <div>
  //       <h2>Product Details:</h2>
  //       <table style={{ borderCollapse: "collapse", width: "100%" }}>
  //         <thead>
  //           <tr>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>Sr No.</th>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>
  //               Country
  //             </th>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>
  //               Quantity
  //             </th>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>Cost</th>
  //             <th style={{ border: "1px solid #ccc", padding: "8px" }}>
  //               Selling Price
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody>{productRows}</tbody>
  //       </table>
  //
  //       <p>Total Promo Discount: ${orderDetails.promoDiscount}</p>
  //       <p>Total Selling Price: ${totalSellingPrice.toFixed(2)}</p>
  //       <p>Total Cost Price: ${totalCost.toFixed(2)}</p>
  //       <p>Thank you for your order!</p>
  //     </div>
  //   );

  const getEmailContentByStatus = (status) => {
    switch (status) {
      case "Shipped":
        return `
        <div style="display: flex; align-items: center;">
          <h2 style="font-style: italic; color: black; margin-right: 10px;">
            <span style="color: red;">M</span>esob 
            <span style="color: red;">S</span>tore
          </h2>
          <div style="display: flex; justify-content: center; align-items: center;">
            <img style="margin-top:5px; max-width: 35px; height: 35px; vertical-align: middle;" src="http://admin.mesobstore.com/app-icon.png" alt="Your Logo">
          </div>
        </div>
        <p style="color:black;">Dear customer,<br />
        We are excited to let you know that your order has been shipped!<br />
        If you have any questions or need further assistance, please don’t hesitate to contact our customer service team at mesob@mesobstore.com or 614-580-7521.
        <br />
        <br />
        Thank you for shopping with Mesob Store! We hope you enjoy your purchase and look forward to serving you again.</p>
      `;
      case "Delivered":
        return `
        <div style="display: flex; align-items: center;">
          <h2 style="font-style: italic; color: black; margin-right: 10px;">
            <span style="color: red;">M</span>esob 
            <span style="color: red;">S</span>tore
          </h2>
          <div style="display: flex; justify-content: center; align-items: center;">
            <img style="margin-top:5px; max-width: 35px; height: 35px; vertical-align: middle;" src="http://admin.mesobstore.com/app-icon.png" alt="Your Logo">
          </div>
        </div>
        <p style="color:black;">Dear customer,<br />
        We are pleased to inform you that your order has been successfully delivered!<br />
        If you have any questions or need further assistance, please don’t hesitate to contact our customer service team.
        <br />
        <br />
        Thank you for shopping with Mesob Store!</p>
      `;
      case "Ordered":
        return `
        <h3>1. Sender Info: </h3>
        <ul>
          <li>Name: ${orderDetails.sender.name}</li>
          <li>Email: ${orderDetails.sender.email}</li>
          <li>Address: ${orderDetails.sender.address}</li>
          <li>Phone: ${orderDetails.sender.phone}</li>
          <li>City: ${orderDetails.sender.city}</li>
          <li>State: ${orderDetails.sender.state}</li>
          <li>Zip Code: ${orderDetails.sender.pincode}</li>
        </ul>
        <h3>2. Receiver Info: </h3>
        <ul>
          <li>Name: ${orderDetails.receiver.name}</li>
          <li>Street Address: ${orderDetails.receiver.address}</li>
          <li>Phone: ${orderDetails.receiver.phone}</li>
          <li>City: ${orderDetails.receiver.city}</li>
        </ul>
        <h2>Product Details:</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px;">Sr No.</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Name</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Country</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Cost</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Selling Price</th>
            </tr>
          </thead>
          <tbody>
            ${tableHTML}
          </tbody>
        </table>
        <p>Total Promo Discount: $${orderDetails.promoDiscount}</p>
        <p>Total Selling Price: $${totalSellingPrice.toFixed(2)}</p>
        <p>Total Cost Price: $${totalCost.toFixed(2)}</p>
        <p>Thank you for your order!</p>
      `;
    }
  };

  const handleStatusChange = (e) => {
    setOrderStatus(e.target.value);
  };

  const handleMarkStatusChange = (e) => {
    setMarkStatus(e.target.value);
  };

  const notify = (place, message, type) => {
    const options = {
      place: place,
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(
        `https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items/${id}?Status=${orderStatus}`
      );

      // Check if the response status code is 200
      if (response.status === 200) {
        notify("tr", "Order status updated successfully!", "success");

        // Check if sender and recipient emails are provided before sending
        if (senderEmail || recipientEmail) {
          // Get email subject and message based on order status
          const emailMessage = getEmailContentByStatus(orderStatus);

          // Send emails to both sender and recipient
          const senderEmailResponse = await sendEmail(
            senderEmail,
            emailMessage,
            `Order Status: ${orderStatus}`
          );
          const recipientEmailResponse = await sendEmail(
            recipientEmail,
            emailMessage,
            `Order Status: ${orderStatus}`
          );

          // Notify user based on email sending result
          if (
            senderEmailResponse.statusCode === 200 ||
            recipientEmailResponse.statusCode === 200
          ) {
            notify("tr", "Emails sent successfully!", "success");
          } else {
            notify("tr", "Failed to send emails.", "danger");
          }
        }
      } else {
        let errorMessage = "Failed to update order status.";
        notify("tr", errorMessage, "danger");
      }
      setUpdateBtnLoading(false);
    } catch (error) {
      console.error("Error updating order status or sending emails:", error);
      notify("tr", "Failed to update order status", "danger");
    }
  };

  // Function to send email
  const sendEmail = async (email, message, subject) => {
    const payload = {
      email,
      message,
      subject,
    };

    try {
      setUpdateBtnLoading(true);
      // Make POST request to the API URL
      const response = await axios.post(
        "https://q0v1vrhy5g.execute-api.us-east-1.amazonaws.com/staging",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log response (similar to PHP's error_log)
      console.log("Email API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(error.response?.data?.message || "Error sending email");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spinner color="primary" />
        <p>Loading order details...</p>
      </div>
    );
  }

  const senderInfo = JSON.parse(orderDetails.senderAddress || "{}");
  const receiverInfo = {
    name: orderDetails.name,
    email: orderDetails.useremail,
    phone: orderDetails.phone,
    address: orderDetails.address,
    city: orderDetails.city,
    state: orderDetails.state,
    country: orderDetails.country,
  };

  return (
    <>
      <Helmet>
        <title>Edit Order - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Edit Order</h2>
          </div>
        }
      />
      <NotificationAlert ref={notificationAlertRef} />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card className="order-card">
              <CardHeader className="order-header">
                <div className="d-flex align-items-center">
                  <Button
                    className="btn btn-link"
                    onClick={() => navigate("/admin/orders")}
                    style={{ fontSize: "20px", marginRight: "10px" }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <h4 className="card-title">
                    <b>Order ID:</b> {orderDetails.id}
                  </h4>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  {/* Sender Info */}
                  <Col md={6} className="order-info-col">
                    <h5 className="section-heading">Sender Information</h5>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Name:</strong> {senderInfo.name}
                      </li>
                      <li>
                        <strong>Email:</strong> {senderInfo.email}
                      </li>
                      <li>
                        <strong>Phone:</strong> {senderInfo.phone}
                      </li>
                      <li>
                        <strong>Address:</strong> {senderInfo.address}
                      </li>
                      <li>
                        <strong>City:</strong> {senderInfo.city}
                      </li>
                      <li>
                        <strong>State:</strong> {senderInfo.state}
                      </li>
                      <li>
                        <strong>Pin Code:</strong> {senderInfo.pincode}
                      </li>
                    </ul>
                  </Col>

                  {/* Receiver Info */}
                  <Col md={6} className="order-info-col">
                    <h5 className="section-heading">Receiver Information</h5>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Name:</strong> {receiverInfo.name}
                      </li>
                      <li>
                        <strong>Email:</strong> {receiverInfo.email}
                      </li>
                      <li>
                        <strong>Phone:</strong> {receiverInfo.phone}
                      </li>
                      <li>
                        <strong>Address:</strong> {receiverInfo.address}
                      </li>
                      <li>
                        <strong>City:</strong> {receiverInfo.city}
                      </li>
                      <li>
                        <strong>State:</strong> {receiverInfo.state}
                      </li>
                      <li>
                        <strong>Country:</strong> {receiverInfo.country}
                      </li>
                    </ul>
                  </Col>
                </Row>

                {/* Conditionally render Tracking Company and Tracking No */}
                {orderDetails.trackingCompany && orderDetails.trackingNo && (
                  <>
                    <p>
                      <b>Tracking Company:</b> {orderDetails.trackingCompany}
                    </p>
                    <p>
                      <b>Tracking No:</b> {orderDetails.trackingNo}
                    </p>
                  </>
                )}

                {/* Order Status */}
                {/* <h5 className="section-heading mt-4">Order Status</h5> */}
                <FormGroup>
                  <Label>Order Status</Label>
                  <Input
                    type="select"
                    name="orderStatus"
                    id="orderStatus"
                    value={orderStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="Ordered">Ordered</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </Input>
                </FormGroup>

                <hr className="mt-5" />

                {/* Mark Status */}
                <h5 className="section-heading">Admin Info</h5>
                <FormGroup>
                  <Label>Mark Status</Label>
                  <Input
                    id="status"
                    value={markStatus}
                    onChange={handleMarkStatusChange}
                    type="select"
                  >
                    <option value="Succeeded">Succeeded</option>
                    <option value="Attempts">Attempts</option>
                    <option value="Closed">Closed</option>
                  </Input>
                </FormGroup>

                {/* Admin Notes */}
                <FormGroup>
                  <Label>Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={handleStatusChange}
                    type="textarea"
                  />
                </FormGroup>

                {/* Save Button */}
                <Button
                  color="info"
                  className="btn-round"
                  onClick={handleSave}
                  disabled={updateBtnLoading}
                >
                  {updateBtnLoading ? (
                    <>
                      Updating...
                      <Spinner color="primary" size="sm" className="ml-1" />
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EditOrder;
