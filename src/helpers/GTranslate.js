import React, { useEffect } from 'react';

const GTranslateWidget = () => {
  useEffect(() => {
    // Set global GTranslate settings
    window.gtranslateSettings = {
      default_language: 'en',
      languages: ["en", "es", "fr", "zh-CN", "ar", "hi",  "de","nl","it","pt","ru"],
      wrapper_selector: '.gtranslate_wrapper'
    };

    // Inject popup.js
    const script = document.createElement('script');
    script.src = 'https://cdn.gtranslate.net/widgets/latest/popup.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const addedScript = document.querySelector('script[src="https://cdn.gtranslate.net/widgets/latest/popup.js"]');
      if (addedScript) addedScript.remove();
    };
  }, []);

  return (
    <div className="gtranslate_wrapper" style={{ display: 'inline-block', margin: '10px' }}></div>
  );
};

export default GTranslateWidget;
