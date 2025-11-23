(function () {
  'use strict';

  // This will be called by the user's script tag
  window.initMEGABot = function (options) {
    // --- 1. Validate options ---
    if (!options || !options.botId || !options.baseUrl) {
      console.error("MEGABot: botId and baseUrl are required.");
      return;
    }

    // --- 2. Widget creation logic ---
    const createWidget = () => {
      const { botId, baseUrl } = options;
      const IFRAME_URL = `${baseUrl}/chat.html?id=${botId}`;

      // Avoid creating multiple widgets
      if (document.querySelector('.chatbot-launcher')) {
        return;
      }

      // --- Create and inject CSS for styling ---
      const style = document.createElement('style');
      style.textContent = `
        :root { --chatbot-primary-color: #3b82f6; }

        @keyframes launcher-fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chatbot-launcher {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-color: var(--chatbot-primary-color);
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
          z-index: 9999998;
          animation: launcher-fade-in 0.5s 0.5s ease-out backwards;
        }
        .chatbot-launcher:hover { transform: scale(1.1); }
        .chatbot-launcher svg { color: white; }
        
        .chatbot-container {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 400px;
          height: 600px;
          max-height: calc(100vh - 110px);
          max-width: calc(100vw - 40px);
          border-radius: 1.5rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          overflow: hidden;
          transform-origin: bottom right;
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
          transform: scale(0.9);
          opacity: 0;
          pointer-events: none;
          z-index: 9999999;
        }
        .chatbot-container.open {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;
        }
        .chatbot-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `;
      document.head.appendChild(style);

      // --- Create Chatbot Launcher Button ---
      const launcher = document.createElement('div');
      launcher.className = 'chatbot-launcher';
      launcher.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      `;

      // --- Create Iframe Container ---
      const container = document.createElement('div');
      container.className = 'chatbot-container';

      // --- Create Iframe ---
      const iframe = document.createElement('iframe');
      iframe.className = 'chatbot-iframe';
      iframe.src = IFRAME_URL;
      iframe.title = "Chatbot Widget"; // Accessibility

      // --- Append elements to the body ---
      container.appendChild(iframe);
      document.body.appendChild(launcher);
      document.body.appendChild(container);

      // --- Event Listener to toggle chat window ---
      launcher.addEventListener('click', () => {
        container.classList.toggle('open');
      });
    };

    // --- 3. Execute widget creation at the right time ---
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      createWidget();
    } else {
      document.addEventListener('DOMContentLoaded', createWidget, { once: true });
    }
  };
})();