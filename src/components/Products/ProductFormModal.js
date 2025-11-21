import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Spinner,
} from "reactstrap";
import {
  FaDatabase,
  FaDotCircle,
  FaUpload,
  FaExternalLinkAlt,
} from "react-icons/fa";

const ProductFormModal = ({
  isOpen,
  toggle,
  isEditMode,
  formState,
  handleInputChange,
  handleCategorySelect,
  handleSubCategorySelect,
  handleSubmit,
  saving,
  categories,
  subCategories,
  loadingCategories,
  loadingSubCategories,
}) => {
  const cardHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #e9ecef",
  };

  const cardTitleStyle = {
    fontSize: "1rem",
    fontWeight: 600,
    margin: 0,
    color: "#2d2d6f",
  };

  const cardSubtitleStyle = {
    fontSize: "0.875rem",
    color: "#8898aa",
    margin: 0,
    marginTop: "0.25rem",
  };

  const iconStyle = {
    color: "#5e72e4",
    fontSize: "1rem",
  };

  const cardStyle = {
    marginBottom: "1.5rem",
    border: "1px solid #e7eaf0",
    borderRadius: "18px",
    boxShadow: "0 12px 24px rgba(50, 50, 93, 0.08)",
  };

  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      handleInputChange({
        target: { name: "image", value: reader.result || "", type: "text" },
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreviewClick = () => {
    if (!formState.image) return;
    if (typeof window !== "undefined") {
      window.open(formState.image, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      backdrop="static"
      style={{ maxWidth: "900px" }}
    >
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>
          {isEditMode ? "Edit Product" : "Add Product"}
        </ModalHeader>
        <ModalBody style={{ padding: "1.5rem", background: "#f5f7fb" }}>
          <Row>
            {/* Product Information Card */}
            <Col md={6} className="d-flex">
              <Card style={{ ...cardStyle, width: "100%" }}>
                <CardBody>
                  <div style={cardHeaderStyle}>
                    <FaDotCircle style={iconStyle} />
                    <div>
                      <CardTitle tag="h6" style={cardTitleStyle}>
                        Product Information
                      </CardTitle>
                      <p style={cardSubtitleStyle}>Enter basic product details</p>
                    </div>
                  </div>
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
                  <FormGroup>
  <Label for="image">Product Image</Label>
  <input
    id="image-file"
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleImageFileChange}
  />
  <div
    style={{
      display: "flex",
      alignItems: "center",
      border: "1px solid #e0e0e0",
      borderRadius: "4px",
      backgroundColor: "#f9f9f9",
      padding: "0.75rem 1rem",
      gap: "0.75rem",
      cursor: "pointer",
    }}
    onClick={handleFileButtonClick}
  >
    <div style={{ flex: 1 }}>
      <span style={{ color: "#2c5aa0", fontWeight: "500" }}>
        Choose File
      </span>
      <span style={{ color: "#999", marginLeft: "0.5rem" }}>
        {fileName ? fileName : "No file chosen"}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        flexShrink: 0,
      }}
    >
      <FaUpload size={16} color="#666" />
    </div>
  </div>
</FormGroup>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      type="textarea"
                      value={formState.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      rows={4}
                      style={{ border: "1px solid #dfe3e8", borderRadius: "8px" }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>

            {/* Pricing & Stock Card */}
            <Col md={6} className="d-flex">
              <Card style={{ ...cardStyle, width: "100%" }}>
                <CardBody>
                  <div style={cardHeaderStyle}>
                    <FaDotCircle style={iconStyle} />
                    <div>
                      <CardTitle tag="h6" style={cardTitleStyle}>
                        Pricing & Stock
                      </CardTitle>
                      <p style={cardSubtitleStyle}>Set cost, selling price and inventory</p>
                    </div>
                  </div>
                  <FormGroup>
                    <Label for="cost">$ Cost</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="text"
                      value={formState.cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="price">$ Selling Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="text"
                      value={formState.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="off_percentage">Off Percentage</Label>
                    <Input
                      id="off_percentage"
                      name="off_percentage"
                      type="text"
                      value={formState.off_percentage}
                      onChange={handleInputChange}
                      placeholder="%"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      value={formState.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="stockQuantity">Stock Quantity</Label>
                        <Input
                          id="stockQuantity"
                          name="stockQuantity"
                          type="number"
                          value={formState.stockQuantity}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="availableQuantity">Available Quantity</Label>
                        <Input
                          id="availableQuantity"
                          name="availableQuantity"
                          type="number"
                          value={formState.availableQuantity}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Category Management Card */}
          <Row>
            <Col md={12}>
              <Card style={cardStyle}>
                <CardBody>
                  <div style={cardHeaderStyle}>
                    <FaDatabase style={iconStyle} />
                    <div>
                      <CardTitle tag="h6" style={cardTitleStyle}>
                        Category Management
                      </CardTitle>
                      <p style={cardSubtitleStyle}>Organize product categories</p>
                    </div>
                  </div>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="menuId">Category *</Label>
                        <Input
                          type="select"
                          id="menuId"
                          name="menuId"
                          value={formState.menuId}
                          onChange={handleCategorySelect}
                          required
                          disabled={loadingCategories}
                        >
                          <option value="">
                            {loadingCategories ? "Loading categories..." : "Select category"}
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>
                              {cat.name || cat.title || cat.id}
                            </option>
                          ))}
                        </Input>
                        {!loadingCategories && !categories.length && (
                          <small className="text-muted">No categories available.</small>
                        )}
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
                          onChange={handleSubCategorySelect}
                          disabled={!formState.menuId || loadingSubCategories}
                        >
                          <option value="">
                            {formState.menuId
                              ? loadingSubCategories
                                ? "Loading sub categories..."
                                : "Select subcategory"
                              : "Select a category first"}
                          </option>
                          {subCategories.map((sub) => (
                            <option key={sub.id} value={String(sub.id)}>
                              {sub.name || sub.title || sub.id}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <FormGroup>
                        <Label for="categoriesInput">Tags (comma separated)</Label>
                        <Input
                          id="categoriesInput"
                          name="categoriesInput"
                          value={formState.categoriesInput}
                          onChange={handleInputChange}
                          placeholder="Optional tags e.g. Organic, Special"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <FormGroup check className="mt-2">
                        <input
                          id="isRecommended"
                          type="checkbox"
                          name="isRecommended"
                          checked={formState.isRecommended}
                          onChange={handleInputChange}
                          className="form-check-input"
                          style={{ opacity: 1, visibility: "visible" }}
                        />
                        <Label
                          for="isRecommended"
                          check
                          style={{
                            marginLeft: "0.5rem",
                            marginBottom: 0,
                            cursor: "pointer",
                            paddingLeft: 0,
                            lineHeight: "normal",
                          }}
                        >
                          Mark as recommended product
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="d-flex justify-content-between">
          <Button
            type="button"
            className="btn-round"
            color="secondary"
            onClick={toggle}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            className="btn-round"
            disabled={saving}
            style={{ minWidth: "120px" }}
          >
            {saving ? (
              <>
                <Spinner size="sm" color="light" className="mr-2" />
                Saving...
              </>
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Publish"
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;

