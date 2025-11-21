import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";
import ProductFormModal from "components/Products/ProductFormModal";
import ProductDetailsModal from "components/Products/ProductDetailsModal";
import { buildColumns } from "components/Products/ProductTable";
import {
  initialProductState,
  mapApiProductToForm,
  buildPayload,
} from "components/Products/utils";

const API_BASE =
  process.env.REACT_APP_MESOB_API_BASE ||
  "https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev";

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

      <ProductFormModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        isEditMode={isEditMode}
        formState={formState}
        handleInputChange={handleInputChange}
        handleCategorySelect={handleCategorySelect}
        handleSubCategorySelect={handleSubCategorySelect}
        handleSubmit={handleSubmit}
        saving={saving}
        categories={categories}
        subCategories={subCategories}
        loadingCategories={loadingCategories}
        loadingSubCategories={loadingSubCategories}
      />

      <ProductDetailsModal
        isOpen={detailsModalOpen}
        toggle={closeDetailsModal}
        selectedProduct={selectedProduct}
      />
    </>
  );
}

export default Products;

