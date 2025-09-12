import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { useNavigate, useParams } from "react-router-dom";
import BreadCrumb from '../../Components/Common/BreadCrumb';
import axios from 'axios';
import { APIClient } from "../../helpers/api_helper";

const VideoLibrary = () => {
  const navigate = useNavigate();
  const { videoname } = useParams();  
  const api = new APIClient();  
  document.title = videoname === "system-presentation" ? "Video Presentations" : `Video Library - ${videoname}`;


  const [sampleVideos, setSampleVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const specialMap = {
    "specials-partners": {
      title: "Special Videos - Partners",
      url: "https://ibopro.com/partners/",
    },
    "specials-ambassadors": {
      title: "Special Videos - Ambassadors",
      url: "https://ibopro.com/ambassadors/",
    },
    "specials-humanitarians": {
      title: "Special Videos - Humanitarians",
      url: "https://ibopro.com/humanitarians/",
    },
  };

  const special = videoname?.startsWith("specials-") ? specialMap[videoname] : null;

  useEffect(() => {
    if (special) {
      setLoading(false);
      return;
    }

    if (!sessionStorage.getItem("videoLibraryReloaded")) {
      sessionStorage.setItem("videoLibraryReloaded", "true");
      window.location.reload();
      return;
    }
    sessionStorage.removeItem("videoLibraryReloaded");

    const fetchVideos = async () => {
      debugger; 
      try {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const data = {
          uid: uid,
          category: videoname
        };
        const response = await api.post(`/getvideos`, data);
        setSampleVideos(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch video data');
        setLoading(false);
      }
    };

    fetchVideos();
  }, [videoname]);

  if (loading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const isYouTubeLink = (url) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

const videoTitleMap = {
  "system-presentation": "Video Presentations",
  "tutorials-fundaccount": "Tutorials - Fund Account",
  "tutorials-how-to-deposit": "Tutorials - How to Deposit",
  // Add more as needed
};

const formattedTitle = videoTitleMap[videoname] || videoname.replaceAll("-", " ");

  return (
    <React.Fragment>
      <div className="page-content" style={{ position: 'relative' }}>
        <Container fluid>
          <BreadCrumb
            title={
              special
                ? special.title
                : videoname === "system-presentation"
                ? "Video Presentations"
                : videoname === "tutorials-signup"
                ? "Tutorials - SignUp"
                : videoname === "tutorials-fundaccount"
                ? "Tutorials - Fund Account"
                : "System Videos"
            }
            pageTitle="Dashboard"
            url="/dashboard"
          />

          {!special && (
            <Row className="justify-content-center mt-4">
              <Col lg={12}>
                <div className="text-center">
                  <h4 className="fw-semibold fs-23 text-capitalize">
                    {formattedTitle}
                  </h4>
                </div>
              </Col>
            </Row>
          )}

          

          {special ? (
            <div style={{ margin: 0, padding: 0, height: "100vh", overflow: "auto" }}>
              <iframe
                title={special.title}
                src={special.url}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  margin: 0,
                  padding: 0,
                  overflow: "auto", // not always respected on iframe, but good practice
                  display: "block"
                }}
                allowFullScreen
              ></iframe>
            </div>
          ) : Array.isArray(sampleVideos) && sampleVideos.length > 0 ? (
            sampleVideos.length === 2 ? (
              <Row className="justify-content-center">
                {[0, 1].map((index) => (
                  <Col xl={6} lg={8} md={10} sm={12} key={index}>
                    <div className="card">
                      <div className="card-body text-center">
                        <video
                          controls
                          width="100%"
                          height="200"
                          style={{ objectFit: "cover", borderRadius: "5px", maxWidth: "600px" }}
                          poster={sampleVideos[index]?.poster}
                          src={sampleVideos[index]?.source}
                        >
                          <source src={sampleVideos[index]?.videoSrc} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <h5 className="card-title mt-2">{sampleVideos[index]?.title}</h5>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Row className="justify-content-center">
                {sampleVideos.map((video) => (
                  <Col
                    xl={sampleVideos.length === 1 ? 6 : 4}
                    lg={sampleVideos.length === 1 ? 8 : 6}
                    md={sampleVideos.length === 1 ? 10 : 6}
                    sm={12}
                    className={sampleVideos.length === 1 ? "mx-auto" : "mb-4"}
                    key={video.id}
                  >
                    <div className="card">
                      <div className="card-body text-center">
                        {isYouTubeLink(video.source) ? (
                          <iframe
                            width="100%"
                            height={sampleVideos.length === 1 ? "300" : "200"}
                            style={{ objectFit: "cover", borderRadius: "5px", maxWidth: "600px" }}
                            src={`https://www.youtube.com/embed/${new URL(video.source).searchParams.get("v")}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : video.source.includes("vimeo.com") ? (
                          <iframe
                            width="100%"
                            height={sampleVideos.length === 1 ? "300" : "200"}
                            style={{ objectFit: "cover", borderRadius: "5px", maxWidth: "600px" }}
                            src={`https://player.vimeo.com/video/${video.source.split("/").pop()}`}
                            title={video.title}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : video.source.includes("meetn.com") ? (
                          <iframe
                            width="100%"
                            height={sampleVideos.length === 1 ? "300" : "200"}
                            style={{ objectFit: "cover", borderRadius: "5px", maxWidth: "600px" }}
                            src="https://meetn.com/Event?ID=d9adb30990"
                            title="Meetn Event"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video
                            controls
                            width="100%"
                            height={sampleVideos.length === 1 ? "300" : "200"}
                            style={{ objectFit: "cover", borderRadius: "5px", maxWidth: "600px" }}
                            poster={video.poster}
                            src={video.source}
                          >
                            <source src={video.source} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <h5 className="card-title mt-2">{video.title}</h5>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )
          ) : (
            <div className="text-center py-5">
              <h5>No videos available</h5>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default VideoLibrary;
