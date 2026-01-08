// src/views/Analytics.js

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Paper
} from '@material-ui/core';
import { Line } from 'react-chartjs-2';

const API_URL = "https://2uys9kc217.execute-api.us-east-1.amazonaws.com/dev";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [dashboard, revenue, purchases, users] = await Promise.all([
        fetch(`${API_URL}/analytics/dashboard`).then(r => r.json()),
        fetch(`${API_URL}/analytics/revenue`).then(r => r.json()),
        fetch(`${API_URL}/analytics/purchases`).then(r => r.json()),
        fetch(`${API_URL}/analytics/users`).then(r => r.json())
      ]);
      
      console.log("dashboard=>>>", dashboard);
      console.log("revenue=>>>", revenue);
      console.log("purchases=>>>", purchases);
      console.log("users=>>>", users);
      
      setDashboardData(dashboard);
      setRevenueData(revenue);
      setPurchaseData(purchases);
      setUserData(users);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics Row 1 - Revenue & Orders */}
      <Grid container spacing={3} style={{ marginBottom: 20 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${revenueData?.totalRevenue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {revenueData?.totalOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Order Value
              </Typography>
              <Typography variant="h4">
                ${revenueData?.averageOrderValue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {userData?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Conversion: {userData?.conversionRate || '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Metrics Row 2 - Tracking Events */}
      <Grid container spacing={3} style={{ marginBottom: 30 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ background: '#f0f7ff' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Events Tracked
              </Typography>
              <Typography variant="h4">
                {dashboardData?.totalEvents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ background: '#fff4e6' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Web Visits
              </Typography>
              <Typography variant="h4">
                {dashboardData?.deviceBreakdown?.web || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ background: '#e8f5e9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Mobile Visits
              </Typography>
              <Typography variant="h4">
                {dashboardData?.deviceBreakdown?.mobile || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ background: '#fce4ec' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Product Views
              </Typography>
              <Typography variant="h4">
                {dashboardData?.mostViewedProducts?.reduce((sum, p) => sum + p.views, 0) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Different Analytics Views */}
      <Paper style={{ marginBottom: 20 }}>
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

      {/* Tab 1: Most Viewed Products */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Most Viewed Products" 
                subheader={`${dashboardData?.mostViewedProducts?.length || 0} products tracked - Showing products that users clicked on`}
                style={{ borderBottom: '2px solid #1976d2' }}
              />
              <CardContent style={{ padding: 0 }}>
                {dashboardData?.mostViewedProducts?.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Product ID</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Total Views</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.mostViewedProducts.map((product, index) => (
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
                              {product.productId}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${product.views} views`} 
                              color="primary" 
                              style={{ minWidth: 100, fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box p={8} textAlign="center">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      📊 No Product Views Yet
                    </Typography>
                    <Typography color="textSecondary">
                      Add trackProductView() to your product detail pages to start tracking.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Most Purchased Products */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Most Purchased Products" 
                subheader={`${purchaseData?.mostPurchased?.length || 0} products sold - Based on completed orders`}
                style={{ borderBottom: '2px solid #2e7d32' }}
              />
              <CardContent style={{ padding: 0 }}>
                {purchaseData?.mostPurchased?.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Product Name</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseData.mostPurchased.map((product, index) => (
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
                              {product.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {product.productId}
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
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box p={8} textAlign="center">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      🛒 No Purchases Yet
                    </Typography>
                    <Typography color="textSecondary">
                      Purchase data comes from completed orders.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Most Added to Cart */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Most Added to Cart" 
                subheader={`${dashboardData?.mostAddedToCart?.length || 0} products tracked - Products users are interested in`}
                style={{ borderBottom: '2px solid #f50057' }}
              />
              <CardContent style={{ padding: 0 }}>
                {dashboardData?.mostAddedToCart?.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Product ID</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Times Added</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.mostAddedToCart.map((product, index) => (
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
                              {product.productId}
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
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box p={8} textAlign="center">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      🛒 No Cart Additions Yet
                    </Typography>
                    <Typography color="textSecondary">
                      Add trackAddToCart() to your cart buttons to start tracking.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Page Views */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Page Views" 
                subheader={`${dashboardData?.pageViews?.length || 0} pages tracked - Most visited pages on your site`}
                style={{ borderBottom: '2px solid #9c27b0' }}
              />
              <CardContent style={{ padding: 0 }}>
                {dashboardData?.pageViews?.length > 0 ? (
                  <Table>
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
                  </Table>
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
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Categories & Subcategories */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card style={{ height: '100%' }}>
              <CardHeader 
                title="Most Viewed Categories" 
                subheader={`${dashboardData?.mostViewedCategories?.length || 0} categories tracked`}
                style={{ borderBottom: '2px solid #ff9800' }}
              />
              <CardContent style={{ padding: 0 }}>
                {dashboardData?.mostViewedCategories?.length > 0 ? (
                  <Table>
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
                  </Table>
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
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card style={{ height: '100%' }}>
              <CardHeader 
                title="Most Viewed Subcategories" 
                subheader={`${dashboardData?.mostViewedSubCategories?.length || 0} subcategories tracked`}
                style={{ borderBottom: '2px solid #ff9800' }}
              />
              <CardContent style={{ padding: 0 }}>
                {dashboardData?.mostViewedSubCategories?.length > 0 ? (
                  <Table>
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
                  </Table>
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
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Revenue */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
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
                          callback: function(value) {
                            return '$' + value.toFixed(0);
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Analytics;