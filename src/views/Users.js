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

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/users")
      .then((response) => {
        if (response.data.Items) {
          setUsers(response.data.Items);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false once data is fetched
      });
  }, []);

  const filteredData = users.filter((item) => {
    return item.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                  <Input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: "10px", width: "250px" }}
                  />
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
    </>
  );
}

export default Users;
