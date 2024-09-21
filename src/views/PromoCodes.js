import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Form,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";

// Dropdown action cell component
const ActionDropdown = ({ row, onEdit }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret>Actions</DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => onEdit(row)}>Edit</DropdownItem>
        <DropdownItem onClick={() => handleAction("delete", row.id)}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const columns = (onEdit) => [
  {
    name: "ID",
    selector: (row) => row.id,
    sortable: true,
    width: "70px",
  },
  {
    name: "Code",
    selector: (row) => row.Code,
    sortable: true,
    width: "150px",
  },
  {
    name: "Is Active",
    selector: (row) => (row.Status ? "Yes" : "No"),
    sortable: true,
    width: "100px",
  },
  {
    name: "Discount Percentage",
    selector: (row) => row.Discount,
    sortable: true,
    width: "200px",
  },
  {
    name: "Discount Type",
    selector: (row) => row.Discount_Type,
    sortable: true,
    width: "150px",
  },
  {
    name: "Order Limit",
    selector: (row) => row.Order_Limit,
    sortable: true,
    width: "150px",
  },
  {
    name: "Display",
    selector: (row) => (row.Display == 1 ? "Yes" : "No"),
    sortable: true,
    width: "100px",
  },
  {
    name: "Auto",
    selector: (row) => (row.Auto == 1 ? "Yes" : "No"),
    sortable: true,
    width: "100px",
  },
  {
    name: "Manual",
    selector: (row) => (row.Manual == 1 ? "Yes" : "No"),
    sortable: true,
    width: "100px",
  },
  {
    name: "Action",
    cell: (row) => <ActionDropdown row={row} onEdit={onEdit} />,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "150px",
  },
];

function PromoCodes() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const toggleModal = (isEdit = false, promo = null) => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      // If closing the modal, reset the promo
      setSelectedPromo(null);
      setIsEditMode(false);
    } else if (isEdit && promo) {
      // If opening for edit, set selected promo data
      setSelectedPromo(promo);
      setIsEditMode(true);
    }
  };

  useEffect(() => {
    axios
      .get(
        "https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/promocode"
      )
      .then((response) => {
        setData(response.data.Items || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching promo codes:", error);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    if (isEditMode) {
      // Logic to update existing promo code
      setData((prevData) =>
        prevData.map((promo) =>
          promo.id === selectedPromo.id ? selectedPromo : promo
        )
      );
    } else {
      // Logic to add new promo code
      setData((prevData) => [
        ...prevData,
        { ...selectedPromo, id: Date.now() }, // Example ID assignment
      ]);
    }
    toggleModal(); // Close the modal after saving
  };

  const filteredData = data.filter((item) => {
    return (
      item.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Discount_Type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Helmet>
        <title>Promo Codes - Mesob Store</title>
      </Helmet>

      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Promo Codes</h2>
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
                  <CardTitle tag="h4">Promo Codes</CardTitle>
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: "10px", width: "250px" }}
                  />
                  <Button color="info" onClick={() => toggleModal()}>
                    Add Promo Code
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                    <p>Loading promo codes...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns((promo) => toggleModal(true, promo))}
                    data={filteredData}
                    selectableRows
                    pagination
                    responsive
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal for adding/editing promo code */}
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        backdrop={true}
        centered={true}
      >
        <ModalHeader toggle={toggleModal}>
          {isEditMode ? "Edit Promo Code" : "Add Promo Code"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="promoCode">Promo Code</Label>
                  <Input
                    type="text"
                    id="promoCode"
                    value={selectedPromo?.Code || ""}
                    onChange={(e) =>
                      setSelectedPromo((prev) => ({
                        ...prev,
                        Code: e.target.value,
                      }))
                    }
                    placeholder="Enter promo code"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="discountType">Discount Type</Label>
                  <Input
                    type="text"
                    id="discountType"
                    value={selectedPromo?.Discount_Type || ""}
                    onChange={(e) =>
                      setSelectedPromo((prev) => ({
                        ...prev,
                        Discount_Type: e.target.value,
                      }))
                    }
                    placeholder="Enter discount type"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="discountPercentage">Discount Percentage</Label>
                  <Input
                    type="number"
                    id="discountPercentage"
                    value={selectedPromo?.Discount || ""}
                    onChange={(e) =>
                      setSelectedPromo((prev) => ({
                        ...prev,
                        Discount: e.target.value,
                      }))
                    }
                    placeholder="Enter discount percentage"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="orderLimit">Order Limit</Label>
                  <Input
                    type="number"
                    id="orderLimit"
                    value={selectedPromo?.Order_Limit || ""}
                    onChange={(e) =>
                      setSelectedPromo((prev) => ({
                        ...prev,
                        Order_Limit: e.target.value,
                      }))
                    }
                    placeholder="Enter order limit"
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* New fields for Display, Auto, Manual, IsActive */}
            <Row form>
              <Col md={6}>
                <FormGroup tag="fieldset">
                  <Label check inline>
                    Display
                  </Label>
                  <FormGroup check>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="display"
                        value="1"
                        checked={selectedPromo?.Display === 1}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Display: 1,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      Yes
                    </Label>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="display"
                        value="0"
                        checked={selectedPromo?.Display === 0}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Display: 0,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      No
                    </Label>
                  </FormGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup tag="fieldset">
                  <Label check>Is Active</Label>
                  <FormGroup check>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="isActive"
                        value="1"
                        checked={selectedPromo?.Status === "1"}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Status: "1",
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      Yes
                    </Label>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="isActive"
                        value="0"
                        checked={selectedPromo?.Status === 0}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Status: 0,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      No
                    </Label>
                  </FormGroup>
                </FormGroup>
              </Col>
            </Row>
            <Row form>
              <Col md={6}>
                <FormGroup tag="fieldset">
                  <Label check>Auto</Label>
                  <FormGroup check>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="auto"
                        value="1"
                        checked={selectedPromo?.Auto === 1}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Auto: 1,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      Yes
                    </Label>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="auto"
                        value="0"
                        checked={selectedPromo?.Auto === 0}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Auto: 0,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      No
                    </Label>
                  </FormGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup tag="fieldset">
                  <Label check>Manual</Label>
                  <FormGroup check>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="manual"
                        value="1"
                        checked={selectedPromo?.Manual === 1}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Manual: 1,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      Yes
                    </Label>
                    <Label className="d-flex">
                      <Input
                        type="radio"
                        name="manual"
                        value="0"
                        checked={selectedPromo?.Manual === 0}
                        onChange={() =>
                          setSelectedPromo((prev) => ({
                            ...prev,
                            Manual: 0,
                          }))
                        }
                        style={{ marginRight: "8px" }}
                      />
                      No
                    </Label>
                  </FormGroup>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="info" onClick={handleSave}>
            Save
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default PromoCodes;
