import React, { useEffect, useState } from 'react';
import {  Row, Col,  Modal, ModalHeader, ModalBody, ModalFooter, Label, Button} from "reactstrap";
import PropTypes from "prop-types";
import withRouter from '../Components/Common/withRouter';

//import Components
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import RightSidebar from '../Components/Common/RightSidebar';

//import actions
import {
    changeLayout,
    changeSidebarTheme,
    changeLayoutMode,
    changeLayoutWidth,
    changeLayoutPosition,
    changeTopbarTheme,
    changeLeftsidebarSizeType,
    changeLeftsidebarViewType,
    changeBackgroundImageType,
    changeSidebarVisibility
} from "../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';
import { useNavigate, useLocation } from 'react-router-dom';
import { APIClient } from "../helpers/api_helper";

const Layout = (props) => {
    const api = new APIClient();    
    const [headerClass, setHeaderClass] = useState("");
    const dispatch = useDispatch();

    const [announcementbg, setannouncementbg] = useState(`${process.env.PUBLIC_URL}/images/announcementbg2.png`);
    const [announcementlogo, setannouncementlogo] = useState(`${process.env.PUBLIC_URL}/images/announcement2.png`);
    const [AnnouncementModal, setAnnouncementModal] = useState(false);
    const [AnnouncementContent, setAnnouncementContent] = useState("");
    const [AnnouncementPosted, setAnnouncementPosted] = useState(false);
    const [AnnouncementPreviousID, setAnnouncementPreviousID] = useState(0);
    const [AnnouncementShowSideImage, setAnnouncementShowSideImage] = useState(1);
    const location = useLocation();
    const navigate = useNavigate();

    const selectLayoutState = (state) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            layoutType: layout.layoutType,
            leftSidebarType: layout.leftSidebarType,
            layoutModeType: layout.layoutModeType,
            layoutWidthType: layout.layoutWidthType,
            layoutPositionType: layout.layoutPositionType,
            topbarThemeType: layout.topbarThemeType,
            leftsidbarSizeType: layout.leftsidbarSizeType,
            leftSidebarViewType: layout.leftSidebarViewType,
            leftSidebarImageType: layout.leftSidebarImageType,
            backgroundImageType: layout.backgroundImageType,
            preloader: layout.preloader,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
        })
    );
    // Inside your component
    const {
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        backgroundImageType,
        leftSidebarImageType,
        preloader,
        sidebarVisibilitytype
    } = useSelector(selectLayoutProperties);

    const handleModalSubmit = async () => {
        toggleAnnouncementModal();
    };
    const handleViewPreviousAnnouncements = async () => {
        fetchAnnouncement(); 
    };
     

    /*
    layout settings
    */
    useEffect(() => {
        if (
            layoutType ||
            leftSidebarType ||
            layoutModeType ||
            layoutWidthType ||
            layoutPositionType ||
            topbarThemeType ||
            leftsidbarSizeType ||
            leftSidebarViewType ||
            backgroundImageType ||
            sidebarVisibilitytype
        ) {
            window.dispatchEvent(new Event('resize'));
            dispatch(changeLeftsidebarViewType(leftSidebarViewType));
            dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
            dispatch(changeSidebarTheme(leftSidebarType));
            dispatch(changeLayoutMode(layoutModeType));
            dispatch(changeLayoutWidth(layoutWidthType));
            dispatch(changeLayoutPosition(layoutPositionType));
            dispatch(changeTopbarTheme(topbarThemeType));
            dispatch(changeLayout(layoutType));
            dispatch(changeBackgroundImageType(backgroundImageType));
            dispatch(changeSidebarVisibility(sidebarVisibilitytype));
        }
    }, [layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        backgroundImageType,
        sidebarVisibilitytype,
        dispatch]);
    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (value) => {
        if (changeLayoutMode) {
            dispatch(changeLayoutMode(value));
        }
    };

    // class add remove in header 
    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
    });

    useEffect(() => {
       toggleAnnouncementModal(); 

    }, []);

    const toggleAnnouncementModal = () => {
   return;
        // Exit if the current URL is not /dashboard
        if (location.pathname !== '/home') {
            return;
        }

        setAnnouncementPreviousID(0);
        if (!AnnouncementModal) {
            fetchAnnouncement();
            setAnnouncementModal(!AnnouncementModal);  
        } else {
            setAnnouncementModal(!AnnouncementModal);  
        }

    }

    const fetchAnnouncement = async () => {

        const furl = sessionStorage.getItem("furl");
        if (furl !== null) {
            if (furl === "gas") {
            navigate('/processpayment', { state: { planId: 1 } });
            } else if (furl === "car") {
            navigate('/processpayment', { state: { planId: 2} });
            } else if (furl === "travel") {
            navigate('/processpayment', { state: { planId: 3} });
            } else if (furl === "groc") {
            navigate('/processpayment', { state: { planId: 13} });
            }
            sessionStorage.removeItem("furl");
            return
        }

        try {
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;  
          const username = obj.username    
          const url = "/getannouncement";
          const data = { id:AnnouncementPreviousID, uid:uid};
          const response = await api.post(url, data);
          if (response.status==='success') {
            setAnnouncementContent(response.data.content.replace(/{{USERNAME}}/g, username));
            setAnnouncementPosted(response.data.posted);
            setAnnouncementPreviousID(response.data.previousid);  
            setAnnouncementShowSideImage(response.data.showsideimage);  
          }
        } catch (error) {
            debugger; 
          console.log("Error Getting Announcement!");
        }
    };



    function scrollNavigation() {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    }

    useEffect(() => {
        if (sidebarVisibilitytype === 'show' || layoutType === "vertical" || layoutType === "twocolumn") {
            document && document.querySelector(".hamburger-icon")?.classList.remove('open');
        } else {
            document && document.querySelector(".hamburger-icon")?.classList.add('open');
        }
    }, [sidebarVisibilitytype, layoutType]);

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header
                    headerClass={headerClass}
                    layoutModeType={layoutModeType}
                    onChangeLayoutMode={onChangeLayoutMode} />
                    toggleAnnouncementModal={toggleAnnouncementModal}                    
                <Sidebar
                    layoutType={layoutType}
                />
                <div className="main-content">{props.children}
                    {/* <Footer /> */}
                </div>
            </div>

            {AnnouncementContent !== '' && (

<Modal isOpen={AnnouncementModal} toggle={toggleAnnouncementModal} centered size='lg'>
    <div className="modal-header" style={{ position: 'relative' }}>
        <Button
            color="link"
            className="close"
            onClick={toggleAnnouncementModal}
            style={{
                fontSize: '1.5rem',
                color: '#f7b84b',   // Custom color
                padding: '0.5rem',
                position: 'absolute',
                right: '10px', // Ensures it's on the right side
                top: '-10px',   // Adjusts the positioning if needed
                zIndex: 9999,  // Ensures it stays at the topmost layer
            }}
        >
            &times;
        </Button>
    </div>

    {AnnouncementShowSideImage === '1' ? (
        <Row className="g-0">
            <Col lg={7}>
                <div className="modal-body modal-announcement hide">
                    <img src={announcementlogo} alt="" style={{ height: "75px" }} />
                    <div className="announcement-content">
                        <h6 className="text-muted mb-4">Posted Date: {AnnouncementPosted}</h6>
                        <div dangerouslySetInnerHTML={{ __html: AnnouncementContent }}></div>
                    </div>

                    <br />
                    <div className="d-flex justify-content-center">
                        <Button
                            color="link"
                            className="btn btn-outline-warning waves-effect waves-light"
                            onClick={handleModalSubmit}
                        >
                            Close
                        </Button>{' '}
                        <Button
                            color="link"
                            className="text-secondary"
                            onClick={handleViewPreviousAnnouncements}
                            disabled={!AnnouncementPreviousID}
                        >
                            View Previous
                        </Button>
                    </div>
                    <br />
                </div>
            </Col>
            <Col lg={5} className="announcement-pic">
                <div className="subscribe-modals-cover h-100">
                    <img
                        src={announcementbg}
                        alt=""
                        className="h-100 w-100 object-fit-cover"
                        style={{
                            clipPath: "polygon(100% 0%, 100% 100%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)"
                        }}
                    />
                </div>
            </Col>
        </Row>
    ) : (
        <Row className="g-0">
            <Col lg={12}>
                <div className="modal-body modal-announcement">
                    <img className="hide" src={announcementlogo} alt="" style={{ height: "75px" }} />
                    <div className="announcement-content">
                        <h6 className="text-muted mb-4 hide">Posted Date: {AnnouncementPosted}</h6>
                        <div dangerouslySetInnerHTML={{ __html: AnnouncementContent }}></div>
                    </div>

                    <br />
                    <div className="d-flex justify-content-center">
                        <Button
                            color="link"
                            className="btn btn-outline-warning waves-effect waves-light"
                            onClick={handleModalSubmit}
                        >
                            Close
                        </Button>
                    </div>
                    <br />
                </div>
            </Col>
        </Row>
    )}
</Modal>




            )}            

            <RightSidebar />
        </React.Fragment>

    );
};

Layout.propTypes = {
    children: PropTypes.object,
};

export default withRouter(Layout);


