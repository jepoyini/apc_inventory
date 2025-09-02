import React from 'react';

const ConsultationSection = () => {
  return (
    <div className="position-relative prosper-font-color" style={{ backgroundColor: '#f0e8d0' }}>
      <div className="position-absolute top-0 end-0 bottom-0 start-0 opacity-25 bg-image" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1526724663981-755d3276bc7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        
      <div className="position-relative container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-4">
              <h2 className="text-uppercase fw-semibold mb-3">SHARING Partner Free Consultation</h2>
              <p className="">
                We provide people with a trillion dollar decentralized anonymous international finance platform, a trillion dollar life saving healthcare platform, a trillion dollar all encompassing community resource platform to help those in need, a trillion dollar trust driven sovereign asset protection platform and a well organized trillion dollar humanitarian training platform complete with privacy preserving passive protocols.
              </p>
            </div>
            
            <form>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control bg-white bg-opacity-75" id="fullName" placeholder="Full Name" />
                    <label htmlFor="fullName">Full Name</label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input type="email" className="form-control bg-white bg-opacity-75" id="emailAddress" placeholder="Email Address" />
                    <label htmlFor="emailAddress">Email Address</label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input type="tel" className="form-control bg-white bg-opacity-75" id="phone" placeholder="Phone" />
                    <label htmlFor="phone">Phone</label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control bg-white bg-opacity-75" id="referredBy" placeholder="Referred By" />
                    <label htmlFor="referredBy">Referred By</label>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="form-floating mb-3">
                    <textarea 
                      className="form-control bg-white bg-opacity-75" 
                      id="message" 
                      placeholder="Message"
                      style={{ height: '120px' }}
                    ></textarea>
                    <label htmlFor="message">Message</label>
                  </div>
                </div>
                
                <div className="col-12 text-end">
                  <button className="btn btn-warning px-4 py-2 fw-medium" style={{ backgroundColor: '#d4af37', borderColor: '#d4af37' }}>
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSection;