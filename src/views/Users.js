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
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import formatDate from "utils/formatDate";
import { Helmet } from "react-helmet";

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
    name: "Phone",
    selector: (row) => row.phoneNo ?? "-",
    sortable: true,
    width: "150px",
  },
  {
    name: "Created At",
    selector: (row) => formatDate(row.createdAt),
    sortable: true,
    width: "250px",
  },
  {
    name: "Updated At",
    selector: (row) => formatDate(row.updatedAt),
    sortable: true,
    width: "250px",
  },
];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); // Track selected rows
  const [modalOpen, setModalOpen] = useState(false); // Modal state

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/users")
      .then((response) => {
        if (response.data.Items) {
          setUsers(response.data.Items);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
      });
  }, []);

  const filteredData = users.filter((item) => {
    return item.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleEmailSend = () => {
    // Handle the email sending logic here
    console.log("Sending email with subject:", subject, "and body:", body);
    // Close modal after sending email
    setModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Users - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Users</h2>
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
                  <CardTitle tag="h4">Users</CardTitle>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      color="secondary"
                      className="btn-round btn-sm"
                      read-only
                    >
                      Users &nbsp;
                      <Badge
                        color="dark"
                        style={{ marginRight: "10px", fontSize: "12px" }}
                      >
                        {users.length}
                      </Badge>
                    </Button>
                    <Button
                      color="info"
                      className="ml-2 btn-round btn-sm"
                      onClick={toggleModal}
                      disabled={selectedRows.length === 0}
                    >
                      Send Email
                    </Button>
                    <Input
                      type="text"
                      placeholder="Search by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ marginLeft: "10px", width: "250px" }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading users...</p>
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

      {/* Modal for sending emails to selected users */}
      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>
          Send Email to Selected Users
        </ModalHeader>
        <ModalBody>
          {selectedRows.length > 0 ? (
            <DataTable
              columns={[{ name: "Emails", selector: (row) => row.email }]}
              data={selectedRows}
              pagination
              paginationPerPage={3} // Set how many emails to show per page
              paginationRowsPerPageOptions={[3, 10, 20, 50]}
            />
          ) : (
            <p>No users selected.</p>
          )}
          <hr />
          <h6 className="mb-3">Send Email</h6>
          <Form>
            <FormGroup>
              <Label for="subject">Subject</Label>
              <Input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="body">Body</Label>
              <Input
                type="textarea"
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </FormGroup>
            <Button color="info" className="btn-round" onClick={handleEmailSend}>
              Send Email
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default Users;
