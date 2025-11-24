import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";

const API_BASE =
  process.env.REACT_APP_MESOB_API_BASE ||
  "https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev";

const defaultFormState = {
  title: "",
  description: "",
  image: "",
  menuId: "",
  subCategoryId: "",
  sellerPrice: "",
  stockQuantity: "",
  availableQuantity: "",
  shippingLocation: "",
  shippingDescription: "",
  country: "",
};

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const SellerProductManagement = () => {
  const sellerEmail = localStorage.getItem("user_email") || "";
  const sellerName = localStorage.getItem("user_name") || "";

  const [formState, setFormState] = useState(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const [pendingProducts, setPendingProducts] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      const items = response.data?.Items || response.data || [];
      const sorted = items.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setCategories(sorted);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchSubCategories = useCallback(async (menuId) => {
    if (!menuId) {
      setSubCategories([]);
      return;
    }
    setLoadingSubCategories(true);
    try {
      const response = await axios.get(
        `${API_BASE}/categories/${menuId}/subcategories`
      );
      const items = response.data?.Items || response.data || [];
      const filtered = items.filter((item) => item && item.id);
      const sorted = filtered.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setSubCategories(sorted);
    } catch (err) {
      console.error("Failed to load sub categories", err);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  }, []);

  const fetchPendingProducts = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await axios.get(`${API_BASE}/pending-products`, {
        params: { sellerEmail },
      });
      const items = response.data?.Items || response.data || [];
      const visibleItems = items.filter(
        (item) => (item.status || "pending") !== "deleted"
      );
      const sorted = visibleItems.sort((a, b) =>
        (b.updatedAt || b.createdAt || "").localeCompare(
          a.updatedAt || a.createdAt || ""
        )
      );
      setPendingProducts(sorted);
    } catch (err) {
      console.error("Failed to load pending products", err);
      setPendingProducts([]);
    } finally {
      setLoadingPending(false);
    }
  }, [sellerEmail]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  useEffect(() => {
    if (formState.menuId) {
      fetchSubCategories(formState.menuId);
    } else {
      setSubCategories([]);
    }
  }, [formState.menuId, fetchSubCategories]);

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.menuId || !formState.sellerPrice) {
      setFeedback({
        type: "danger",
        message: "Title, Category, and Price are required.",
      });
      return;
    }
    setSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        image: formState.image.trim(),
        menuId: formState.menuId,
        menuName:
          categories.find((cat) => String(cat.id) === String(formState.menuId))
            ?.name || "",
        subCategoryId: formState.subCategoryId || "",
        subCategoryName:
          subCategories.find(
            (sub) => String(sub.id) === String(formState.subCategoryId)
          )?.name || "",
        sellerPrice: Number(formState.sellerPrice),
        stockQuantity: formState.stockQuantity,
        availableQuantity: formState.availableQuantity,
        shippingLocation: formState.shippingLocation,
        shippingDescription: formState.shippingDescription,
        country: formState.country,
        sellerEmail,
        sellerName,
      };
      await axios.post(`${API_BASE}/pending-products`, payload);
      setFeedback({
        type: "success",
        message: "Product submitted for approval.",
      });
      resetForm();
      fetchPendingProducts();
    } catch (err) {
      console.error("Failed to submit product", err);
      setFeedback({
        type: "danger",
        message:
          err.response?.data?.message ||
          "Could not submit product. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => (
    <Badge color={statusColorMap[status] || "secondary"} className="text-uppercase">
      {status || "pending"}
    </Badge>
  );

  const hasPendingProducts = useMemo(
    () => (pendingProducts || []).length > 0,
    [pendingProducts]
  );

  return (
    <>
      <Helmet>
        <title>Product Management - Seller</title>
      </Helmet>
      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Product Management</h2>
            <p className="category">
              Submit products for review. Approved products will appear in the
              main catalog.
            </p>
          </div>
        }
      />
      <div className="content">
        <Row>
          <Col lg={7}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Seller / Staff</h5>
                <small className="text-muted">
                  Provide product information below. The price you set will be
                  treated as the cost for admin review.
                </small>
              </CardHeader>
              <CardBody>
                {feedback.message && (
                  <div
                    className={`alert alert-${feedback.type}`}
                    role="alert"
                  >
                    {feedback.message}
                  </div>
                )}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <h6 className="text-muted text-uppercase mb-3">
                        Product Information
                      </h6>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="title">Product Name *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formState.title}
                          onChange={handleInputChange}
                          placeholder="Enter product name"
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="image">Product Image URL</Label>
                        <Input
                          id="image"
                          name="image"
                          value={formState.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup>
                        <Label for="description">Description</Label>
                        <Input style={{ border: "1px solid #e0e0e0", borderRadius: "8px" }}
                          id="description"
                          name="description"
                          type="textarea"
                          rows="3"
                          value={formState.description}
                          onChange={handleInputChange}
                          placeholder="Enter product description"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <h6 className="text-muted text-uppercase mb-3">
                        Price &amp; Stock
                      </h6>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="sellerPrice">Price (Cost) *</Label>
                        <Input
                          id="sellerPrice"
                          name="sellerPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.sellerPrice}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="stockQuantity">Stock Quantity</Label>
                        <Input
                          id="stockQuantity"
                          name="stockQuantity"
                          type="number"
                          min="0"
                          value={formState.stockQuantity}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="availableQuantity">Available Quantity</Label>
                        <Input
                          id="availableQuantity"
                          name="availableQuantity"
                          type="number"
                          min="0"
                          value={formState.availableQuantity}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <h6 className="text-muted text-uppercase mb-3">
                        Seller Information
                      </h6>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Seller Email</Label>
                        <Input value={sellerEmail} disabled />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Seller Name</Label>
                        <Input value={sellerName} disabled />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <h6 className="text-muted text-uppercase mb-3">
                        Shipping Information
                      </h6>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="shippingLocation">Shipping Location</Label>
                        <Input
                          id="shippingLocation"
                          name="shippingLocation"
                          value={formState.shippingLocation}
                          onChange={handleInputChange}
                          placeholder="Enter shipping location"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formState.country}
                          onChange={handleInputChange}
                          placeholder="Country of origin or shipping"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup>
                        <Label for="shippingDescription">
                          Shipping Description
                        </Label>
                        <Input
                          id="shippingDescription"
                          name="shippingDescription"
                          type="textarea"
                          rows="2"
                          value={formState.shippingDescription}
                          onChange={handleInputChange}
                          placeholder="Enter shipping details"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <h6 className="text-muted text-uppercase mb-3">
                        Category Selection
                      </h6>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="menuId">Category *</Label>
                        <Input
                          type="select"
                          id="menuId"
                          name="menuId"
                          value={formState.menuId}
                          onChange={handleInputChange}
                          required
                          disabled={loadingCategories}
                        >
                          <option value="">
                            {loadingCategories
                              ? "Loading categories..."
                              : "Select category"}
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={String(category.id)}>
                              {category.name || category.id}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="subCategoryId">Subcategory</Label>
                        <Input
                          type="select"
                          id="subCategoryId"
                          name="subCategoryId"
                          value={formState.subCategoryId}
                          onChange={handleInputChange}
                          disabled={
                            !formState.menuId || loadingSubCategories
                          }
                        >
                          <option value="">
                            {formState.menuId
                              ? loadingSubCategories
                                ? "Loading subcategories..."
                                : "Select subcategory"
                              : "Select a category first"}
                          </option>
                          {subCategories.map((sub) => (
                            <option key={sub.id} value={String(sub.id)}>
                              {sub.name || sub.id}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-4">
                    <Button
                      color="secondary"
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="mr-2"
                    >
                      Reset
                    </Button>
                    <Button color="primary" type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" /> Saving...
                        </>
                      ) : (
                        "Save Product"
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col lg={5}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Product Approval Status</h5>
                <small className="text-muted">
                  Track the review status of your submissions. Approved products
                  will appear in the main catalog.
                </small>
              </CardHeader>
              <CardBody>
                {loadingPending ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2 mb-0">Loading pending products...</p>
                  </div>
                ) : hasPendingProducts ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Status</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingProducts.map((pending) => (
                          <tr key={pending.id}>
                            <td>
                              <strong>{pending.title}</strong>
                              <br />
                              <small className="text-muted">
                                ${pending.sellerPrice ?? 0} cost
                              </small>
                              {pending.rejectionReason && (
                                <div className="text-danger small mt-1">
                                  Rejection reason: {pending.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td>{statusBadge(pending.status || "pending")}</td>
                            <td>
                              <small className="text-muted">
                                {pending.updatedAt
                                  ? new Date(pending.updatedAt).toLocaleString()
                                  : pending.createdAt
                                  ? new Date(
                                      pending.createdAt
                                    ).toLocaleString()
                                  : "-"}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No submissions yet. Use the form to add your first product.
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SellerProductManagement;

