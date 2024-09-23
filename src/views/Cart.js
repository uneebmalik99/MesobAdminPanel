import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import formatDate from "utils/formatDate";
import { Helmet } from "react-helmet";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // For single user
  const [selectedUser, setSelectedUser] = useState(null); // User data for modal
  const [modalCartItem, setModalCartItems] = useState(false); // Modal state
  const [subjectCartItem, setSubjectCartItem] = useState("");
  const [bodyCartItem, setBodyCartItem] = useState("");

  // for multiple users
  const [selectedUsers, setSelectedUsers] = useState([]); // Store selected users
  const [modalMultiUsers, setModalMultiUsers] = useState(false); // Modal state
  const [subjectMultiUsers, setSubjectMultiUsers] = useState("");
  const [bodyMultiUsers, setBodyMultiUsers] = useState("");

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/users")
      .then((response) => {
        if (response.data) {
          setItems(response.data.Items);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the items!", error);
      });
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setModalCartItems(true);
  };

  const handleEmailSend = () => {
    // Handle the email sending logic here
    console.log("Sending email with subject:", subject, "and body:", body);
    // Close modal after sending email
    setModalCartItems(false);
  };

  const handleRowSelected = (state) => {
    setSelectedUsers(state.selectedRows);
  };

  const handleViewEmails = () => {
    setModalMultiUsers(true);
  };

  const handleMultipleEmailSend = () => {
    const emails = selectedUsers.map((user) => user.email).join(", ");
    console.log("Sending email to:", emails);
    console.log("Subject:", subject);
    console.log("Body:", body);
    // Add your email sending logic here
    setModalMultiUsers(false);
    // Clear subject and body after sending
    setSubjectMultiUsers("");
    setBodyMultiUsers("");
  };

  const filteredData = items
    .filter((item) => item.CartItem && item.CartItem.length >= 1) // Only show users with Cart_Count > 1
    .filter((item) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) // Apply search filter
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Sort by updatedAt in descending order

  const columns = [
    {
      name: "ID",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "User ID",
      selector: (row) => row.id,
      sortable: true,
      width: "320px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "300px",
    },
    {
      name: "Cart Count",
      selector: (row) => row.CartItem?.length || 0,
      sortable: true,
      width: "150px",
    },
    {
      name: "Updated At",
      selector: (row) => formatDate(row.updatedAt),
      sortable: true,
      width: "250px",
    },
    {
      name: "Cart Items",
      cell: (row) => (
        <Button
          onClick={() => handleView(row)}
          color="info"
          className="btn-round btn-sm"
        >
          {"View"}
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Cart - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Cart</h2>
          </div>
        }
      />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <CardTitle tag="h4">Cart</CardTitle>
                  <Input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: "10px", width: "250px" }}
                  />
                  <Button
                    color="secondary"
                    className="btn-round"
                    onClick={handleViewEmails}
                    disabled={selectedUsers.length === 0}
                  >
                    Send Email to Selected
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading cart...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    selectableRows
                    onSelectedRowsChange={handleRowSelected}
                    pagination
                    responsive
                    fixedHeader={true}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal for viewing user cart items */}
      <Modal
        isOpen={modalCartItem}
        toggle={() => setModalCartItems(false)}
        size="xl"
      >
        <ModalHeader toggle={() => setModalCartItems(false)}>
          Cart Items for {selectedUser?.email}
        </ModalHeader>
        <ModalBody>
          {selectedUser ? (
            <>
              {selectedUser.CartItem.length > 0 ? (
                <Table bordered responsive>
                  <thead>
                    <tr>
                      <td className="font-weight-bold">#</td>
                      <td className="font-weight-bold">Product Title</td>
                      <td className="font-weight-bold">Quantity</td>
                      <td className="font-weight-bold">Category</td>
                      <td className="font-weight-bold">Price</td>
                      <td className="font-weight-bold">Cost</td>
                      <td className="font-weight-bold">isRecommended</td>
                      <td className="font-weight-bold">Off Percentage</td>
                      <td className="font-weight-bold">Country</td>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.CartItem.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.title}</td>
                        <td>{item.qty}</td>
                        <td>{item.category}</td>
                        <td>{item.content.price}</td>
                        <td>{item.content.cost}</td>
                        <td>{item.isRecommended == true ? "Yes" : "No"}</td>
                        <td>{item.off_percentage ?? "-"}</td>
                        <td>{item.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No items in the cart.</p>
              )}
              <hr />
              <h4>Send Email</h4>
              <Form>
                <FormGroup>
                  <Label for="subject">Subject</Label>
                  <Input
                    type="text"
                    id="subject"
                    value={subjectCartItem}
                    onChange={(e) => setSubjectCartItem(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="body">Body</Label>
                  <Input
                    type="textarea"
                    id="body"
                    value={bodyCartItem}
                    onChange={(e) => setBodyCartItem(e.target.value)}
                  />
                </FormGroup>
                <Button color="primary" onClick={handleEmailSend}>
                  Send Email
                </Button>
              </Form>
            </>
          ) : (
            <p>No data available</p>
          )}
        </ModalBody>
      </Modal>

      {/* Modal for sending emails */}
      <Modal
        isOpen={modalMultiUsers}
        toggle={() => setModalMultiUsers(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setModalMultiUsers(false)}>
          Send Email to Selected Users
        </ModalHeader>
        <ModalBody>
          <Table bordered responsive>
            <thead>
              <tr>
                <td className="font-weight-bold">Selected Emails</td>
              </tr>
            </thead>
            {selectedUsers.map((user) => (
              <tbody>
                <tr key={user.id}>
                  <td>{user.email}</td>
                </tr>
              </tbody>
            ))}
          </Table>
          <hr />
          <h4>Send Email</h4>
          <Form>
            <FormGroup>
              <Label for="subject">Subject</Label>
              <Input
                type="text"
                id="subject"
                value={subjectMultiUsers}
                onChange={(e) => setSubjectMultiUsers(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="body">Body</Label>
              <Input
                type="textarea"
                id="body"
                value={bodyMultiUsers}
                onChange={(e) => setBodyMultiUsers(e.target.value)}
              />
            </FormGroup>
            <Button color="primary" onClick={handleMultipleEmailSend}>
              Send Email
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default Cart;
