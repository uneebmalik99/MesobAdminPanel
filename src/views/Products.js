import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";

const API_BASE =
  process.env.REACT_APP_MESOB_API_BASE ||
  "https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev";

const thumbnailWrapperStyle = {
  width: 60,
  height: 60,
  borderRadius: 8,
  overflow: "hidden",
  background: "#f4f5f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(0,0,0,0.05)",
};

const thumbnailImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderThumbStyle = {
  fontSize: 11,
  color: "#8898aa",
  textAlign: "center",
  padding: "0 4px",
};
const detailLabelStyle = { fontWeight: 600, marginBottom: "0.25rem" };
const detailValueStyle = { marginBottom: "0.75rem", color: "#525f7f" };

const initialProductState = {
  id: "",
  title: "",
  category: "",
  categoriesInput: "",
  country: "",
  description: "",
  price: "",
  cost: "",
  image: "",
  off_percentage: "",
  isRecommended: false,
  menuId: "",
  subCategoryId: "",
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }
  const parsed = parseFloat(
    String(value)
      .replace("$", "")
      .replace(",", "")
      .trim()
  );
  if (isNaN(parsed)) return value;
  return `$${parsed.toFixed(2)}`;
};

const formatMoneyString = (value) => {
  if (value === undefined || value === null) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("$")) return trimmed;
  const numeric = Number(trimmed.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return trimmed;
  return `$ ${numeric.toFixed(2)}`;
};

