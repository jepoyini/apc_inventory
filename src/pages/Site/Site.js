import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, Col, Container, CardHeader,
  Row, ListGroup, ListGroupItem, Modal, ModalBody
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import SHA256 from 'crypto-js/sha256';
import maintenanceImg from '../../assets/images/coming-soon-img.png';

const SiteForm = () => {
  const navigate = useNavigate();
  const { sitename } = useParams();
  document.title = sitename;
  const [pageloading, setPageLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');
  const [iframeSrc2, setIframeSrc2] = useState('');
  const [iframeTitle, setIframeTitle] = useState('');
  const [modal_successMessage, setModalSuccessMessage] = useState(false);
  const sharedSecret = 'bG9K2g7hT5xRm9pY8sVw4qZ1eA2tXcMb0rNfUwG6dPiKs3QvJh';

  const api = new APIClient();

  const getIframeSrc = () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.username || 'guest';
    const secret = SHA256(username + sharedSecret).toString();

    switch (sitename) {
      case 'rewardpoints':
        return "https://prosperclub.com/?sharing=" + username;
      case 'stake-lgns':
        return "https://www.geckoterminal.com/polygon_pos/pools/0x882df4b0fb50a229c3b4124eb18c759911485bfb?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m";
      case 'leveraging-gold':
        return "https://www.geckoterminal.com/eth/pools/0xa91f80380d9cc9c86eb98d2965a0ded9e2000791?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m";
      case 'hodl-btc':
        return "https://widget.coinlib.io/widget?type=chart&theme=light&coin_id=859&pref_coin_id=1505";
      case 'balanced-shakes':
        return "https://ibopro.com/protein-shake/?sharing=" + username;
      case 'luxury-money':
        return "https://ibopro.com/luxury-money/?sharing=" + username;
      case 'decentralized-banking':
        return "https://ibopro.com/decentralized-banking/?sharing=" + username;
      case 'decentralized-internet':
        return "https://ibopro.com/decentralized-internet/?sharing=" + username;        
      case 'farm-wfi':
        return "https://ibopro.com/decentralized-banking/?sharing=" + username;
      case 'hyip-14-day':
        return "https://ibopro.com/decentralized-trading/?sharing=" + username;
      case 'hyip-6-12-day': 
        return "https://ibopro.com/stake-lgns/?sharing=" + username;
      case 'hodl-xnt':
        return "https://ibopro.com/decentralized-internet/?sharing=" + username;
      case 'earthwater':
        return "https://ibopro.com/earth-water/?sharing=" + username;
      case 'decentralized-wellness':
          return "https://ibopro.com/decentralized-wellness/?sharing=" + username;
      case 'plastics-reduction':
          return "https://ibopro.com/decentralized-oil/?sharing=" + username;
      case 'dao-trading':
          return "https://ibopro.com/trading-dao/?sharing=" + username;
      case 'doa-staking':
          return "https://ibopro.com/stake-lgns/?sharing=" + username;
      case 'dao-hodling':
          return "https://ibopro.com/decentralized-trading/?sharing=" + username;    
      case 'aimarketingsystem':
          return "https://ibopro.com/marketing-ai/?sharing=" + username;    
      case 'doa-arbitrage':
          return "https://ibopro.com/arbitrage-dao/?sharing=" + username;    
      case 'ai-interactive-learning':
          setIframeTitle('AI Interactive Learning');
          return "https://mypxch.com/rec/auth06871bacd71a0a83edb950d47---jng3np-2025-08-04T19-36-13Z "
      default:
        return '';
    }
  };

  const getIframeSrc2 = () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.username || 'guest';
    const secret = SHA256(username + sharedSecret).toString();

    switch (sitename) {
      case 'stake-lgns':
        return "https://ibopro.com/stake-LGNS/?sharing=" + username;
      case 'ai-interactive-learning':
        return "https://ibopro.com/ai-interactive-learning/?sharing=" + username;
      default:
        return '';
    }
  };

  // Set iframe source only once
  useEffect(() => {

    const src = getIframeSrc();
    setIframeSrc(src);

    const src2 = getIframeSrc2();
    setIframeSrc2(src2);

    setPageLoading(true);
    window.scrollTo(0, 0);
  }, [sitename]);

  useEffect(() => {
    if (!modal_successMessage) {
      document.body.style.overflow = 'auto';
    }
  }, [modal_successMessage]);

  const renderVideo = () => {
    const videoData = {
      'travelbenefits': {
        label: 'Travel Benefits',
        video: 'https://ibopro.com/dashboard/videos/nik_business_overview.mp4',
        poster: 'https://ibopro.com/dashboard/images/nik_cover.jpg'
      },
      'balanced-shakes': {
        label: 'Balanced Shakes',
        video: 'https://ibopro.com/dashboard/videos/teamunity_7_6_25.mp4',
        poster: 'https://ibopro.com/dashboard/images/teamunity_7_6_25_cover.jpg'
      },
      'hyip-14-day': {
        label: 'HYIP 1.4% A Day',
        video: 'https://ibopro.com/dashboard/videos/digital_bot.mp4',
        poster: 'https://ibopro.com/dashboard/images/digital_bot.jpg'
      },
      'luxury-money': {
        label: 'Luxury Money',
        video: 'https://ibopro.com/dashboard/videos/BYLD_presentation.mp4',
        poster: 'https://ibopro.com/dashboard/images/byld_presentation.jpg' 
      },
      'stake-lgns': {
        label: 'Stake LGNS',
        video: 'https://ibopro.com/dashboard/videos/stake_lgns.mp4',
        poster: 'https://ibopro.com/dashboard/images/stake_lgns.jpg' 
      },
      'earthwater'  : {
        label: 'Earth Water',
        video: 'https://ibopro.com/dashboard/videos/water_purification_system_haiti.mp4',
        poster: 'https://ibopro.com/dashboard/images/water_purification_system_haiti.jpg' 
      }, 
      'farm-wfi'  : {
        label: 'Farm WFI',
        video:  'https://ibopro.com/dashboard/videos/wefi_global.mp4',
        poster: 'https://ibopro.com/dashboard/images/wefi_global.jpg' 
      },
      'decentralized-banking'  : {
        label: 'Decentralized Bank',
        video:  'https://ibopro.com/dashboard/videos/wefi_global.mp4',
        poster: 'https://ibopro.com/dashboard/images/wefi_global.jpg' 
      },      
      'hodl-xnt'  : {
        label: 'HODL XNT',
        video:  'https://ibopro.com/dashboard/videos/xetadatamining.mp4',
        poster: 'https://ibopro.com/dashboard/images/xetadatamining.jpg' 
      },
      'plastics-reduction'  : {
        label: 'Decentalized Oil',
        video:  'https://ibopro.com/dashboard/videos/thisiswhatwedo.mp4',
        poster: 'https://ibopro.com/dashboard/images/thisiswhatwedo.png' 
      },
      'decentralized-wellness'  : {
        label: 'Decentalized Clinic',
        video:  'https://ibopro.com/dashboard/videos/genetic_lifespan_overview.mp4',
        poster: 'https://ibopro.com/dashboard/images/genetic_lifespan_overview.jpg' 
      },
      'hyip-6-12-day'  : {
        label: 'Decentralized Staking',
        video:  'https://ibopro.com/dashboard/videos/decentralized-stakings.mp4',
        poster: 'https://ibopro.com/dashboard/images/decentralized-stakings.jpg' 
      },     
      'decentralized-internet'  : {
        label: 'Decentralized City',
        video:  'https://ibopro.com/dashboard/videos/xetadatamining.mp4',
        poster: 'https://ibopro.com/dashboard/images/xetadatamining.jpg' 
      },      
      'dao-trading'  : {
        label: 'Trading DAO',
        video:  'https://ibopro.com/dashboard/videos/thejenna.mp4',
        poster: 'https://ibopro.com/dashboard/images/thejenna.jpg' 
      },      
      'doa-staking': {
        label: 'Staking DAO',
        video: 'https://ibopro.com/dashboard/videos/stake_lgns.mp4',
        poster: 'https://ibopro.com/dashboard/images/stake_lgns.jpg' 
      },
      'dao-hodling': {
        label: 'HODLING DAO',
        video: 'https://ibopro.com/dashboard/videos/digitalbot.mp4',
        poster: 'https://ibopro.com/dashboard/images/digitalbot.jpg' 
      },   
      'aimarketingsystem': {
        label: 'AI Marketing System',
        video: 'https://ibopro.com/dashboard/videos/lev_ai.mp4',
        poster: 'https://ibopro.com/dashboard/images/lev_ai.jpg' 
      },   
      'doa-arbitrage': {
        label: 'Arbitrage DAO',
        video: 'https://ibopro.com/dashboard/videos/arbitrage.mp4',
        poster: 'https://ibopro.com/dashboard/images/arbitrage.jpg' 
      },  
    };

    const videoInfo = videoData[sitename];
    if (!videoInfo) return null;

    return (
      <>

        <p style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
          {videoInfo.label}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >

          <video
            key={sitename}
            controls
            onLoadedData={() => setPageLoading(false)}
            poster={videoInfo.poster}
            style={{
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              ...(sitename === 'dao-hodling'
                ? { width: 'auto', height: '600px' } // portrait style
                : { width: '100%', height: 'auto' }) // default style
            }}
          >
            <source src={videoInfo.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>        
      </>
    );
  };

  return (
    <React.Fragment>
      {pageloading && (
        <Container>
          <Row>
            <div id="status">
              <div className="spinner-border text-primary avatar-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Row>
        </Container>
      )}

      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={sitename} pageTitle="Dashboard" url="/dashboard/home" />
          <Row>
            <Col md={12}>
              {(sitename === 'travelbenefits' || 
                sitename === 'balanced-shakes' || 
                sitename === 'trade-usdt'   ) ? (
                <div style={{ display: pageloading ? 'none' : 'block' }}>
                  {/* VIDEO SECTION */}
                  {renderVideo()}

                  {/* IFRAME ONLY FOR balanced-shakes */}
                  {sitename === 'balanced-shakes' && iframeSrc && (
                    <iframe
                      src={iframeSrc}
                      title="Protein Shake"
                      onLoad={() => setPageLoading(false)}
                      style={{
                        width: '100%',
                        height: '80vh',
                        border: 'none',
                        display: pageloading ? 'none' : 'block',
                        marginTop: '30px',
                      }}
                    />
                  )}
                </div>
              ) : iframeSrc ? (
                <>
                  {renderVideo()}
                  <br></br>
                  {/* ADDITIOANAL IFRAME ONLY FOR stake-lgns */}
                  {sitename === 'stake-lgns' && iframeSrc2 && (
                    <iframe
                      src={iframeSrc2}
                      title="STAKE-LGNS"
                      onLoad={() => setPageLoading(false)}
                      style={{
                        width: '100%',
                        height: '80vh',
                        border: 'none',
                        display: pageloading ? 'none' : 'block',
                        marginTop: '30px',
                      }}
                    />
                    )}


                    {iframeTitle !== '' && (
                      <p
                        style={{
                          fontSize: '22px',
                          fontWeight: 'bold',
                          marginBottom: '15px',
                          textAlign: 'center',
                        }}
                      >
                        {iframeTitle}
                      </p>
                    )}

                  <iframe
                    src={iframeSrc}
                    title="Site Frame"
                    onLoad={() => setPageLoading(false)}
                    style={{
                      width: '100%',
                      height: '80vh',
                      border: 'none',
                      display: pageloading ? 'none' : 'block',
                    }}
                  />

                  {( sitename === 'ai-interactive-learning') && iframeSrc2 && (
                    <iframe
                      src={iframeSrc2}
                      title="ai-interactive-learning"
                      onLoad={() => setPageLoading(false)}
                      style={{
                        width: '100%',
                        height: '80vh',
                        border: 'none',
                        display: pageloading ? 'none' : 'block',
                        marginTop: '30px',
                      }}
                    />
                    )}

                </>
              ) : (
                <Row>
                  <Col lg={12}>
                    <div className="text-center pt-4">
                      <div className="mb-5 text-white-50">
                        <h1 className="display-5">This page is still under construction.</h1>
                        <p className="fs-14">Please check back later</p>
                      </div>
                      <Row className="justify-content-center mb-5">
                        <Col xl={4} lg={8}>
                          <div>
                            <img src={maintenanceImg} alt="" className="img-fluid" />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SiteForm;

