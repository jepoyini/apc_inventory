import React, { useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa'; // Optional: using react-icons

const GoogleTranslate = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );

      setTimeout(() => {
        const iframe = document.querySelector('.skiptranslate iframe');
        if (iframe) {
          iframe.remove();
          document.body.style.top = '0px';
        }
      }, 1000);
    };

    addGoogleTranslateScript();

    const intervalId = setInterval(() => {
      const langSpan = document.querySelector(
        '#google_translate_element .goog-te-gadget-simple span:first-child'
      );
      const langText = langSpan ? langSpan.textContent.trim() : null;
      if (langText && langText !== 'Select Language') {
        const storedLang = sessionStorage.getItem('selectedLanguage');
        if (storedLang !== langText) {
          sessionStorage.setItem('selectedLanguage', langText);
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Replace the default G icon with a globe or custom icon */}

      {/* Hide Google Translate branding text */}
      <div id="google_translate_element" className="custom-translate-element" />
    </div>
  );
};

export default GoogleTranslate;
