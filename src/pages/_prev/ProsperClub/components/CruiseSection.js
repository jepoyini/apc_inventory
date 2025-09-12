import React from 'react';

const CruiseSection = () => {
  return (
    <div className="cruise-section prosper-font-color">
      <div className="text-center mb-4">
        <h1 className="display-6 fw-semibold mb-3 ">Prosper Club Cruise</h1>
      </div>
      
      <div className="mb-4">
        <img 
          src="https://images.unsplash.com/photo-1548574505-5e239809ee19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Mediterranean Cruise Ship" 
          className="img-fluid rounded shadow"
        />
      </div>
      
      <div className="text-center mb-5">
        <h2 className="h3 text-info mb-2">Mediterranean Cruise</h2>
        <div className="h4 text-info fw-light">
          September 21 - 28, 2025
        </div>
      </div>
      
      <div className="row row-cols-2 g-3 mb-3">
        <div className="col">
          <div className="card h-100 border-0">
            <img 
              src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Italy" 
              className="card-img-top rounded"
              style={{ height: "200px", objectFit: "cover" }}
            />
            <div className="card-body text-center p-2">
              <h5 className="card-title mb-0">Italy</h5>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 border-0">
            <img 
              src="https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Santorini" 
              className="card-img-top rounded"
              style={{ height: "200px", objectFit: "cover" }}
            />
            <div className="card-body text-center p-2">
              <h5 className="card-title mb-0">Santorini</h5>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 border-0">
            <img 
              src="https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Greece" 
              className="card-img-top rounded"
              style={{ height: "200px", objectFit: "cover" }}
            />
            <div className="card-body text-center p-2">
              <h5 className="card-title mb-0">Greece</h5>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100 border-0">
            <img 
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Turkey" 
              className="card-img-top rounded"
              style={{ height: "200px", objectFit: "cover" }}
            />
            <div className="card-body text-center p-2">
              <h5 className="card-title mb-0">Turkey</h5>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-3">
        <div className="col-6">
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
            alt="Scenic Views" 
            className="img-fluid rounded"
            style={{ height: "200px", width: "100%", objectFit: "cover" }}
          />
        </div>
        
        <div className="col-6">
          <img 
            src="https://images.unsplash.com/photo-1548574505-5e239809ee19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
            alt="Night Cruise" 
            className="img-fluid rounded"
            style={{ height: "200px", width: "100%", objectFit: "cover" }}
          />
        </div>
        
        <div className="col-12">
          <img 
            src="https://images.unsplash.com/photo-1568849676085-51415703900f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Dining Experience" 
            className="img-fluid rounded"
            style={{ height: "200px", width: "100%", objectFit: "cover" }}
          />
        </div>
        
        <div className="col-12">
          <img 
            src="https://images.unsplash.com/photo-1576675784201-0e142b423952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Cruise Interior" 
            className="img-fluid rounded"
            style={{ height: "200px", width: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CruiseSection;