import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APIClient } from "../helpers/api_helper";

const Navdata = () => {
  const api = new APIClient();
  const history = useNavigate();

  // UI State
  const [isInitiativesOpen, setIsInitiativesOpen] = useState(false);
  const [iscurrentState, setIscurrentState] = useState("Dashboard");
  const [holdingTankCount, setHoldingTankCount] = useState(0);

  const [isCleanEarthOpen, setIsCleanEarthOpen] = useState(false);
  const [isCleanWaterOpen, setIsCleanWaterOpen] = useState(false);
  const [isCleanBodyOpen, setIsCleanBodyOpen] = useState(false);

  const [isVideosystem, setIsVideosystem] = useState(false);
  const [isVideospecials, setIsVideospecials] = useState(false);
  const [isVideosupport, setIsVideosupport] = useState(false);

  const [isDashboard, setIsDashboard] = useState(false);
  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [isWallet, setIsWallet] = useState(false);
  const [isCalender, setCalender] = useState(false);

  // Apps
  const [isEmail, setEmail] = useState(false);
  const [isSubEmail, setSubEmail] = useState(false);
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [isProjects, setIsProjects] = useState(false);
  const [isTasks, setIsTasks] = useState(false);
  const [isCRM, setIsCRM] = useState(false);
  const [isCrypto, setIsCrypto] = useState(false);
  const [isInvoices, setIsInvoices] = useState(false);
  const [isSupportTickets, setIsSupportTickets] = useState(false);
  const [isNFTMarketplace, setIsNFTMarketplace] = useState(false);
  const [isJobs, setIsJobs] = useState(false);
  const [isJobList, setIsJobList] = useState(false);
  const [isCandidateList, setIsCandidateList] = useState(false);
  const [isSharingstaking, setIsSharingstaking] = useState(false);

  // Authentication
  const [isSignIn, setIsSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordCreate, setIsPasswordCreate] = useState(false);
  const [isLockScreen, setIsLockScreen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isVerification, setIsVerification] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isResources, setIsResources] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [isLanding, setIsLanding] = useState(false);
  const [isApex, setIsApex] = useState(false);
  const [isLevel1, setIsLevel1] = useState(false);
  const [isLevel2, setIsLevel2] = useState(false);

  // Custom Sections
  const [isFinancialDashboard, setIsFinancialDashboard] = useState(false);
  const [isEcommerceDashboard, setIsEcommerceDashboard] = useState(false);
  const [isAIResources, setIsAIResources] = useState(false);
  const [isBenefits, setIsBenefits] = useState(false);
  const [isRetirement, setIsRetirement] = useState(false);
  const [isPartnerloans, setIsPartnerloans] = useState(false);
  const [isHumanitarian, setIsHumanitarian] = useState(false);
  const [isApplications, setIsApplications] = useState(false);
  const [isHyips, setIsHyips] = useState(false);
  const [isDashboard2, setIsDashboard2] = useState(false);
  const [isSupport, setIsSupport] = useState(false);
  const [isAdmindashboard, setisAdmindashboard] = useState(false);
  const [isSharingdonations, setIsSharingdonations] = useState(false);
  const [isExpenseaccount, setIsExpenseaccount] = useState(false);
  const [isEwalletTransfers, setIsEwalletTransfers] = useState(false);
  const [isExpenseTransfers, setIsExpenseTransfers] = useState(false);
  const [isHistory, setIsHistory] = useState(false);
  const [isAdminSharing, setIsAdminSharing] = useState(false);
  const [isDataTracking, setIsDataTracking] = useState(false);
  const [isDeferredTaxes, setIsDeferredTaxes] = useState(false);
  const [isComplaintDaos, setIsComplaintDaos] = useState(false);
  const [isSovereignDaos, setIsSovereignDaos] = useState(false);
  const [isHumanitarianDaos, setIsHumanitarianDaos] = useState(false);
  

