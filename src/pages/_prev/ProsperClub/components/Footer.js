import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-light border-top py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-4 text-center text-md-start mb-4 mb-md-0">
            <img src="images/prosperclub/sharing_prosper-club-logo.png" alt="Sharing" className="img-fluid" style={{ height: "40px" }} />
          </div>
          
          <div className="col-12 col-md-4 text-center mb-4 mb-md-0">
            <p className="mb-0 text-secondary small">2590 East Newgate Blvd.</p>
            <p className="mb-0 text-secondary small">Suite 9211</p>
            <p className="mb-0 text-secondary small">Las Vegas, Nevada 89121</p>
          </div>
          
          <div className="col-12 col-md-4 text-center text-md-end">
            <p className="mb-0 text-secondary small">Hours: 10:00-17:00 PST</p>
            <p className="mb-0 text-secondary small">Help: Sun-Sat PST</p>
            <div className="d-flex justify-content-center justify-content-md-end mt-3">
              <a href="#" className="text-dark mx-2 hover-opacity">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-dark mx-2 hover-opacity">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-dark mx-2 hover-opacity">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-dark mx-2 hover-opacity">
                <Youtube size={18} />
              </a>
              <a href="#" className="text-dark mx-2 hover-opacity">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;