import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Login.css";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { Helmet } from "react-helmet";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const notificationAlertRef = useRef(null);

  // Protect the login page: redirect if user is already logged in
  useEffect(() => {
    const userEmail = sessionStorage.getItem("user_email");
    if (userEmail) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const showNotification = (type, message) => {
    const options = {
      place: "tr", // top right
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 5,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            Password: password,
          }),
        }
      );

      const result = await response.json();

      if (result === "success") {
        // Store data in sessionStorage
        sessionStorage.setItem("user_email", email);

        // Show success notification
        showNotification("success", "Login successful!");

        // Redirect to the admin dashboard
        setTimeout(() => navigate("/admin/dashboard"), 1000);
      } else {
        // Show error notification
        showNotification(
          "danger",
          "Invalid email or password. Please try again."
        );
      }
    } catch (error) {
      // Show error notification for network errors or server issues
      showNotification("danger", "An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Mesob Store</title>
      </Helmet>
      <div className="login-container">
        <NotificationAlert ref={notificationAlertRef} />
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
