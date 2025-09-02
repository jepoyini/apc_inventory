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
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    if (obj?.is_admin) {
      fetchHoldingTankCount();
      // Optional interval polling can be added here
    }
  }, []);

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

    {
      label: "YOUR LIFESTYLE",
      isHeader: true,
    },

    {
      id: "wealth-empowerment",
      label: "Global Wealth",
      icon: "ri-calendar-check-line",
      link: "/#",
      stateVariables: isRetirement,
      click: function (e) {
        e.preventDefault();
        setIsRetirement(!isRetirement);
        setIscurrentState("Retirement");
        updateIconSidebar(e);
      },
      subItems: [
       
        {
          id: "sharingstaking",
          label: "Leveraging Strategies", // updated label
          icon: "ri-stack-line",
          link: "/#",
          isChildItem: true,
          stateVariables: isSharingstaking,
          parentId: "retirement",
          click: function (e) {
            e.preventDefault();
            setIsSharingstaking(!isSharingstaking);
          },
          childItems: [
            // {
            //   id: "trade-usdt",
            //   label: "Trade USDT",
            //   link: "/site/trade-usdt",
            //   parentId: "sharingstaking",
            // },    
            // {
            //   id: "farm-wfi",
            //   label: "Farm WFI",
            //   link: "/site/farm-wfi",
            //   parentId: "sharingstaking",
            // },   
            {
              id: "decentralized-wellness",
              label: "Decentralized Clinic",
              link: "/site/decentralized-wellness",
              parentId: "sharingstaking",
            },              
            {
              id: "decentralized-banking",
              label: "Decentralized Bank",
              link: "/site/decentralized-banking",
              parentId: "sharingstaking",
            },                      
            // {
            //   id: "stake-lgns",
            //   label: "Stake LGNS",
            //   link: "/site/stake-lgns",
            //   parentId: "sharingstaking",
            // },
            {
              id: "decentralized-internet",
              label: "Decentralized City",
              link: "/site/decentralized-internet",
              parentId: "sharingstaking",
            },     
                   
            // {
            //   id: "hodl-xnt",
            //   label: "HODL XNT",
            //   link: "/site/hodl-xnt",
            //   parentId: "sharingstaking",
            // },
          ]
        },

        {
          id: "sharingfunding",
          label: "SHARING Funding",
          icon: "ri-exchange-dollar-line",
          link: "/#",
          isChildItem: true,
          stateVariables: isPartnerloans,
          parentId: "retirement",
          click: function (e) {
            e.preventDefault();
            setIsPartnerloans(!isPartnerloans);
          },
          childItems: [
            {
              id: "vip-loans",
              label: "VIP Loans",
              //link: "/site/vip-loans",
              className: "text-danger", 
              parentId: "partnerloans",
            },
            {
              id: "credit-restoration",
              label: " Credit Restoration",
              //link: "/site/credit-restoration",
              parentId: "partnerloans",
            },
            {
              id: "real-estate-loan",
              label: "Real Estate",
             // link: "/site/realestate",
              parentId: "partnerloans",
            },
          ]
        },

        {
          id: "deferredtaxes",
          label: "Deferred Taxes",
          link: "/#",
          icon: "ri-bank-line",
          parentId: "retirement",
          isChildItem: true,
          stateVariables: isDeferredTaxes,
          click: function (e) {
            e.preventDefault();
            setIsDeferredTaxes(!isDeferredTaxes);
          },
          childItems: [
            {
              id: "deferredsalestrust",
              label: "Deferred Sales Trust",
             // link: "/site/deferredsalestrust",
              parentId: "deferredtaxes",
            },
            {
              id: "delawaretrust",
              label: "Delaware Statutory Trust",
             // link: "/site/delawaretrust",
              parentId: "deferredtaxes",
            },
            {
              id: "charitableremaindertrust",
              label: "Charitable Trust",
              //link: "/site/charitabletrust",
              parentId: "deferredtaxes",
            },
          ],
        }

      ],
    },

    {
      id: "benefits",
      label: "Luxury Benefits",
      icon: "ri-gift-line",
      link: "/#",
      stateVariables: isBenefits,
      click: function (e) {
        e.preventDefault();
        setIsBenefits(!isBenefits);
        setIscurrentState("Benefits");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "luxury-home",
          label: "Luxury Home",
          //link: "/site/luxury-home",
          icon: "ri-gift-line",
          parentId: "benefits",
        },
        {
          id: "luxury-trips",
          label: "Luxury Trips",
        //  link: "/site/luxury-trips",
          icon: "ri-heart-pulse-line",
          parentId: "benefits",
        },
        {
          id: "luxury-money",
          label: "Luxury Money",
          link: "/site/luxury-money",
          icon: "ri-flight-takeoff-line",
          parentId: "benefits",
        },
      ],

    },

    {
      id: "humanitarian",
      label: "Clean Living",
      icon: "ri-earth-line",
      link: "/#",
      stateVariables: isHumanitarian,
      click: function (e) {
        e.preventDefault();
        setIsHumanitarian(!isHumanitarian);
        setIscurrentState("Humanitarian");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "cleanrecycling",
          label: "Clean Earth Project",
          icon: "ri-recycle-line",
          link: "/#",
          isChildItem: true,
          stateVariables: isCleanEarthOpen,
          parentId: "humanitarian",
          click: function (e) {
            e.preventDefault();
            setIsCleanEarthOpen(!isCleanEarthOpen);
          },
          childItems: [
            {
              id: "energyreduction",
              label: "Energy Reduction",
            //  link: "/site/cleanrecyclingenergy",
              parentId: "cleanrecycling"
            },
            {
              id: "plastics-reduction",
              label: "Plastics Reduction",
              link: "/site/plastics-reduction",
              parentId: "cleanrecycling"
            },
            {
              id: "emissionsreduction",
              label: "Emissions Reduction",
             // link: "/site/cleanrecyclingemissions",
              parentId: "cleanrecycling"
            },
          ]
        },
        {
          id: "cleanfuel",
          label: "Clean Water Project",
          icon: "ri-gas-station-line",
          link: "/#",
          isChildItem: true,
          stateVariables: isCleanWaterOpen,
          parentId: "humanitarian",
          click: function (e) {
            e.preventDefault();
            setIsCleanWaterOpen(!isCleanWaterOpen);
          },
          childItems: [
            {
              id: "alkaline-water",
              label: "Alkaline Water",
           //   link: "/site/alkaline-water",
              parentId: "cleanfuel"
            },
            {
              id: "earthwater",
              label: "Earth Water",
              link: "/site/earthwater",
              parentId: "cleanfuel"
            },
            {
              id: "mineralwater",
              label: "Mineral Water",
             // link: "/site/cleanfuelmineral",
              parentId: "cleanfuel"
            },
          ]
        },
        {
          id: "cleanbody",
          label: "Clean Body Project",
          icon: "ri-body-scan-line",
          link: "/#",
          isChildItem: true,
          stateVariables: isCleanBodyOpen,
          parentId: "humanitarian",
          click: function (e) {
            e.preventDefault();
            setIsCleanBodyOpen(!isCleanBodyOpen);
          },
          childItems: [
            {
              id: "balanced-shakes",
              label: "Balanced Shakes",
              link: "/site/balanced-shakes", // Update path if needed
              parentId: "cleanbody"
            },
            {
              id: "balanced-nutrients",
              label: "Balanced Nutrients",
           //   link: "/site/balanced-nutrients",
              parentId: "cleanbody"
            },            
            {
              id: "balanced-fitness",
              label: "Balanced Fitness",
             // link: "/site/balanced-fitness",
              parentId: "cleanbody"
            },

          ]

        },
      ],
    },


    {
      label: "YOUR LEGACY",
      isHeader: true,
    },
    {
      id: "financial-dashboard",
      label: "Financials",
      icon: "ri-bar-chart-line",
      link: "/#",
      stateVariables: isFinancialDashboard,
      click: function (e) {
        e.preventDefault();
        setIsFinancialDashboard(!isFinancialDashboard);
        setIscurrentState("Financial Dashboard");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "sharingdonations",
          label: "Pledging Strategies",
          icon: "ri-wallet-3-line",
          link: "/underconstruction",
          isChildItem: true,
          stateVariables: isSharingdonations,
          click: function (e) {
            e.preventDefault();
            setIsSharingdonations(!isSharingdonations);
            // setIscurrentState("Sharingdonations");
           // updateIconSidebar(e);
          },
          childItems: [
            {
              id: "StudioDonation", 
              label: "SHARING Studio", 
              link: "/sharingdonations/studio",
            },
            { id: "UniversityDonation", 
              label: "SHARING University", 
              link: "/sharingdonations/university",
              parentId: "sharingdonations", },
            { id: "FinancialDonation", 
                label: "SHARING Financial", 
                link: "/sharingdonations/financial" },
          ]
        },
        {
          id: "rewardpoints",
          label: "Reward Points",
          icon: "ri-award-line",
          link: "/rewards",
          parentId: "financial-dashboard",
        },


        {
          id: "expenseaccount",
          label: "E-wallet Transactions",
          icon: "ri-bank-card-line",
          link: "/underconstruction",
          isChildItem: true,
          stateVariables: isExpenseaccount,
          parentId: "financial-dashboard",
          click: function (e) {
            e.preventDefault();
            setIsExpenseaccount(!isExpenseaccount);
          },
          childItems: [
            {
              id: "ewallet_transfers",
              label: "E-wallet Transfers",
              isChildItem: true,
              stateVariables: isEwalletTransfers,
              parentId: "expenseaccount",
              click: function (e) {
                e.preventDefault();
                setIsEwalletTransfers(!isEwalletTransfers);
              },
              childItems: [
                {
                  id: "newdeposit",
                  label: "E-wallet Deposits",
                  link: "/deposithistory",
                  parentId: "ewallet_transfers"
                },
                {
                  id: "ewallettransactions",
                  label: "E-wallet Transactions",
                  link: "/ewallets",
                  parentId: "ewallet_transfers"
                }
              ]
            },
            {
              id: "p2pcommunity",
              label: "P2P Community",
              link: "/transactions",
              parentId: "expenseaccount"
            },
            {
              id: "expense_transfers",
              label: "Expense Transfers",
              isChildItem: true,
              stateVariables: isExpenseTransfers,
              parentId: "expenseaccount",
              click: function (e) {
                e.preventDefault();
                setIsExpenseTransfers(!isExpenseTransfers);
              },
              childItems: [
                {
                  id: "transactions",
                  label: "Expense to E-wallet",
                  link: "/transfer",
                  parentId: "expense_transfers"
                },
                {
                  id: "expensetransactions",
                  label: "Expense Transactions",
                  link: "/transactions",
                  parentId: "expense_transfers"
                }
              ]
            }
          ]
        }

        
      ],
    },
    {
      id: "ecommerce-dashboard",
      label: "E-commerce",
      icon: "ri-shopping-cart-line",
      link: "/#",
      stateVariables: isEcommerceDashboard,
      click: function (e) {
        e.preventDefault();
        setIsEcommerceDashboard(!isEcommerceDashboard);
        setIscurrentState("Ecommerce Dashboard");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "identitycreation",
          label: "Entity Creation",
          icon: "ri-id-card-line",
        //  link: "/site/identitycreation",
          parentId: "ecommerce-dashboard",
        },
        {
          id: "appdevelopment",
          label: "App Development",
          icon: "ri-code-s-slash-line",
         // link: "/site/appdevelopment",
          parentId: "ecommerce-dashboard",
        },
        {
          id: "paymentsystems",
          label: "Payment Solutions",
          icon: "ri-exchange-dollar-line",
        //  link: "/site/paymentsystems",
          parentId: "ecommerce-dashboard",
        },
      ],
    },
    {
      id: "ai-resources",
      label: "AI Resources",
      icon: "ri-cpu-line",
      link: "/#",
      stateVariables: isAIResources,
      click: function (e) {
        e.preventDefault();
        setIsAIResources(!isAIResources);
        setIscurrentState("AI Resources");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "ai-interactive-learning",
          label: "AI Interactive Learning",
          link: "/site/ai-interactive-learning",
          icon: "ri-brain-line",
          parentId: "ai-resources",
        },
        {
          id: "aimarketingsystem",
          label: "AI Marketing System",
          link: "/site/aimarketingsystem",
          icon: "ri-bar-chart-grouped-line",
          parentId: "ai-resources",
        },
        {
          id: "aisocialmarketing",
          label: "AI Short Form Videos",
        //  link: "/site/ai-short-form-videos",
          icon: "ri-share-line",
          parentId: "ai-resources",
        },
      ],
    },    

    {
      label: "YOUR LOGISTICS",
      isHeader: true,
    },    

    {
      id: "support",
      label: "Videos",
      icon: "ri-video-line",
      link: "/#",
      stateVariables: isSupport,
      click: function (e) {
        e.preventDefault();
        setIsSupport(!isSupport);
        setIscurrentState("Support");
        updateIconSidebar(e);
      },
      subItems: [

        {
          id: "videospecials",
          label: "Team Strategies",
          link: "/#",
          icon: "ri-star-line",
          isChildItem: true,
          parentId: "support",
          stateVariables: isVideospecials,
          click: function (e) {
            e.preventDefault();
            setIsVideospecials(!isVideospecials);
          },
          childItems: [
            {
              id: "specialspartners",
              label: "Partners",
              link: "/videolibrary/specials-partners",
              parentId: "videospecials",
            },
            {
              id: "specialsambassadors",
              label: "Ambassadors",
              link: "/videolibrary/specials-ambassadors",
              parentId: "videospecials",
            },
            {
              id: "specialshumanitarians",
              label: "Humanitarians",
              link: "/videolibrary/specials-humanitarians",
              parentId: "videospecials",
            },
          ],
        },

        {
          id: "videosystem",
          label: "Market Training",
          link: "/#",
          icon: "ri-computer-line",
          isChildItem: true,
          parentId: "support",
          stateVariables: isVideosystem,
          click: function (e) {
            e.preventDefault();
            setIsVideosystem(!isVideosystem);
          },
          childItems: [
            {
              id: "sizzle",
              label: "Sizzle",
              link:   "/videolibrary/system-sizzle",
              parentId: "videosystem",
            },
            {
              id: "presentation",
              label: "Presentation",
              link:   "/videolibrary/system-presentation",
              parentId: "videosystem",
            },
            {
              id: "strategy",
              label: "Strategy",
              link:   "/videolibrary/system-strategy",
              parentId: "videosystem",
            },
          ],
        },

        {
          id: "videosupport",
          label: "How To Tutorials",
          link: "/#",
          icon: "ri-customer-service-2-line",
          isChildItem: true,
          parentId: "support",
          stateVariables: isVideosupport,
          click: function (e) {
            e.preventDefault();
            setIsVideosupport(!isVideosupport);
          },
                  childItems: [
                    {
                      id: "signup",
                      label: "Sign-Up",
                      link:   "/videolibrary/tutorials-signup",
                      parentId: "videosupport",
                    },
                    {
                      id: "fundaccount",
                      label: "Fund Account",
                      link:   "/videolibrary/tutorials-fundaccount",
                      parentId: "videosupport",
                    },
                    {
                      id: "donate",
                      label: "Donate",
                      link:   "/videolibrary/tutorials-donate",
                      parentId: "videosupport",
                    },
                  ],
        }

      ],

    },
    {
      id: "dashboard2",
      label: "Dashboard",
      icon: "ri-dashboard-line",
      link: "/#",
      stateVariables: isDashboard2,
      click: function (e) {
        e.preventDefault();
        setIsDashboard2(!isDashboard2);
        setIscurrentState("Dashboard2");
        updateIconSidebar(e);
      },
      subItems: [

        {
          id: "history",
          label: "History",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isHistory,
          parentId: "dashboard2",
          
          click: function (e) {
            e.preventDefault();
            setIsHistory(!isHistory);
          },
          childItems: [
            {
              id: "donationhistory",
              label: "Donation History",
              link: "/orderhistory",
              parentId: "history",
              click: function (e) {
                e.preventDefault();
                setIsHistory(true);
                setIsDashboard2(true);
                setIscurrentState("Dashboard2");
                history("/donationhistory");
              },
            },
            {
              id: "rewardpointshistory",
              label: "Reward Points History",
              link: "/rewardpointshistory",
              parentId: "history",
              click: function (e) {
                e.preventDefault();
                setIsHistory(true);
                setIsDashboard2(true);
                setIscurrentState("Dashboard2");
                history("/rewardpointshistory");
              },
            },
            {
              id: "performancehistory",
              label: "Performance History",
              link: "/dashboard",
              parentId: "history",
              click: function (e) {
                e.preventDefault();
                setIsHistory(true);
                setIsDashboard2(true);
                setIscurrentState("Dashboard2");
                history("/dashboard");
              },
            },
          ]

          // childItems: [
          //   {
          //     id: "tourhistory",
          //     label: "Order History",
          //     link: "/orderhistory",
          //     parentId: "history",
          //     click: function (e) {
          //       e.preventDefault();
          //       setIsHistory(true); // 2nd level
          //       setIsDashboard2(true);;   // 1st level
          //       setIscurrentState("Dashboard2");
          //       history("/orderhistory");
          //     },
          //   },
          //   {
          //     id: "performancehistory",
          //     label: "Performance History",
          //     link: "/dashboard",
          //     parentId: "history",
          //   }
          // ]
        },
        {
          id: "downlinemembers",
          label: "Referrals",
          icon: "ri-group-line",
          parentId: "dashboard2",
          isChildItem: true,
          stateVariables: isSharingdonations,
          click: function (e) {
            e.preventDefault();
            setIsSharingdonations(!isSharingdonations);
            // setIscurrentState("Sharingdonations");
          },
          childItems: [
            { id: "viewreferrals", 
              label: "Direct Referrals",
              link: "/referrals",
              parentId: "downlinemembers",
              click: function (e) {
                e.preventDefault();
                setIsSharingdonations(true); // 2nd level
                setIsDashboard2(true);;   // 1st level
                setIscurrentState("Dashboard2");
                history("/referrals");
              },              
            },
            // {
            //     id: "tribe", 
            //     label: "Tribe Referral",
            //     link: "/tribe",
            //     parentId: "downlinemembers", 
            // },        
            {
              id: "sponsor-tree",
              label: "Sponsor Tree",
              link: "/sponsortree",
              parentId: "sitelinks"
            },
            {
              id: "tribe-tree",
              label: "Tribe Tree",
              link: "/tribe",
              parentId: "sitelinks"
            },
          ]
        }, 

        {
          id: "sitelinks",
          label: "Initiatives",
          icon: "ri-lightbulb-line",
          parentId: "dashboard2",
          isChildItem: true,
          stateVariables: isInitiativesOpen,
          click: function (e) {
            e.preventDefault();
            setIsInitiativesOpen(!isInitiativesOpen);
          },
          childItems: [
            {
              id: "project-links",
              label: "Project Links",
              link: "/sitelinks",
              parentId: "sitelinks"
            },


            ...(hasGenealogy ? [{
                id: "genealogy", 
                label: "Genealogy",
                link: "/genealogy",
                parentId: "downlinemembers", 
            }] : []), 
            ...(hasHoldingTanks ? [{
              id: "holding_tank",
              label: `Holding Tank${holdingTankCount > 0 ? ` (${holdingTankCount})` : ""}`,
              link: "/holdingtank",
              parentId: "admindashboard",
            }] : []),     


          ]
        },
            
      ],
    },
   ...(hasApplication ? [{
      id: "applications",
      label: "Applications",
      icon: "ri-apps-line",
      link: "/#",
      stateVariables: isApplications,
      click: function (e) {
        e.preventDefault();
        setIsApplications(!isApplications);
        setIscurrentState("Applications");
        updateIconSidebar(e);
      },
          subItems: [
            {
              id: "sharingstudio", 
              label: "SHARING.Studio", 
          //    link: "/site/sharing-studio",
            },
            {
              id: "sharinguniversity", 
              label: "SHARING.university", 
          //    link: "/site/sharing-university",
            },
            {
              id: "sharingfinancial", 
              label: "SHARING.financial", 
          //    link: "/site/sharing-financial",
            },
          ]
    }] : []), 

   ...(hasHyip ? [{
      id: "hyips",
      label: "Organizations",
      icon: "ri-apps-line",
      link: "/#",
      stateVariables: isHyips,
      click: function (e) {
        e.preventDefault();
        setIsHyips(!isHyips);
        setIscurrentState("Hyips");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "compliant-daos",
          label: "Partner DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isComplaintDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsComplaintDaos(!isComplaintDaos);
          },
          childItems: [
            {
              id: "dao-trading",
              label: "Trading DAO",
              link: "/site/dao-trading",
              icon: "ri-briefcase-4-line",
              parentId: "applications",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsComplaintDaos(true);
                setIscurrentState("Hyips");
                history("/site/dao-trading");
              },              
            },
            {
              id: "dao-arbitrage",
              label: "Arbitrage DAO",
              link: "/site/doa-arbitrage",
              icon: "ri-drop-line",
              parentId: "applications",
              link: (isPaidPartner || isAdmin || isRankAmbassador || isRankHumanitarian)  ? "/site/doa-arbitrage" : "",
              custom: (isPaidPartner || isAdmin || isRankAmbassador || isRankHumanitarian)  ? undefined : "red",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsComplaintDaos(true);
                setIscurrentState("Hyips");
                history("/site/doa-arbitrage");
              },                
            },              
          ]
        },  
        {
          id: "sovereign-daos",
          label: "Ambassador DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isSovereignDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsSovereignDaos(!isSovereignDaos);
          },
          childItems: [
            {
              id: "doa-staking",
              label: "Staking DAO",
              icon: "ri-drop-line",
              parentId: "applications",
              link: (isFreeAmbassador || isAdmin || isRankHumanitarian) ? "/site/doa-staking" : "",
              custom: (isFreeAmbassador || isAdmin || isRankHumanitarian) ? undefined : "red",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsSovereignDaos(true);
                setIscurrentState("Hyips");
                history("/site/doa-arbitrage");
              },                
            },   
          ]
        },          
        
        {
          id: "humanitarian-daos",
          label: "Humanitarian DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isHumanitarianDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsHumanitarianDaos(!isHumanitarianDaos);
          },
          childItems: [
            {
              id: "dao-hodling",
              label: "HODLing DAO",
              icon: "ri-drop-line",
              parentId: "applications",
              link: (isFreeHumanitarian || isAdmin ) ? "/site/dao-hodling" : "",
              custom:  (isFreeHumanitarian || isAdmin ) ? undefined : "red",              
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsHumanitarianDaos(true);
                setIscurrentState("Hyips");
              },                
            },             
           
          ]
        },  
      ],
    }] : []), 

    

    // {
    //   id: "support",
    //   label: "Support",
    //   icon: "ri-question-answer-line",
    //   link: "/#",
    //   stateVariables: isSupport,
    //   click: function (e) {
    //     e.preventDefault();
    //     setIsSupport(!isSupport);
    //     setIscurrentState("Support");
    //     updateIconSidebar(e);
    //   },
    //   subItems: [
    //     {
    //       id: "profilepage",
    //       label: "Profile Page",
    //       link: "/profile",
    //       icon: "ri-user-line",
    //       parentId: "support",
    //     },
    //     {
    //       id: "telegramgroup",
    //       label: "Telegram Group",
    //       link: "https://web.telegram.org/k/",
    //       icon: "ri-telegram-line",
    //       parentId: "support",
    //     },
    //     {
    //       id: "contactus",
    //       label: "Contact Us",
    //       link: "/contactus",
    //       icon: "ri-customer-service-2-line",
    //       parentId: "support",
    //     },
    //   ],
    // },

        //ADMIN
    ...(isAdmin ? [{
      id: "admindashboard",
      label: "Admin History",
      icon: "ri-article-line",
      link: "/#",
      stateVariables: isAdmindashboard,
      click: function (e) {
        e.preventDefault();
        setisAdmindashboard(!isAdmindashboard);
        setIscurrentState("Admin Dashboard");
        updateIconSidebar(e);
      },    
      
      subItems: [
        {
          id: "adminsharing",
          label: "SHARING",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isAdminSharing,
          parentId: "admindashboard",
          click: function (e) {
            e.preventDefault();
            setIsAdminSharing(!isAdminSharing);
            // setIscurrentState("Sharingdonations");
          },
          childItems: [
            { id: "adminsharingpurchases", 
              label: "SHARING Purchases", 
              link: "/managesharingpurchases",
              click: function (e) {
                e.preventDefault();
                setIsAdminSharing(true);
                setIsSharingdonations(true); // 2nd level
                setisAdmindashboard(true);   // 1st level
                setIscurrentState("Admin Dashboard");
                history("/managesharingpurchases");
              }, },
            { id: "adminsharingglobal", 
              label: "SHARING Global Matrix", 
              link: "/globalsharingmatrix"},
            { id: "adminsharingpayout", 
              label: "SHARING Payout", 
              link: "/managewithdrawals"},
          ]
        },
        {
          id: "datatracking",
          label: "Data Tracking",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isDataTracking,
          parentId: "admindashboard",
          click: function (e) {
            e.preventDefault();
            setIsDataTracking(!isDataTracking);
            // setIscurrentState("Sharingdonations");
          },
          childItems: [
            {
              id: "statistics",
              label: "Statistics",
              link: "/statistics",
              parentId: "management",
            },            
            {
              id: "alltransactions",
              label: "All Transactions",
              link: "/alltransactions",
            },            
            {
              id: "activitylogs",
              label: "Activity Logs",
              link: "/activitylogs",
            },
          ]
        },   
        {
          id: "management",
          label: "Management",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isSharingdonations,
          parentId: "admindashboard",
          click: function (e) {
            e.preventDefault();
            setIsSharingdonations(!isSharingdonations);
            // setIscurrentState("Sharingdonations");
          },
          childItems: [
            {
              id: "manage_users",
              label: "Manage Users",
              link: "/manageusers",
              parentId: "management",
              click: function (e) {
                e.preventDefault();
                setIsSharingdonations(true); // 2nd level
                setisAdmindashboard(true);   // 1st level
                setIscurrentState("Admin Dashboard");
                history("/manageusers");
              },
            },
            {
              id: "manage_deposit",
              label: "Manage Deposits",
              link: "/managedeposits",
              parentId: "management",
            },     
            // {
            //   id: "manage_withdrawal",
            //   label: "Manage Withdrawals",
            //   link: "/managewithdrawals",
            //   parentId: "management",
            // },                                  
            {
              id: "manage_sites",
              label: "Manage Sites",
              link: "/managesites",
              parentId: "management",
            },
            {
              id: "manage_categories",
              label: "Manage Site Categories",
              link: "/managecategories",
              parentId: "management",
            }            
          ]
        },   
        {
          id: "compliant-daos",
          label: "Partner DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isComplaintDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsComplaintDaos(!isComplaintDaos);
          },
          childItems: [
            {
              id: "dao-trading",
              label: "Trading DAO",
              link: "/site/dao-trading",
              icon: "ri-briefcase-4-line",
              parentId: "applications",
              click: function (e) {
                e.preventDefault();
                setIsAdminSharing(true);
                setIsSharingdonations(true); // 2nd level
                setisAdmindashboard(true);   // 1st level
                setIscurrentState("Admin Dashboard");
                history("/site/dao-trading");
              },              
            },
            {
              id: "dao-arbitrage",
              label: "Arbitrage DAO",
              link: "/site/doa-arbitrage",
              icon: "ri-drop-line",
              parentId: "applications",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsSovereignDaos(true);
                setIscurrentState("Hyips");
                history("/site/doa-arbitrage");
              },                
            },              
          ]
        },  
        {
          id: "sovereign-daos",
          label: "Ambassador DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isSovereignDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsSovereignDaos(!isSovereignDaos);
          },
          childItems: [
            {
              id: "doa-staking",
              label: "Staking DAO",
              link: "/site/doa-staking",
              icon: "ri-drop-line",
              parentId: "applications",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsSovereignDaos(true);
                setIscurrentState("Hyips");
                history("/site/doa-arbitrage");
              },                
            },   
           
          ]
        },          
        {
          id: "humanitarian-daos",
          label: "Humanitarian DAOs",
          icon: "ri-wallet-3-line",
          isChildItem: true,
          stateVariables: isHumanitarianDaos,
          parentId: "projects",
          click: function (e) {
            e.preventDefault();
            setIsHumanitarianDaos(!isHumanitarianDaos);
          },
          childItems: [
            {
              id: "dao-hodling",
              label: "HODLing DAO",
              link: "/site/dao-hodling",
              icon: "ri-drop-line",
              parentId: "applications",
              click: function (e) {
                e.preventDefault();
                setIsHyips(true);
                setIsHumanitarianDaos(true);
                setIscurrentState("Hyips");
              },                
            },  
          ]
        },  
        {
        id: "p2ptrading",
        label: "P2P Trading (inprogress)",
        link: "/p2ptrading",
        parentId: "management",
        }                         
      ],      

      
    }] : []),      

  ];



  return <>{menuItems}</>;
};

export default Navdata;
