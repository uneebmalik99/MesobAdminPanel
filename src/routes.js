import Dashboard from "views/Dashboard.js";
import Notifications from "views/Notifications.js";
import UserPage from "views/UserPage.js";
import Users from "views/Users.js";
import PromoCodes from "views/PromoCodes.js";
import Orders from "views/Orders.js";
import Cart from "views/Cart";
import OrderDetails from "views/OrderDetails";
// import EditOrder from "views/EditOrder";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "design_app",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/orders",
    name: "Orders",
    icon: "shopping_box",
    component: <Orders />,
    layout: "/admin",
  },
  {
    path: "/cart",
    name: "Cart",
    icon: "shopping_cart-simple",
    component: <Cart />,
    layout: "/admin",
  },
  {
    path: "/promo-codes",
    name: "Promo Codes",
    icon: "shopping_tag-content",
    component: <PromoCodes />,
    layout: "/admin",
  },
  {
    path: "/users",
    name: "Users",
    icon: "users_single-02",
    component: <Users />,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "ui-1_bell-53",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/user-page",
    name: "User Profile",
    icon: "users_single-02",
    component: <UserPage />,
    layout: "/admin",
  },
  {
    path: "/order/details/:id",
    name: "Order Details",
    component: <OrderDetails />,
    layout: "/admin",
    invisible: true,
  },
  // {
  //   path: "/order/edit/:id", // Dynamic route for editing a specific order
  //   name: "Edit Order",
  //   component: <EditOrder />, // The EditOrder component
  //   layout: "/admin",
  //   invisible: true, // Hide it from the sidebar menu
  // },
];
export default dashRoutes;
