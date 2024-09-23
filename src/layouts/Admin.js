import React from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";

// core components
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

var ps;

function Admin(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [backgroundColor, setBackgroundColor] = React.useState("blue");
  const mainPanel = React.useRef();

  // Check user session on component mount
  React.useEffect(() => {
    // Check if user_email exists in localStorage
    const userEmail = localStorage.getItem("user_email");

    if (!userEmail) {
      // If no user session, redirect to login page
      navigate("/login");
    }
  }, [navigate]);

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.body.classList.toggle("perfect-scrollbar-on");
      }
    };
  });

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
  }, [location]);

  return (
    <div className="wrapper">
      <Sidebar {...props} routes={routes} backgroundColor={backgroundColor} />
      <div className="main-panel" ref={mainPanel}>
        <DemoNavbar {...props} />
        <Routes>
          {routes.map((prop, key) => {
            return (
              <Route
                path={prop.path}
                element={prop.component}
                key={key}
                exact
              />
            );
          })}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Routes>
        <Footer fluid />
      </div>
    </div>
  );
}

export default Admin;
