
import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../pages/Dashboard";

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import ResetPasswordPage from "../pages/Authentication/ResetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Profile/User-profile";

import Warehouses from "../pages/Warehouses/Warehouses";
import Reports from "../pages/Reports/Reports";
import QRscan from "../pages/QRscan/QRscan";
import Users from "../pages/Users/Users";
import Inventory from "../pages/Inventory/Inventory";
import ProductDetails from "../pages/Inventory/ProductDetails";

import Settings from "../pages/Settings/Settings";

// Admin Dashboard
import ManageUsers from "../pages/Admin/ManageUsers";
import ActivityLogs from "../pages/Admin/ActivityLogs";
import LoginasUser from "../pages/Authentication/LoginasUser";


const authProtectedRoutes = [
  { path: "/settings", component: <Settings  /> },   
  { path: "/warehouses", component: <Warehouses  /> },  
  { path: "/reports", component: <Reports  /> },
  { path: "/qrscan", component: <QRscan  /> },
  { path: "/users", component: <Users /> },  
  { path: "/inventory", component: <Inventory /> },  
  { path: "/products/:id", component: <ProductDetails /> },    

  { path: "/activitylogs", component: <ActivityLogs  /> },
  { path: "/loginasuser", component: <LoginasUser  /> },
  { path: "/manageusers", component: <ManageUsers  /> },
  { path: "/home", component: <Dashboard /> },
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/index", component: <Dashboard /> },
  //User Profile
  { path: "/profile", component: <UserProfile /> },

  {
    path: "/",
    exact: true,
    component: <Navigate to="/" />,
  },
  { path: "*", component: <Navigate to="/" /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/login/:referrer", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/reset-password", component: <ResetPasswordPage /> },
  
  // { path: "/register", component: <Register /> },
  // { path: "/register/:referrer?", component: <Register /> },
  
  { path: "/register", component: <Register /> },
  { path: "/register/:referrer", component: <Register /> },
  { path: "/dashboard/register/:referrer", component: <Register /> },

];

export { authProtectedRoutes, publicRoutes };