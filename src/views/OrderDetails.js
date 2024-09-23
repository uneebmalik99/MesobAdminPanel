import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Table,
  Spinner,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import "../assets/css/OrderDetails.css"; // Assuming you add the CSS above to a file

const OrderDetails = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details by ID
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items/${id}`
        );
        setOrderDetails(response.data.Item); // Access the "Item" in the response
        console.log("Order details:", response.data.Item);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const parseSenderAddress = (addressString) => {
    try {
      return JSON.parse(addressString);
    } catch (e) {
      console.error("Error parsing sender address:", e);
      return {};
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

  const senderInfo = parseSenderAddress(orderDetails.senderAddress);
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
        <title>Order Details - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Order Details</h2>
          </div>
        }
      />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card className="order-card">
              <CardHeader className="order-header">
                <h4 className="card-title">Order ID: {orderDetails.id}</h4>
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

                {/* Products Table */}
                <h5 className="section-heading mt-4">Products</h5>
                <Table responsive bordered className="order-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Cost</th>
                      <th>Price</th>
                      <th>Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.Products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.title}
                            className="img-fluid"
                          />
                        </td>
                        <td>{product.title}</td>
                        <td>{product.description}</td>
                        <td>{product.qty}</td>
                        <td>{product.cost}</td>
                        <td>{product.price}</td>
                        <td>{product.off_percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderDetails;
