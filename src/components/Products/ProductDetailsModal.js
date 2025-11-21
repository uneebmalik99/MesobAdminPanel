import React from "react";
import { Modal, ModalBody, ModalHeader, Row, Col } from "reactstrap";
import { formatCurrency } from "./utils";

const detailLabelStyle = { fontWeight: 600, marginBottom: "0.25rem" };
const detailValueStyle = { marginBottom: "0.75rem", color: "#525f7f" };

const ProductDetailsModal = ({ isOpen, toggle, selectedProduct }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {selectedProduct?.title || "Product Details"}
      </ModalHeader>
      <ModalBody>
        {selectedProduct ? (
          <>
            <Row>
              <Col md={4} className="mb-3 mb-md-0">
                <div className="details-image-wrapper">
                  {selectedProduct.content?.image ? (
                    <img
                      src={selectedProduct.content.image}
                      alt={selectedProduct.title}
                      className="img-fluid rounded shadow-sm"
                    />
                  ) : (
                    <div className="details-image-placeholder">No Image</div>
                  )}
                </div>
              </Col>
              <Col md={8}>
                <h5 className="mb-2">Summary</h5>
                <Row>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Category</div>
                    <div style={detailValueStyle}>
                      {selectedProduct.category ||
                        selectedProduct.menu_name ||
                        "—"}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Country</div>
                    <div style={detailValueStyle}>{selectedProduct.country || "—"}</div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Price</div>
                    <div style={detailValueStyle}>
                      {formatCurrency(selectedProduct.content?.price)}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Cost</div>
                    <div style={detailValueStyle}>
                      {formatCurrency(selectedProduct.content?.cost)}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Stock Quantity</div>
                    <div style={detailValueStyle}>
                      {selectedProduct.stockQuantity ??
                        selectedProduct.quantity ??
                        "—"}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Available Quantity</div>
                    <div style={detailValueStyle}>
                      {selectedProduct.availableQuantity ?? "—"}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Off %</div>
                    <div style={detailValueStyle}>{selectedProduct.off_percentage || "—"}</div>
                  </Col>
                  <Col sm={6}>
                    <div style={detailLabelStyle}>Recommended</div>
                    <div style={detailValueStyle}>
                      {selectedProduct.isRecommended ? "Yes" : "No"}
                    </div>
                  </Col>
                </Row>
                <div style={detailLabelStyle}>Description</div>
                <div
                  style={{
                    border: "1px solid #dfe3e8",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    minHeight: "100px",
                    background: "#fafafa",
                    color: "#4d4f5c",
                  }}
                >
                  {selectedProduct.content?.description || "—"}
                </div>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={6}>
                <div style={detailLabelStyle}>Categories</div>
                <div style={detailValueStyle}>
                  {(selectedProduct.categories || []).length
                    ? selectedProduct.categories.join(", ")
                    : "—"}
                </div>
              </Col>
              <Col md={6}>
                <div style={detailLabelStyle}>Sub Category</div>
                <div style={detailValueStyle}>
                  {selectedProduct.sub_category_name ||
                    selectedProduct.subCategoryName ||
                    selectedProduct.Sub_category_id ||
                    "—"}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div style={detailLabelStyle}>Created</div>
                <div style={detailValueStyle}>
                  {selectedProduct.createdAt
                    ? new Date(selectedProduct.createdAt).toLocaleString()
                    : "—"}
                </div>
              </Col>
              <Col md={6}>
                <div style={detailLabelStyle}>Updated</div>
                <div style={detailValueStyle}>
                  {selectedProduct.updatedAt
                    ? new Date(selectedProduct.updatedAt).toLocaleString()
                    : "—"}
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <p className="text-muted mb-0">No product selected.</p>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ProductDetailsModal;

