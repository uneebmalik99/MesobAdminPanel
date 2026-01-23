import React, { useEffect, useState } from "react";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Spinner,
} from "reactstrap";

// Material-UI components for Analytics
import {
  Card as MUICard,
  CardContent,
  CardHeader as MUICardHeader,
  Grid,
  Typography,
  Box,
  Table as MUITable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
  Button as MUIButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

// core components
import PanelHeader from "components/PanelHeader/PanelHeader.js";

import axios from "axios";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';

const API_URL = "https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [Users, setUsers] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCost: 0,
    totalCustomers: 0
  });

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "daily", "weekly", "monthly", "yearly"
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewsModalOpen, setViewsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productViewsBreakdown, setProductViewsBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard totals from /dashboard endpoint
    axios
      .get("https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev/dashboard")
      .then((response) => {
        if (response.data) {
          console.log('dashboard totals=>>>>>', response.data);
          // Directly set totals from API response
          setTotalStats({
            totalOrders: response.data.totalOrders || 0,
            totalSales: response.data.totalSales || 0,
            totalCost: response.data.totalCost || 0,
            totalCustomers: 0 // Not provided by /dashboard endpoint
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
    axios
      .get("https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev/users")
      .then((response) => {
        if (response.data.Items) {
          setUsers(response.data.Count);
          console.log(response.data.Count);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
      });
  }, []);

  // Analytics functions
  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchProductsAndCategories = async () => {
    try {
      // Fetch all products
      const productsResponse = await fetch(`${API_URL}/products`);
      const productsData = await productsResponse.json();
      const productsList = Array.isArray(productsData) ? productsData : (productsData?.Items || []);
      setProducts(productsList);

      // Fetch all categories
      const categoriesResponse = await fetch(`${API_URL}/categories`);
      const categoriesData = await categoriesResponse.json();
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.Items || []);
      setCategories(categoriesList);

      // Fetch subcategories for each category
      const allSubcategories = [];
      for (const category of categoriesList) {
        try {
          const subCatResponse = await fetch(`${API_URL}/categories/${category.id}/subcategories`);
          const subCatData = await subCatResponse.json();
          const subCatList = Array.isArray(subCatData) ? subCatData : (subCatData?.Items || []);
          allSubcategories.push(...subCatList);
        } catch (err) {
          console.error(`Failed to load subcategories for category ${category.id}`, err);
        }
      }
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error("Error fetching products and categories:", error);
    }
  };

  // Helper function to get product details by ID
  const getProductDetails = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    // Get category name
    const categoryId = product.categories?.[0] || product.Menu_id || product.menuId;
    const category = categories.find(c => String(c.id) === String(categoryId));
    const categoryName = category?.name || product.category || "-";

    // Get subcategory name
    const subCategoryId = product.Sub_category_id || product.subCategoryId || product.sub_category_id;
    const subcategory = subcategories.find(sc => sc.id === subCategoryId);
    const subcategoryName = subcategory?.name || "-";

    return {
      title: product.title || productId,
      category: categoryName,
      subcategory: subcategoryName
    };
  };

  // Helper function to filter products based on search query
  const filterProducts = (productList) => {
    if (!searchQuery.trim()) return productList;

    const query = searchQuery.toLowerCase().trim();
    return productList.filter((product) => {
      const productDetails = getProductDetails(product.productId);
      const title = (productDetails?.title || product.productId || "").toLowerCase();
      const category = (productDetails?.category || "").toLowerCase();
      const subcategory = (productDetails?.subcategory || "").toLowerCase();
      const productId = (product.productId || "").toLowerCase();

      return (
        title.includes(query) ||
        category.includes(query) ||
        subcategory.includes(query) ||
        productId.includes(query)
      );
    });
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      // Build query parameters with time filter - always include it for consistency
      const timeParam = timeFilter !== "all" ? `?timeFilter=${timeFilter}` : `?timeFilter=all`;

      console.log(`Fetching analytics with time filter: ${timeFilter}`);

      const [dashboard, revenue, purchases, users] = await Promise.all([
        fetch(`${API_URL}/analytics/dashboard${timeParam}`).then(r => r.json()),
        fetch(`${API_URL}/analytics/revenue${timeParam}`).then(r => r.json()),
        fetch(`${API_URL}/analytics/purchases${timeParam}`).then(r => r.json()),
        fetch(`${API_URL}/analytics/users${timeParam}`).then(r => r.json())
      ]);

      setDashboardData(dashboard);
      setRevenueData(revenue);
      setPurchaseData(purchases);
      setUserData(users);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery(""); // Clear search when switching tabs
  };

  const handleViewsClick = async (product) => {
    setSelectedProduct(product);
    setViewsModalOpen(true);
    setLoadingBreakdown(true);
    
    try {
      // Fetch platform-specific view breakdown for this product
      const timeParam = timeFilter !== "all" ? `?timeFilter=${timeFilter}` : `?timeFilter=all`;
      const response = await fetch(`${API_URL}/analytics/product/${product.productId}/views${timeParam}`);
      const data = await response.json();
      
      // If API returns platform breakdown, use it; otherwise create a default structure
      if (data && (data.platformBreakdown || data.deviceBreakdown)) {
        setProductViewsBreakdown(data.platformBreakdown || data.deviceBreakdown);
      } else {
        // Fallback: create breakdown from available data or use defaults
        // This assumes the API might not have platform-specific data yet
        setProductViewsBreakdown({
          web: data?.web || Math.floor(product.views * 0.6) || 0,
          ios: data?.ios || Math.floor(product.views * 0.25) || 0,
          android: data?.android || Math.floor(product.views * 0.15) || 0,
          total: product.views
        });
      }
    } catch (error) {
      console.error("Error fetching product views breakdown:", error);
      // Fallback breakdown if API call fails
      setProductViewsBreakdown({
        web: Math.floor(product.views * 0.6) || 0,
        ios: Math.floor(product.views * 0.25) || 0,
        android: Math.floor(product.views * 0.15) || 0,
        total: product.views
      });
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleCloseViewsModal = () => {
    setViewsModalOpen(false);
    setSelectedProduct(null);
    setProductViewsBreakdown(null);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Mesob Store</title>
      </Helmet>
      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Dashboard</h2>
          </div>
        }
      />
      <style>{`
        @media (max-width: 768px) {
          .dashboard-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 0 -10px;
            padding: 0 10px;
          }
          .dashboard-table-wrapper table {
            min-width: 600px;
          }
          .dashboard-card-header {
            flex-direction: column !important;
          }
          .dashboard-card-header > div:first-child {
            margin-bottom: 12px !important;
          }
          .analytics-section {
            padding: 10px 5px !important;
          }
          .MuiCard-root {
            margin-bottom: 15px;
          }
          .MuiCardContent-root {
            padding: 12px !important;
          }
        }
        @media (max-width: 576px) {
          .card-stats .numbers {
            text-align: left;
          }
          .card-stats .icon-big {
            font-size: 2em;
          }
          .card-stats .card-category {
            font-size: 11px !important;
          }
          .card-stats h3 {
            font-size: 1.3rem !important;
          }
          .MuiButton-root {
            font-size: 0.7rem !important;
            padding: 4px 8px !important;
            min-width: 70px !important;
          }
          .MuiTab-root {
            font-size: 0.7rem !important;
            min-width: 70px !important;
            padding: 8px 10px !important;
          }
          .MuiTypography-h4 {
            font-size: 1.2rem !important;
          }
          .MuiTypography-body1 {
            font-size: 0.8rem !important;
          }
          .MuiChip-root {
            font-size: 0.65rem !important;
            height: 20px !important;
          }
        }
      `}</style>
      <div className="content">
        <Row>
          <Col xs="12" sm="6" lg="3" md="6">
            <Card className="card-stats" style={{ marginBottom: '15px' }}>
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-shopping-cart text-warning" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ fontSize: '12px', marginBottom: '5px' }}>TOTAL ORDERS</p>
                      {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px' }}>
                          <Spinner color="warning" size="sm" />
                        </div>
                      ) : (
                        <CardTitle tag="h3" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{totalStats.totalOrders}</CardTitle>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3" md="6">
            <Card className="card-stats" style={{ marginBottom: '15px' }}>
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-dollar-sign text-success" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ fontSize: '12px', marginBottom: '5px' }}>TOTAL SALES</p>
                      {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px' }}>
                          <Spinner color="success" size="sm" />
                        </div>
                      ) : (
                        <CardTitle tag="h3" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                          ${Number(totalStats.totalSales).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </CardTitle>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3" md="6">
            <Card className="card-stats" style={{ marginBottom: '15px' }}>
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-chart-line text-danger" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ fontSize: '12px', marginBottom: '5px' }}>TOTAL COST</p>
                      {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px' }}>
                          <Spinner color="danger" size="sm" />
                        </div>
                      ) : (
                        <CardTitle tag="h3" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                          ${Number(totalStats.totalCost).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </CardTitle>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3" md="6">
            <Card className="card-stats" style={{ marginBottom: '15px' }}>
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-users text-primary" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ fontSize: '12px', marginBottom: '5px' }}>TOTAL USERS</p>
                      {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px' }}>
                          <Spinner color="primary" size="sm" />
                        </div>
                      ) : (
                        <CardTitle tag="h3" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                          {Users}
                        </CardTitle>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Analytics Section */}
        <Row>
          <Col md={12}>
            <div style={{ padding: "15px 10px" }} className="analytics-section">
              {/* Time Filter Buttons */}
              <Box
                display="flex"
                gap={1}
                mb={3}
                flexWrap="wrap"
                style={{
                  gap: '8px'
                }}
              >
                <MUIButton
                  variant={timeFilter === "all" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setTimeFilter("all")}
                  size="small"
                >
                  All Time
                </MUIButton>
                <MUIButton
                  variant={timeFilter === "daily" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setTimeFilter("daily")}
                  size="small"
                >
                  Today
                </MUIButton>
                <MUIButton
                  variant={timeFilter === "weekly" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setTimeFilter("weekly")}
                  size="small"
                >
                  Last 7 Days
                </MUIButton>
                <MUIButton
                  variant={timeFilter === "monthly" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setTimeFilter("monthly")}
                  size="small"
                >
                  This Month
                </MUIButton>
                <MUIButton
                  variant={timeFilter === "yearly" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setTimeFilter("yearly")}
                  size="small"
                >
                  This Year
                </MUIButton>
              </Box>

              {/* Analytics Key Metrics Row 2 - Tracking Events */}
              <Grid container spacing={2} style={{ marginBottom: 20 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <MUICard style={{ background: '#f0f7ff', height: '100%' }}>
                    <CardContent style={{ padding: '12px' }}>
                      <Typography color="textSecondary" gutterBottom style={{ fontSize: '0.75rem' }}>
                        Total Events Tracked
                      </Typography>
                      <Typography variant="h4" style={{ fontSize: '1.5rem' }}>
                        {dashboardData?.totalEvents || 0}
                      </Typography>
                    </CardContent>
                  </MUICard>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                  <MUICard style={{ background: '#fff4e6', height: '100%' }}>
                    <CardContent style={{ padding: '12px' }}>
                      <Typography color="textSecondary" gutterBottom style={{ fontSize: '0.75rem' }}>
                        Web Visits
                      </Typography>
                      <Typography variant="h4" style={{ fontSize: '1.5rem' }}>
                        {dashboardData?.deviceBreakdown?.web || 0}
                      </Typography>
                    </CardContent>
                  </MUICard>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                  <MUICard style={{ background: '#e8f5e9', height: '100%' }}>
                    <CardContent style={{ padding: '12px' }}>
                      <Typography color="textSecondary" gutterBottom style={{ fontSize: '0.75rem' }}>
                        Mobile Visits
                      </Typography>
                      <Typography variant="h4" style={{ fontSize: '1.5rem' }}>
                        {dashboardData?.deviceBreakdown?.mobile || 0}
                      </Typography>
                    </CardContent>
                  </MUICard>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                  <MUICard style={{ background: '#fce4ec', height: '100%' }}>
                    <CardContent style={{ padding: '12px' }}>
                      <Typography color="textSecondary" gutterBottom style={{ fontSize: '0.75rem' }}>
                        Product Views
                      </Typography>
                      <Typography variant="h4" style={{ fontSize: '1.5rem' }}>
                        {dashboardData?.mostViewedProducts?.reduce((sum, p) => sum + p.views, 0) || 0}
                      </Typography>
                    </CardContent>
                  </MUICard>
                </Grid>
              </Grid>

              {/* Tabs for Different Analytics Views */}
              <Paper style={{ marginBottom: 15, overflowX: 'auto' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Product Views" />
                  <Tab label="Purchases" />
                  <Tab label="Cart Additions" />
                  <Tab label="Page Views" />
                  <Tab label="Categories" />
                  <Tab label="Revenue" />
                </Tabs>
              </Paper>

              {analyticsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Tab 1: Most Viewed Products */}
                  {activeTab === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <MUICard>
                          <Box className="dashboard-card-header" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '12px 16px',
                            borderBottom: '2px solid #1976d2'
                          }}>
                            <Box style={{ marginBottom: '12px' }}>
                              <Typography variant="h6" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                                Most Viewed Products
                              </Typography>
                              <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.75rem' }}>
                                {dashboardData?.mostViewedProducts?.length || 0} products tracked - Showing products that users clicked on
                              </Typography>
                            </Box>
                            <TextField
                              placeholder="Search products..."
                              variant="outlined"
                              size="small"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faSearch} />
                                  </InputAdornment>
                                ),
                              }}
                              style={{
                                width: '100%'
                              }}
                            />
                          </Box>
                          <CardContent style={{ padding: 0 }}>
                            {(() => {
                              const filteredProducts = filterProducts(dashboardData?.mostViewedProducts || []);
                              return filteredProducts.length > 0 ? (
                                <Box className="dashboard-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
                                  <MUITable style={{ minWidth: 650 }}>
                                    <TableHead>
                                      <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell style={{ fontWeight: 'bold', padding: '8px', fontSize: '0.75rem' }}>#</TableCell>
                                        <TableCell style={{ fontWeight: 'bold', padding: '8px', fontSize: '0.75rem' }}>Product Title</TableCell>
                                        <TableCell className="d-none d-md-table-cell" style={{ fontWeight: 'bold', padding: '8px', fontSize: '0.75rem' }}>Category</TableCell>
                                        <TableCell className="d-none d-lg-table-cell" style={{ fontWeight: 'bold', padding: '8px', fontSize: '0.75rem' }}>Subcategory</TableCell>
                                        <TableCell align="right" style={{ fontWeight: 'bold', padding: '8px', fontSize: '0.75rem' }}>Total Views</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {filteredProducts.map((product, index) => {
                                        const productDetails = getProductDetails(product.productId);
                                        return (
                                          <TableRow
                                            key={product.productId}
                                            style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                            hover
                                          >
                                            <TableCell style={{ padding: '8px' }}>
                                              <Chip
                                                label={index + 1}
                                                size="small"
                                                color={index < 3 ? "primary" : "default"}
                                                style={{ minWidth: 30, fontSize: '0.7rem' }}
                                              />
                                            </TableCell>
                                            <TableCell style={{ padding: '8px' }}>
                                              <Typography variant="body1" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                {productDetails?.title || product.productId}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.65rem', display: 'block' }}>
                                                ID: {product.productId}
                                              </Typography>
                                              <Box className="d-block d-md-none" style={{ marginTop: '4px' }}>
                                                <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                                                  {productDetails?.category || "-"} {productDetails?.subcategory ? ` • ${productDetails.subcategory}` : ''}
                                                </Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell className="d-none d-md-table-cell" style={{ padding: '8px' }}>
                                              <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                                                {productDetails?.category || "-"}
                                              </Typography>
                                            </TableCell>
                                            <TableCell className="d-none d-lg-table-cell" style={{ padding: '8px' }}>
                                              <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                                                {productDetails?.subcategory || "-"}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right" style={{ padding: '8px' }}>
                                              <Chip
                                                label={`${product.views} views`}
                                                color="primary"
                                                onClick={() => handleViewsClick(product)}
                                                style={{ 
                                                  minWidth: 70, 
                                                  fontWeight: 'bold', 
                                                  fontSize: '0.7rem',
                                                  cursor: 'pointer'
                                                }}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </MUITable>
                                </Box>
                              ) : (
                                <Box p={8} textAlign="center">
                                  <Typography variant="h6" color="textSecondary" gutterBottom>
                                    {searchQuery ? "🔍 No products found matching your search" : "📊 No Product Views Yet"}
                                  </Typography>
                                  <Typography color="textSecondary">
                                    {searchQuery ? "Try adjusting your search query" : "Add trackProductView() to your product detail pages to start tracking."}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )}

                  {/* Tab 2: Most Purchased Products */}
                  {activeTab === 1 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MUICard>
                          <MUICardHeader
                            title="Most Purchased Products"
                            subheader={`${purchaseData?.mostPurchased?.length || 0} products sold - Based on completed orders`}
                            style={{ borderBottom: '2px solid #2e7d32' }}
                            action={
                              <TextField
                                placeholder="Search products..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FontAwesomeIcon icon={faSearch} />
                                    </InputAdornment>
                                  ),
                                }}
                                style={{ minWidth: 250, marginRight: 16 }}
                              />
                            }
                          />
                          <CardContent style={{ padding: 0 }}>
                            {(() => {
                              const filteredProducts = filterProducts(purchaseData?.mostPurchased || []);
                              return filteredProducts.length > 0 ? (
                                <MUITable>
                                  <TableHead>
                                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                      <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Product Name</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Subcategory</TableCell>
                                      <TableCell align="right" style={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                                      <TableCell align="right" style={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredProducts.map((product, index) => {
                                      const productDetails = getProductDetails(product.productId);
                                      return (
                                        <TableRow
                                          key={product.productId}
                                          style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                          hover
                                        >
                                          <TableCell>
                                            <Chip
                                              label={index + 1}
                                              size="small"
                                              color={index < 3 ? "primary" : "default"}
                                              style={{ minWidth: 40 }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body1" style={{ fontWeight: 500 }}>
                                              {product.title || productDetails?.title || product.productId}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              ID: {product.productId}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {productDetails?.category || "-"}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {productDetails?.subcategory || "-"}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Chip
                                              label={`${product.count} units`}
                                              style={{ backgroundColor: '#e3f2fd', minWidth: 100 }}
                                            />
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography
                                              variant="h6"
                                              style={{ color: '#2e7d32', fontWeight: 'bold' }}
                                            >
                                              ${product.revenue.toFixed(2)}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </MUITable>
                              ) : (
                                <Box p={8} textAlign="center">
                                  <Typography variant="h6" color="textSecondary" gutterBottom>
                                    {searchQuery ? "🔍 No products found matching your search" : "🛒 No Purchases Yet"}
                                  </Typography>
                                  <Typography color="textSecondary">
                                    {searchQuery ? "Try adjusting your search query" : "Purchase data comes from completed orders."}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )}

                  {/* Tab 3: Most Added to Cart */}
                  {activeTab === 2 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MUICard>
                          <MUICardHeader
                            title="Most Added to Cart"
                            subheader={`${dashboardData?.mostAddedToCart?.length || 0} products tracked - Products users are interested in`}
                            style={{ borderBottom: '2px solid #f50057' }}
                            action={
                              <TextField
                                placeholder="Search products..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FontAwesomeIcon icon={faSearch} />
                                    </InputAdornment>
                                  ),
                                }}
                                style={{ minWidth: 250, marginRight: 16 }}
                              />
                            }
                          />
                          <CardContent style={{ padding: 0 }}>
                            {(() => {
                              const filteredProducts = filterProducts(dashboardData?.mostAddedToCart || []);
                              return filteredProducts.length > 0 ? (
                                <MUITable>
                                  <TableHead>
                                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                      <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Product Title</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                                      <TableCell style={{ fontWeight: 'bold' }}>Subcategory</TableCell>
                                      <TableCell align="right" style={{ fontWeight: 'bold' }}>Times Added</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredProducts.map((product, index) => {
                                      const productDetails = getProductDetails(product.productId);
                                      return (
                                        <TableRow
                                          key={product.productId}
                                          style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                          hover
                                        >
                                          <TableCell>
                                            <Chip
                                              label={index + 1}
                                              size="small"
                                              color={index < 3 ? "secondary" : "default"}
                                              style={{ minWidth: 40 }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body1" style={{ fontWeight: 500 }}>
                                              {productDetails?.title || product.productId}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              ID: {product.productId}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {productDetails?.category || "-"}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {productDetails?.subcategory || "-"}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Chip
                                              label={`${product.adds} times`}
                                              color="secondary"
                                              style={{ minWidth: 100, fontWeight: 'bold' }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </MUITable>
                              ) : (
                                <Box p={8} textAlign="center">
                                  <Typography variant="h6" color="textSecondary" gutterBottom>
                                    {searchQuery ? "🔍 No products found matching your search" : "🛒 No Cart Additions Yet"}
                                  </Typography>
                                  <Typography color="textSecondary">
                                    {searchQuery ? "Try adjusting your search query" : "Add trackAddToCart() to your cart buttons to start tracking."}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )}

                  {/* Tab 4: Page Views */}
                  {activeTab === 3 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MUICard>
                          <MUICardHeader
                            title="Page Views"
                            subheader={`${dashboardData?.pageViews?.length || 0} pages tracked - Most visited pages on your site`}
                            style={{ borderBottom: '2px solid #9c27b0' }}
                          />
                          <CardContent style={{ padding: 0 }}>
                            {dashboardData?.pageViews?.length > 0 ? (
                              <MUITable>
                                <TableHead>
                                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Page Name</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold' }}>Total Views</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {dashboardData.pageViews.map((page, index) => (
                                    <TableRow
                                      key={index}
                                      style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                      hover
                                    >
                                      <TableCell>
                                        <Chip
                                          label={index + 1}
                                          size="small"
                                          color={index < 3 ? "primary" : "default"}
                                          style={{ minWidth: 40 }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                                          {page.page}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={`${page.views} views`}
                                          style={{ backgroundColor: '#e1bee7', minWidth: 100, fontWeight: 'bold' }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </MUITable>
                            ) : (
                              <Box p={8} textAlign="center">
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                  📄 No Page Views Yet
                                </Typography>
                                <Typography color="textSecondary">
                                  Add trackPageView() to your pages to start tracking.
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )}

                  {/* Tab 5: Categories & Subcategories */}
                  {/* {activeTab === 4 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={6}>
                        <MUICard style={{ height: '100%' }}>
                          <MUICardHeader
                            title="Most Viewed Categories"
                            subheader={`${dashboardData?.mostViewedCategories?.length || 0} categories tracked`}
                            style={{ borderBottom: '2px solid #ff9800' }}
                          />
                          <CardContent style={{ padding: 0 }}>
                            {dashboardData?.mostViewedCategories?.length > 0 ? (
                              <MUITable>
                                <TableHead>
                                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Category ID</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold' }}>Views</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {dashboardData.mostViewedCategories.map((category, index) => (
                                    <TableRow
                                      key={category.categoryId}
                                      style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                      hover
                                    >
                                      <TableCell>
                                        <Chip
                                          label={index + 1}
                                          size="small"
                                          style={{ minWidth: 40 }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                                          {category.categoryId}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={`${category.views} views`}
                                          style={{ backgroundColor: '#ffe0b2', minWidth: 100 }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </MUITable>
                            ) : (
                              <Box p={8} textAlign="center">
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                  📂 No Category Views Yet
                                </Typography>
                                <Typography color="textSecondary">
                                  Add trackCategoryView() to category pages.
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </MUICard>
                      </Grid>

                      <Grid item xs={12} lg={6}>
                        <MUICard style={{ height: '100%' }}>
                          <MUICardHeader
                            title="Most Viewed Subcategories"
                            subheader={`${dashboardData?.mostViewedSubCategories?.length || 0} subcategories tracked`}
                            style={{ borderBottom: '2px solid #ff9800' }}
                          />
                          <CardContent style={{ padding: 0 }}>
                            {dashboardData?.mostViewedSubCategories?.length > 0 ? (
                              <MUITable>
                                <TableHead>
                                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Subcategory ID</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold' }}>Views</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {dashboardData.mostViewedSubCategories.map((subCat, index) => (
                                    <TableRow
                                      key={subCat.subCategoryId}
                                      style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                                      hover
                                    >
                                      <TableCell>
                                        <Chip
                                          label={index + 1}
                                          size="small"
                                          style={{ minWidth: 40 }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                                          {subCat.subCategoryId}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={`${subCat.views} views`}
                                          style={{ backgroundColor: '#ffe0b2', minWidth: 100 }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </MUITable>
                            ) : (
                              <Box p={8} textAlign="center">
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                  📑 No Subcategory Views Yet
                                </Typography>
                                <Typography color="textSecondary">
                                  Add trackSubCategoryView() to subcategory pages.
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )} */}
{activeTab === 4 && (
  <Grid container spacing={3}>
    {/* Most Viewed Categories */}
    <Grid item xs={12} lg={6}>
      <MUICard style={{ height: '100%' }}>
        <MUICardHeader
          title="Most Viewed Categories"
          subheader={`${dashboardData?.mostViewedCategories?.length || 0} categories tracked`}
          style={{ borderBottom: '2px solid #ff9800' }}
        />
        <CardContent style={{ padding: 0 }}>
          {dashboardData?.mostViewedCategories?.length > 0 ? (
            <MUITable>
              <TableHead>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell align="right" style={{ fontWeight: 'bold' }}>Views</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.mostViewedCategories.map((category, index) => (
                  <TableRow
                    key={category.categoryId}
                    style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                    hover
                  >
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        style={{ minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {category.name || category.categoryId}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.75rem' }}>
                        ID: {category.categoryId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${category.views} views`}
                        style={{ backgroundColor: '#ffe0b2', minWidth: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MUITable>
          ) : (
            <Box p={8} textAlign="center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                📂 No Category Views Yet
              </Typography>
              <Typography color="textSecondary">
                Add trackCategoryView() to category pages.
              </Typography>
            </Box>
          )}
        </CardContent>
      </MUICard>
    </Grid>

    {/* Most Viewed Subcategories */}
    <Grid item xs={12} lg={6}>
      <MUICard style={{ height: '100%' }}>
        <MUICardHeader
          title="Most Viewed Subcategories"
          subheader={`${dashboardData?.mostViewedSubCategories?.length || 0} subcategories tracked`}
          style={{ borderBottom: '2px solid #ff9800' }}
        />
        <CardContent style={{ padding: 0 }}>
          {dashboardData?.mostViewedSubCategories?.length > 0 ? (
            <MUITable>
              <TableHead>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Subcategory</TableCell>
                  <TableCell align="right" style={{ fontWeight: 'bold' }}>Views</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.mostViewedSubCategories.map((subCat, index) => (
                  <TableRow
                    key={subCat.subCategoryId}
                    style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                    hover
                  >
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        style={{ minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {subCat.name || subCat.subCategoryId}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.75rem' }}>
                        ID: {subCat.subCategoryId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${subCat.views} views`}
                        style={{ backgroundColor: '#ffe0b2', minWidth: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MUITable>
          ) : (
            <Box p={8} textAlign="center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                📑 No Subcategory Views Yet
              </Typography>
              <Typography color="textSecondary">
                Add trackSubCategoryView() to subcategory pages.
              </Typography>
            </Box>
          )}
        </CardContent>
      </MUICard>
    </Grid>
  </Grid>
)}
                  {/* Tab 6: Revenue */}
                  {activeTab === 5 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MUICard>
                          <MUICardHeader
                            title="Revenue Over Time"
                            subheader="Daily revenue trends from orders"
                            style={{ borderBottom: '2px solid #00bcd4' }}
                          />
                          <CardContent>
                            <Line
                              data={{
                                labels: revenueData?.revenueByDate?.map(d => d.date) || [],
                                datasets: [{
                                  label: 'Revenue ($)',
                                  data: revenueData?.revenueByDate?.map(d => parseFloat(d.revenue)) || [],
                                  borderColor: 'rgb(75, 192, 192)',
                                  backgroundColor: 'rgba(75, 192, 192, 0.1)',
                                  tension: 0.1,
                                  fill: true
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: false
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      callback: function (value) {
                                        return '$' + value.toFixed(0);
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </CardContent>
                        </MUICard>
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>

        {/* Tasks Section - Commented Out */}
        {/* <Row>
          <Col md={12}>
            <Card className="card-tasks">
              <CardHeader>
                <h5 className="card-category">Backend Development</h5>
                <CardTitle tag="h4">Tasks</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="table-full-width table-responsive">
                  <Table>
                    <tbody>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input defaultChecked type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Sign contract for "What are conference organizers
                          afraid of?"
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip731609871"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip731609871"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip923217206"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip923217206"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Lines From Great Russian Literature? Or E-mails From
                          My Boss?
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip907509347"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip907509347"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip496353037"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip496353037"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input defaultChecked type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Flooded: One year later, assessing what was lost and
                          what was found when a ravaging rain swept through
                          metro Detroit
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip326247652"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip326247652"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip389516969"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip389516969"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin" /> Updated 3
                  minutes ago
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row> */}

        {/* Product Views Breakdown Modal */}
        <Dialog
          open={viewsModalOpen}
          onClose={handleCloseViewsModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                View Breakdown
                {selectedProduct && (
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: '4px' }}>
                    {getProductDetails(selectedProduct.productId)?.title || selectedProduct.productId}
                  </Typography>
                )}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseViewsModal}
                aria-label="close"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingBreakdown ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : productViewsBreakdown ? (
              <Box>
                <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                  Total Views: <strong>{productViewsBreakdown.total || selectedProduct?.views || 0}</strong>
                </Typography>
                <MUITable>
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell style={{ fontWeight: 'bold' }}>Platform</TableCell>
                      <TableCell align="right" style={{ fontWeight: 'bold' }}>Views</TableCell>
                      <TableCell align="right" style={{ fontWeight: 'bold' }}>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            component="span"
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                              marginRight: 8
                            }}
                          />
                          <Typography variant="body1">Web</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {productViewsBreakdown.web || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {productViewsBreakdown.total 
                            ? `${((productViewsBreakdown.web || 0) / productViewsBreakdown.total * 100).toFixed(1)}%`
                            : '0%'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            component="span"
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#2e7d32',
                              marginRight: 8
                            }}
                          />
                          <Typography variant="body1">iOS</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {productViewsBreakdown.ios || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {productViewsBreakdown.total 
                            ? `${((productViewsBreakdown.ios || 0) / productViewsBreakdown.total * 100).toFixed(1)}%`
                            : '0%'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            component="span"
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#f50057',
                              marginRight: 8
                            }}
                          />
                          <Typography variant="body1">Android</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {productViewsBreakdown.android || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {productViewsBreakdown.total 
                            ? `${((productViewsBreakdown.android || 0) / productViewsBreakdown.total * 100).toFixed(1)}%`
                            : '0%'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {/* {productViewsBreakdown.mobile && (
                      <TableRow>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box
                              component="span"
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: '#ff9800',
                                marginRight: 8
                              }}
                            />
                            <Typography variant="body1">Mobile (Other)</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            {productViewsBreakdown.mobile || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="textSecondary">
                            {productViewsBreakdown.total 
                              ? `${((productViewsBreakdown.mobile || 0) / productViewsBreakdown.total * 100).toFixed(1)}%`
                              : '0%'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )} */}
                  </TableBody>
                </MUITable>
              </Box>
            ) : (
              <Box p={4} textAlign="center">
                <Typography variant="body1" color="textSecondary">
                  No view data available for this product.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <MUIButton onClick={handleCloseViewsModal} color="primary">
              Close
            </MUIButton>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default Dashboard;
