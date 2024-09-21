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
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "200px",
  },
  {
    name: "Phone",
    selector: (row) => row.phone ?? "-",
    sortable: true,
    width: "150px",
  },
  {
    name: "City",
    selector: (row) => row.city ?? "-",
    sortable: true,
    width: "150px",
  },
  {
    name: "Is Sender",
    selector: (row) => (row.isSender == true ? "Yes" : "No"),
    sortable: true,
    width: "120px",
  },
  {
    name: "Created At",
    selector: (row) => formatDate(row.createdAt),
    sortable: true,
    width: "250px",
  },
];

function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items")
      .then((response) => {
        if (response.data) {
          setItems(response.data);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the items!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredData = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Orders - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Orders</h2>
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
                  <CardTitle tag="h4">Orders</CardTitle>
                  <Input
                    type="text"
                    placeholder="Search by name..."
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
                    <p>Loading orders...</p>
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

export default Orders;