const parseCategoryTags = (input) => {
  if (!input) return [];
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const buildCategoriesArray = (menuId, tags) => {
  const list = [];
  if (menuId) list.push(String(menuId));
  return list.concat(tags);
};

// Sanitize ID for use in CSS selectors (replace invalid characters)
const sanitizeIdForSelector = (id) => {
  return String(id)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const buildColumns = (onEdit, onDelete) => [
  {
    name: "Image",
    width: "120px",
    cell: (row) => (
      <div style={thumbnailWrapperStyle}>
        {row.content?.image ? (
          <img
            src={row.content.image}
            alt={row.title}
            style={thumbnailImageStyle}
          />
        ) : (
          <div style={placeholderThumbStyle}>N/A</div>
        )}
      </div>
    ),
    ignoreRowClick: true,
  },
  {
    name: "Title",
    selector: (row) => row.title,
    sortable: true,
    wrap: true,
    width: "200px",
  },
  {
    name: "Category",
    selector: (row) => row.category || "-",
    sortable: true,
    width: "160px",
  },
  {
    name: "Description",
    selector: (row) => row.content?.description || "-",
    cell: (row) => {
      const desc = row.content?.description || "-";
      return (
        <div style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={desc}>
          {desc}
        </div>
      );
    },
    sortable: false,
    wrap: false,
    width: "300px",
  },
  {
    name: "Country",
    selector: (row) => row.country || "-",
    sortable: true,
    width: "140px",
  },
  {
    name: "Price",
    selector: (row) => row.content?.price || "-",
    cell: (row) => formatCurrency(row.content?.price),
    sortable: true,
    width: "130px",
  },
  {
    name: "Cost",
    selector: (row) => row.content?.cost || "-",
    cell: (row) => formatCurrency(row.content?.cost),
    sortable: true,
    width: "130px",
  },
  {
    name: "Off %",
    selector: (row) => row.off_percentage || "-",
    width: "100px",
  },
  {
    name: "Recommended",
    selector: (row) => row.isRecommended,
    cell: (row) =>
      row.isRecommended ? (
        <Badge color="success">Yes</Badge>
      ) : (
        <Badge color="secondary">No</Badge>
      ),
    width: "140px",
  },
  {
    name: "Updated",
    selector: (row) => row.updatedAt,
    cell: (row) =>
      row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-",
    width: "210px",
    sortable: true,
  },
  {
    name: "Actions",
    cell: (row) => {
      const editId = `edit-${sanitizeIdForSelector(row.id)}`;
      const deleteId = `delete-${sanitizeIdForSelector(row.id)}`;
      return (
        <div className="d-flex align-items-center" style={{ gap: "0.4rem" }}>
          <Button
            id={editId}
            color="info"
            size="sm"
            className="btn-round btn-icon"
            onClick={() => onEdit(row)}
            aria-label="Edit product"
          >
            <FaEdit size={14} />
          </Button>
          <UncontrolledTooltip target={editId}>
            Edit or duplicate product
          </UncontrolledTooltip>
          <Button
            id={deleteId}
            color="danger"
            size="sm"
            className="btn-round btn-icon"
            onClick={() => onDelete(row)}
            aria-label="Delete product"
          >
            <FaTrash size={13} />
          </Button>
          <UncontrolledTooltip target={deleteId}>
            Remove product from catalog
          </UncontrolledTooltip>
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    width: "200px",
  },
];

const mapApiProductToForm = (product) => {
  const rawCategories = Array.isArray(product.categories) ? product.categories : [];
  const derivedMenuId =
    rawCategories.length > 0
      ? String(rawCategories[0])
      : product.Menu_id
      ? String(product.Menu_id)
      : product.menuId
      ? String(product.menuId)
      : product.menu_id
      ? String(product.menu_id)
      : "";
  const categoryTags = rawCategories.slice(1).map((tag) => String(tag || "")).filter(Boolean);

  return {
    id: product.id,
    title: product.title || "",
    category: product.category || product.menu_name || "",
    categoriesInput: categoryTags.join(", "),
    country: product.country || product.content?.country || "",
    description: product.content?.description || "",
    price: product.content?.price || "",
    cost: product.content?.cost || "",
    image: product.content?.image || "",
    off_percentage: product.off_percentage || "",
    isRecommended: Boolean(product.isRecommended),
    menuId: derivedMenuId,
    subCategoryId:
      product.Sub_category_id !== undefined && product.Sub_category_id !== null
        ? String(product.Sub_category_id)
        : product.subCategoryId !== undefined && product.subCategoryId !== null
        ? String(product.subCategoryId)
        : product.sub_category_id !== undefined && product.sub_category_id !== null
        ? String(product.sub_category_id)
        : "",
  };
};

const buildPayload = (formState) => {
  const tagList = parseCategoryTags(formState.categoriesInput);
  const categories = buildCategoriesArray(formState.menuId, tagList);
  const payload = {
    title: formState.title.trim(),
    category: formState.category.trim(),
    categories,
    content: {
      description: formState.description?.trim() || "",
      price: formatMoneyString(formState.price),
      cost: formatMoneyString(formState.cost),
      image: formState.image?.trim() || "",
      images: formState.image?.trim() || "",
      country: formState.country.trim(),
      title: formState.title.trim(),
    },
    country: formState.country.trim(),
    off_percentage: formState.off_percentage?.trim() || "",
    isRecommended: Boolean(formState.isRecommended),
    menuId: formState.menuId || undefined,
  };

  if (formState.subCategoryId) {
    const numericId = Number(formState.subCategoryId);
    if (Number.isFinite(numericId)) {
      payload.subCategoryId = numericId;
    }
  }

  return payload;
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState(initialProductState);
  const [error, setError] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((product) => {
      const haystack = `${product.title} ${product.category} ${
        product.country
      } ${(product.categories || []).join(" ")}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search, products]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE}/products`);
      const items = response.data?.Items || response.data || [];
      const sorted = items.sort((a, b) =>
        (b.updatedAt || b.createdAt || "").localeCompare(
          a.updatedAt || a.createdAt || ""
        )
      );
      setProducts(sorted);
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Unable to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (modalOpen && formState.menuId) {
      fetchSubCategories(formState.menuId);
    } else if (!formState.menuId) {
      setSubCategories([]);
    }
  }, [modalOpen, formState.menuId, fetchSubCategories]);

  useEffect(() => {
    if (!modalOpen || !formState.menuId) return;
    const selectedCategory = categories.find(
      (cat) => String(cat.id) === String(formState.menuId)
    );
    if (selectedCategory && formState.category !== selectedCategory.name) {
      setFormState((prev) => ({
        ...prev,
        category: selectedCategory.name || prev.category,
      }));
    }
  }, [modalOpen, formState.menuId, categories, formState.category]);

  const handleEdit = useCallback(
    (product) => {
      setIsEditMode(true);
      const mapped = mapApiProductToForm(product);
      setFormState(mapped);
      setModalOpen(true);
      if (mapped.menuId) {
        fetchSubCategories(mapped.menuId);
      } else {
        setSubCategories([]);
      }
    },
    [fetchSubCategories]
  );

  const handleDelete = useCallback((product) => {
    if (
      !window.confirm(
        `Delete "${product.title}" and remove it from customer carts?`
      )
    ) {
      return;
    }
    axios
      .delete(`${API_BASE}/products/${product.id}`)
      .then(() => {
        setProducts((prev) => prev.filter((item) => item.id !== product.id));
      })
      .catch((err) => {
        console.error("Failed to delete product", err);
        alert("Could not delete product. Please try again.");
      });
  }, []);

  const columns = useMemo(
    () => buildColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  const handleCategorySelect = (event) => {
    const selectedMenuId = event.target.value;
    const selectedCategory = categories.find((cat) => String(cat.id) === selectedMenuId);
    setFormState((prev) => ({
      ...prev,
      menuId: selectedMenuId,
      category: selectedCategory?.name || "",
      subCategoryId: "",
    }));
    if (selectedMenuId) {
      fetchSubCategories(selectedMenuId);
    } else {
      setSubCategories([]);
    }
  };

  const handleSubCategorySelect = (event) => {
    const selectedId = event.target.value || "";
    setFormState((prev) => ({
      ...prev,
      subCategoryId: selectedId,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setFormState(initialProductState);
    setSubCategories([]);
    setModalOpen(true);
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.menuId) {
      alert("Title and Category are required.");
      return;
    }

    const payload = buildPayload(formState);
    setSaving(true);
    try {
      if (isEditMode && formState.id) {
        await axios.put(`${API_BASE}/products/${formState.id}`, payload);
      } else {
        await axios.post(`${API_BASE}/products`, payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Could not save product. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Products - Mesob Store</title>
      </Helmet>
      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Products</h2>
            <p className="category">
              Manage catalog, pricing, and featured recommendations
            </p>
          </div>
        }
      />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader
                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between"
                style={{ gap: "1rem" }}
              >
                <div>
                  <CardTitle tag="h4" className="mb-0">
                    Products 
                  </CardTitle>
                  <small className="text-muted">
                    {products.length} total products
                  </small>
                </div>
                <div
                  className="d-flex flex-column flex-md-row w-100"
                  style={{ gap: "0.75rem", alignItems: "center" }}
                >
                  <Input
                    type="text"
                    placeholder="Search by name, category, country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      height: "44px",
                      padding: "0.35rem 0.85rem",
                      fontSize: "0.95rem",
                    }}
                  />
                  <Button
                    color="primary"
                    className="btn-round"
                    onClick={handleAddNew}
                    style={{
                      height: "44px",
                      padding: "0.35rem 1.2rem",
                      fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    }}
                  >
                    + Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2 mb-0">Loading products...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredProducts}
                    responsive
                    highlightOnHover
                    pointerOnHover
                    pagination
                    paginationPerPage={50}
                    paginationRowsPerPageOptions={[25, 50, 100, 200]}
                    noDataComponent="No products found."
                    fixedHeader
                    onRowClicked={handleRowClick}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        size="lg"
        backdrop="static"
      >
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={() => setModalOpen(false)}>
            {isEditMode ? "Edit Product" : "Add Product"}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
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
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="subCategoryId">Sub Category</Label>
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
                          : "None"
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
              <Col md={6}>
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
              <Col md={6}>
                <FormGroup>
                  <Label for="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formState.country}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="price">Price (customer)</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formState.price}
                    onChange={handleInputChange}
                    placeholder="$9.99"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="cost">Cost (internal)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    value={formState.cost}
                    onChange={handleInputChange}
                    placeholder="$3.00"
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formState.image}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="off_percentage">Off Percentage</Label>
                  <Input
                    id="off_percentage"
                    name="off_percentage"
                    value={formState.off_percentage}
                    onChange={handleInputChange}
                    placeholder="3%"
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="textarea"
                    value={formState.description}
                    onChange={handleInputChange}
                    rows={4}
                    style={{ border: "1px solid #dfe3e8", borderRadius: "8px" }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="align-items-center">
              <Col md={6}>
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
                      lineHeight: 0,
                    }}
                  >
                    Mark as recommended product
                  </Label>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="d-flex justify-content-between">
            <Button
              type="button"
              className="btn-round"
              color="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className="btn-round"
              disabled={saving}
            >
              {saving ? (
                <>
                  Saving...
                  <Spinner size="sm" color="light" className="ml-2" />
                </>
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={detailsModalOpen} toggle={closeDetailsModal} size="lg">
        <ModalHeader toggle={closeDetailsModal}>
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
    </>
  );
}

export default Products;

