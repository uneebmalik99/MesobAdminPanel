// import React, { useState, useEffect } from "react";
// import DataTable from "react-data-table-component";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardTitle,
//   Row,
//   Col,
//   Input,
//   Spinner,
//   Dropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
// } from "reactstrap";
// import PanelHeader from "components/PanelHeader/PanelHeader.js";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import formatDate from "utils/formatDate";
// import { Helmet } from "react-helmet";
//
// const Orders = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dropdownOpen, setDropdownOpen] = useState(null); // For managing dropdown state
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     axios
//       .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items")
//       .then((response) => {
//         if (response.data) {
//           setItems(response.data);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("There was an error fetching the items!", error);
//       });
//   }, []);
//
//   const filteredData = items.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//
//   const toggleDropdown = (id) => {
//     setDropdownOpen((prevId) => (prevId === id ? null : id)); // Toggle the dropdown for the corresponding row
//   };
//
//   const handleView = (id) => {
//     navigate(`/admin/order/details/${id}`);
//   };
//
//   const handleEdit = (id) => {
//     navigate(`/admin/order/edit/${id}`);
//   };
//
//   const columns = [
//     {
//       name: "ID",
//       selector: (row, index) => index + 1,
//       width: "80px",
//       sortable: false,
//     },
//     {
//       name: "User ID",
//       selector: (row) => row.id,
//       sortable: true,
//       width: "320px",
//     },
//     {
//       name: "Name",
//       selector: (row) => row.name,
//       sortable: true,
//       width: "200px",
//     },
//     {
//       name: "Phone",
//       selector: (row) => row.phone ?? "-",
//       sortable: true,
//       width: "150px",
//     },
//     {
//       name: "City",
//       selector: (row) => row.city ?? "-",
//       sortable: true,
//       width: "150px",
//     },
//     {
//       name: "Is Sender",
//       selector: (row) => (row.isSender === true ? "Yes" : "No"),
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Created At",
//       selector: (row) => formatDate(row.createdAt),
//       sortable: true,
//       width: "250px",
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <Dropdown
//           isOpen={dropdownOpen === row.id}
//           toggle={() => toggleDropdown(row.id)}
//         >
//           <DropdownToggle color="dark" size="sm" caret>
//             Actions
//           </DropdownToggle>
//           <DropdownMenu>
//             <DropdownItem onClick={() => handleView(row.id)}>View</DropdownItem>
//             <DropdownItem onClick={() => handleEdit(row.id)}>Edit</DropdownItem>
//           </DropdownMenu>
//         </Dropdown>
//       ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//       button: true,
//     },
//   ];
//
//   return (
//     <>
//       <Helmet>
//         <title>Orders - Mesob Store</title>
//       </Helmet>
//
//       <PanelHeader
//         content={
//           <div className="header text-center">
//             <h2 className="title">Orders</h2>
//           </div>
//         }
//       />
//       <div className="content">
//         <Row>
//           <Col xs={12}>
//             <Card>
//               <CardHeader>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <CardTitle tag="h4">Orders</CardTitle>
//                   <Input
//                     type="text"
//                     placeholder="Search by name..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     style={{ marginLeft: "10px", width: "250px" }}
//                   />
//                 </div>
//               </CardHeader>
//               <CardBody>
//                 {loading ? (
//                   <div style={{ textAlign: "center", padding: "20px" }}>
//                     <Spinner color="primary" />
//                     <p>Loading orders...</p>
//                   </div>
//                 ) : (
//                   <DataTable
//                     columns={columns}
//                     data={filteredData}
//                     selectableRows
//                     pagination
//                     responsive
//                     fixedHeader={true}
//                   />
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </>
//   );
// };
//
// export default Orders;

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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import formatDate from "utils/formatDate";
import { Helmet } from "react-helmet";
import classnames from "classnames"; // For managing tab active class

const Orders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [activeTab, setActiveTab] = useState("1"); // State to manage active tab
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items")
      .then((response) => {
        if (response.data) {
          setItems(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the items!", error);
      });
  }, []);

  // const filteredData = items.filter((item) =>
  //   item.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Separate filters based on adminStatus
  const succeededOrders = items.filter(
    (item) => item.adminStatus === "Succeeded"
  );
  const attemptsOrders = items.filter(
    (item) => item.adminStatus === "Attempts" || item.adminStatus == null
  );
  const closedOrders = items.filter((item) => item.adminStatus === "Closed");

  // Apply search filtering based on searchTerm for each table
  const filteredSucceededOrders = succeededOrders.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttemptsOrders = attemptsOrders.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClosedOrders = closedOrders.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setDropdownOpen((prevId) => (prevId === id ? null : id));
  };

  const handleView = (id) => {
    navigate(`/admin/order/details/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/order/edit/${id}`);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

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
      selector: (row) => (row.isSender === true ? "Yes" : "No"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Created At",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      width: "250px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Dropdown
          isOpen={dropdownOpen === row.id}
          toggle={() => toggleDropdown(row.id)}
        >
          <DropdownToggle color="dark" size="sm" caret>
            Actions
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handleView(row.id)}>View</DropdownItem>
            <DropdownItem onClick={() => handleEdit(row.id)}>Edit</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

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
              <CardBody>
                {/* Tabs */}
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => toggleTab("1")}
                    >
                      Succeeded Orders
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => toggleTab("2")}
                    >
                      Attempts Orders
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => toggleTab("3")}
                    >
                      Closed Orders
                    </NavLink>
                  </NavItem>
                </Nav>

                {/* Tab Content */}
                <TabContent activeTab={activeTab}>
                  {/* Tab 1: Succeeded Orders */}
                  <TabPane tabId="1">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Succeeded Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredSucceededOrders}
                        selectableRows
                        pagination
                        responsive
                        fixedHeader={true}
                      />
                    )}
                  </TabPane>

                  {/* Tab 2: Attempts Orders */}
                  <TabPane tabId="2">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Attempts Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredAttemptsOrders}
                        selectableRows
                        pagination
                        responsive
                        fixedHeader={true}
                      />
                    )}
                  </TabPane>

                  {/* Tab 3: Closed Orders */}
                  <TabPane tabId="3">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Closed Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredClosedOrders}
                        selectableRows
                        pagination
                        responsive
                        fixedHeader={true}
                      />
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Orders;