const location = useLocation();

  // Permissions
  let hasHoldingTanks = false;
  let hasGenealogy = false;
  let isAdmin = false;
  let hasApplication = false;
  let hasHyip = false;
  let isPaidPartner = false;
  let isFreeAmbassador = false;
  let isPaidAmbassador = false;
  let isFreeHumanitarian = false;
  let isPaidHumanitarian = false;
  let isRankPartner = false; 
  let isRankAmbassador = false; 
  let isRankHumanitarian = false; 


  if (sessionStorage.getItem("authUser")) {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));

    isAdmin = obj?.is_admin === '1';
    //hasHoldingTanks = ['ambassador', 'partner', 'admin'].includes(obj?.rank);
    hasHoldingTanks = obj?.rank?.startsWith("partner") || obj?.rank?.startsWith("ambassador") || obj?.rank?.startsWith("admin");
    hasGenealogy = obj?.rank?.startsWith("partner") || obj?.rank?.startsWith("ambassador") || obj?.rank?.startsWith("humanitarian");
    //hasHyip = ['partner', 'ambassador','humanitarian'].includes(obj?.rank);
    hasHyip = obj?.rank?.startsWith("partner") || obj?.rank?.startsWith("ambassador") || obj?.rank?.startsWith("humanitarian");
    hasApplication = ['pioneer'].includes(obj?.rank);

    isRankPartner = obj?.rank?.startsWith("partner"); 
    isRankAmbassador = obj?.rank?.startsWith("ambassador"); 
    isRankHumanitarian = obj?.rank?.startsWith("humanitarian"); 

    isPaidPartner = ['partner_1k', 'partner_5k','partner_10k','partner_20k','partner_50k'].includes(obj?.rank);
    isPaidAmbassador = ['ambassador_100k', 'ambassador_200k','ambassador_500k'].includes(obj?.rank);
    isPaidHumanitarian = ['humanitarian_1m', 'humanitarian_2m','humanitarian_5m'].includes(obj?.rank);

    isFreeHumanitarian = ['humanitarian'].includes(obj?.rank);
    isFreeAmbassador = ['ambassador'].includes(obj?.rank);

      // pioneer: 'Pioneer',
      // partner: 'Partner',
      // partner_1k: 'Partner 1K',
      // partner_5k: 'Partner 5K',
      // partner_10k: 'Partner 10K',
      // partner_20k: 'Partner 20K',
      // partner_50k: 'Partner 50K',
      // ambassador: 'Ambassador',
      // ambassador_100k: 'Ambassador 100K',
      // ambassador_200k: 'Ambassador 200K',
      // ambassador_500k: 'Ambassador 500K',
      // humanitarian: 'Humanitarian',
      // humanitarian_1m: 'Humanitarian 1M',      
      // humanitarian_2m: 'Humanitarian 2M',
      // humanitarian_5m: 'Humanitarian 5M',

    // if (obj?.id === "2") {
    //   hasApplication = false;
    // }

    // Adding the condition for root
    if (obj?.id === "1") {
      hasApplication = true;
      hasHyip = true;
    }    
  }

  async function fetchHoldingTankCount() {

    try {
 debugger;
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { uid: obj.id };
      const response = await api.post("/holdingtankcount", data);
      if (response.success === true) {
        setHoldingTankCount(response.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch holding tank count:", error);
    }
  }

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {

      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");

    const stateResetters = {
      Dashboard: setIsDashboard,
      Resources: setIsResources,
      "E-Wallet": setIsWallet,
      Apps: setIsApps,
      Auth: setIsAuth,
      Pages: setIsPages,
      BaseUi: setIsBaseUi,
      "Admin Dashboard": setisAdmindashboard,
      AdvanceUi: setIsAdvanceUi,
      Forms: setIsForms,
      Tables: setIsTables,
      Charts: setIsCharts,
      Icons: setIsIcons,
      Maps: setIsMaps,
      MuliLevel: setIsMultiLevel,
      Landing: setIsLanding,
      "Financial Dashboard": setIsFinancialDashboard,
      "Ecommerce Dashboard": setIsEcommerceDashboard,
      "AI Resources": setIsAIResources,
      Benefits: setIsBenefits,
      Retirement: setIsRetirement,
      Humanitarian: setIsHumanitarian,
      Applications: setIsApplications,
      Hyips: setIsHyips,
      Dashboard2: setIsDashboard2,
      Support: setIsSupport,
      Sharingdonations: setIsSharingdonations,
      Expenseaccount: setIsExpenseaccount,
      History: setIsHistory,
      AdminSharing: setIsAdminSharing,
      DataTracking: setIsDataTracking,
      ComplaintDaos: setIsComplaintDaos,
      SovereignDaos: setIsSovereignDaos,
      HumanitarianDaos: setIsHumanitarianDaos,
    };

    for (const key in stateResetters) {
      if (iscurrentState !== key) stateResetters[key](false);
    }

    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
  }, [history, iscurrentState]);



useEffect(() => {
  const path = location.pathname;

  // Sharing Donations (3-level deep)
  if (path.startsWith("/sharingdonations") || path.startsWith("/sharing") ) {
    setIsFinancialDashboard(true);
    setIsSharingdonations(true);
    setIscurrentState("Financial Dashboard");
  }

  // Expense Account (3-level deep)
  if (
    path.startsWith("/transactions") ||
    path.startsWith("/deposit") ||
    path.startsWith("/deposithistory") ||
    path.startsWith("/withdraw") ||
    path.startsWith("/transfer") ||
    path.startsWith("/withdrawhistory")
  ) {
    setIsFinancialDashboard(true);
    setIsExpenseaccount(true);
    setIscurrentState("Financial Dashboard");
  }

// Dashboard > History
  if (
    path.startsWith("/orderhistory") ||
    path === "/dashboard"
  ) {
    setIsDashboard2(true);
    setIsHistory(true);
    setIscurrentState("Dashboard2");
  }



  // ✅ Dashboard > Referrals (new)
  if (
    path.startsWith("/referrals") ||
    path.startsWith("/genealogy") ||
    path.startsWith("/tribe") ||
    path.startsWith("/holdingtank")
  ) {
    setIsDashboard2(true);
    setIsSharingdonations(true);
    setIscurrentState("Dashboard2");
  }

  // Admin Dashboard > Management
  if (
    path.startsWith("/managesharingpurchases") ||
    path.startsWith("/manageusers") ||
    path.startsWith("/managedeposits") ||
    path.startsWith("/managesites") ||
    path.startsWith("/managepayout")
  ) {
    setisAdmindashboard(true);
    setIsSharingdonations(true);
    setIscurrentState("Admin Dashboard");
  }

    // Admin Dashboard > SHARING
  if (
    path.startsWith("/managesharingpurchases") ||
    path.startsWith("/globalsharingmatrix") 
  ) {
    setisAdmindashboard(true);
    setIsAdminSharing(true);
    setIscurrentState("Admin Dashboard");
  }
  
  // Admin Dashboard > Data Tracking
  if (
    path.startsWith("/statistics") ||
    path.startsWith("/alltransactions") ||
    path.startsWith("/activitylogs")
  ) {
    setisAdmindashboard(true);
    setIsDataTracking(true);
    setIscurrentState("Admin Dashboard");
  }


  // Admin Projects > Partners DAOs
  if (
    path.startsWith("/site/doa-arbitrage") ||    
    path.startsWith("/site/dao-trading")
  ) {
 
      setIsHyips(true);
      setIsComplaintDaos(true);
      setIscurrentState("Hyips");

  }

  // Admin Projects > Ambassador DAOs
  if (
    path.startsWith("/site/doa-staking")
  ) {
    setIsHyips(true);
    setIsSovereignDaos(true);
    setIscurrentState("Hyips");
  }

  // Admin Projects > Humanitarian DAOs
  if (
    path.startsWith("/site/dao-hodling")
  ) {
    setIsHyips(true);
    setIsHumanitarianDaos(true);
    setIscurrentState("Hyips");
  }

}, [location]);



const menuItems = [
  { label: "MAIN", isHeader: true },

  {
    id: "dashboard",
    label: "Dashboard",
    link: "/dashboard",
    icon: "ri-home-4-line",
    className: "text-danger",
  },
  {
    id: "inventory",
    label: "Inventory",
    link: "/inventory",
    icon: "ri-box-3-line",
  },
  {
    id: "qr-scanner",
    label: "QR Scanner",
    link: "/qrscan",
    icon: "ri-qr-code-line",
  },
  {
    id: "warehouses",
    label: "Warehouses",
    link: "/warehouses",
    icon: "ri-building-2-line",
  },
  {
    id: "reports",
    label: "Reports",
    link: "/reports",
    icon: "ri-bar-chart-2-line",
  },

  { label: "ADMINISTRATION", isHeader: true },

  {
    id: "user-management",
    label: "User Management",
    link: "/users",
    icon: "ri-team-line",
  },
  {
    id: "settings",
    label: "Settings ",
    link: "/settings",
    icon: "ri-settings-3-line",
  },
];



  return <>{menuItems}</>;
};

export default Navdata;
