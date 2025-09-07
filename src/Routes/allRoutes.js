



import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../pages/Dashboard";
import Dashboard2 from "../pages/DashboardEcommerce";

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import ResetPasswordPage from "../pages/Authentication/ResetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Profile/Settings";

import Warehouses from "../pages/Warehouses/Warehouses";
import Reports from "../pages/Reports/Reports";
import QRscan from "../pages/QRscan/QRscan";
import Users from "../pages/Users/Users";
import Inventory from "../pages/Inventory/Inventory";

import Transactions from "../pages/Transactions/Transactions";
import Rewards from "../pages/Rewards/Rewards";
import Ewallets from "../pages/Ewallet/EwalletTransaction";
import Earnings from "../pages/Earnings/Earnings";

import P2PTrading from "../pages/P2PTrading/index";
import P2PTrading2 from "../pages/P2PTrading/P2PTrading";

import LandingPages from "../pages/Resources/LandingPages";
import OrderHistory from "../pages/OrderHistory/OrderHistory";
import Matrix from "../pages/Matrix/Matrix";
import Purchase from "../pages/Purchase/Purchase";
import Referrals from "../pages/Genealogy/Referrals";
import Genealogy from "../pages/Genealogy/Genealogy";
import SponsorTree from "../pages/Genealogy/SponsorTree";
import Tribe from "../pages/Genealogy/Tribe";
import Deposit from "../pages/Ewallet/Deposit";
import DepositHistory from "../pages/Ewallet/DepositHistory";
import Withdraw from "../pages/Ewallet/Withdraw";
import WithdrawHistory from "../pages/Ewallet/WithdrawHistory";
import Transfer from "../pages/Ewallet/Transfer";
import TopupWallet from "../pages/Ewallet/TopupWallet";

import UnderConstruction from "../pages/UnderConstruction/UnderConstruction";

import ContactUs from "../pages/Resources/ContactUs";

import SharingUniversityDonations from "../pages/SharingDonations/UniversityPurchase";
import SharingStudioDonations from "../pages/SharingDonations/StudioPurchase";
import SharingFinancialDonations from "../pages/SharingDonations/FinancialPurchase";
import SharingDonations from "../pages/SharingDonations/SharingDonations";
import SharingPayout from "../pages/SharingDonations/SharingPayout";

import SiteLinks from "../pages/SiteLinks/SiteLinks";
import Site from "../pages/Site/Site";

import Videos from "../pages/Videos/Videos";
import VideoLibrary from "../pages/Videos/VideoLibrary";

// Admin Dashboard
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import AllTransactions from "../pages/Admin/AllTransactions";
import GlobalSharingMatrix from "../pages/Admin/GlobalSharingMatrix";
import ManageSharingPurchases from "../pages/Admin/ManageSharingPurchases";
import ActivityLogs from "../pages/Admin/ActivityLogs";
import LoginasUser from "../pages/Authentication/LoginasUser";
import ManageSites from "../pages/Admin/ManageSites";
import HoldingTank from "../pages/Admin/HoldingTank";
import ManageDeposits from "../pages/Admin/ManageDeposits";
import ManageWithdrawals from "../pages/Admin/ManageWithdrawals";
import ManageCategories from "../pages/Admin/ManageCategories";


const authProtectedRoutes = [
  { path: "/warehouses", component: <Warehouses  /> },  
  { path: "/reports", component: <Reports  /> },
  { path: "/qrscan", component: <QRscan  /> },
  { path: "/users", component: <Users /> },  
  { path: "/inventory", component: <Inventory /> },  
  

  { path: "/topupwallet", component: <TopupWallet  /> },
  { path: "/statistics", component: <AdminDashboard  /> },  
  { path: "/activitylogs", component: <ActivityLogs  /> },
  { path: "/loginasuser", component: <LoginasUser  /> },
  { path: "/manageusers", component: <ManageUsers  /> },
  { path: "/holdingtank", component: <HoldingTank  /> },
  { path: "/alltransactions", component: <AllTransactions  /> },
  { path: "/globalsharingmatrix", component: <GlobalSharingMatrix  /> },
  { path: "/managesharingpurchases", component: <ManageSharingPurchases /> },
  { path: "/managesites", component: <ManageSites /> },
  { path: "/home", component: <Dashboard /> },
  { path: "/home2", component: <Dashboard2 /> },  
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/index", component: <Dashboard /> },
  { path: "/managedeposits", component: <ManageDeposits  /> },
  { path: "/managewithdrawals", component: <ManageWithdrawals  /> },
  { path: "/managecategories", component: <ManageCategories  /> },

  //User Profile
  { path: "/profile", component: <UserProfile /> },

  { path: "/transactions", component: <Transactions /> },
  { path: "/rewards", component: <Rewards /> },
  { path: "/ewallets", component: <Ewallets /> },
  { path: "/earnings", component: <Earnings /> },
  { path: "/p2ptrading2", component: <P2PTrading2 /> },
  { path: "/p2ptrading", component: <P2PTrading /> },

  { path: "/landingpages", component: <LandingPages /> },
  { path: "/orderhistory", component: <OrderHistory /> },
  { path: "/matrix", component: <Matrix /> },
  { path: "/purchase", component: <Purchase /> },
  { path: "/referrals", component: <Referrals /> },
  { path: "/referrals/:id", component: <Referrals  /> },
  { path: "/genealogy", component: <Genealogy  /> },
  { path: "/tribe", component: <Tribe  /> },
  { path: "/sponsortree", component: <SponsorTree  /> },
  { path: "/withdraw", component: <Withdraw /> },
  { path: "/withdrawhistory", component: <WithdrawHistory /> },
  { path: "/transfer", component: <Transfer /> },
  { path: "/underconstruction", component: <UnderConstruction /> },
  { path: "/contactus", component: <ContactUs /> },

  { path: "/sharinguniversitypurchase", component: <SharingUniversityDonations /> },
  { path: "/sharingstudiopurchase", component: <SharingStudioDonations /> },
  { path: "/sharingfinancialpurchase", component: <SharingFinancialDonations /> },
  { path: "/sharingdonations/:type", component: <SharingDonations /> },
  { path: "/sharingpayout", component: <SharingPayout /> },  

  { path: "/sitelinks", component: <SiteLinks /> },
  { path: "/site/:sitename", component: <Site /> },

  { path: "/deposit", component: <Deposit /> },
  { path: "/deposithistory", component: <DepositHistory  /> },

  { path: "/videos/:videoname", component: <Videos /> },
  { path: "/videolibrary/:videoname", component: <VideoLibrary /> },  

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
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