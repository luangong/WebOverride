'use strict';

function initialize(overrides, document, location) {
  Object.values(overrides).forEach(override => {
    // Ignore inactive overrides
    if (!override.active) {
      return;
    }

    // Ignore overrides that don’t have matching URL patterns
    if (!override.urlQueries.some(query => (new RegExp(query)).test(location.href))) {
      return;
    }

    // Inject HTML, CSS, and JS for matching overrides
    if (override.htmlContent) {
      document.body.innerHTML += override.htmlContent;
    }
    if (override.cssContent) {
      document.head.innerHTML += '<style type="text/css">' + override.cssContent + '</style>';
    }
    if (override.libs) {
      override.libs.forEach(function (lib) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = lib.value;
        document.head.appendChild(s);
      });
    }
    if (override.jsContent) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.text = override.jsContent;
      document.head.appendChild(s);
    }
  });
}

function onMessage(message, location) {
  if (message.request == 'overrideUpdated' && message.urlQueries) {
    // Check if any of the overrides urls pass the regexp test
    if (message.urlQueries.some(query => (new RegExp(query)).test(location.href))) {
      location.reload();
    }
  }
}

// Export functions for the Node environment
if (module && module.exports) {
  module.exports = { initialize, onMessage };
} else {
  // Get all the scripts and activate the relevant ones
  chrome.storage.sync.get(overrides => {
    initialize(overrides, document, location);
  });

  // Listen for updates in overrides and reload the page if the updated override is relevant
  chrome.runtime.onMessage.addListener(message => {
    onMessage(message, location);
  });
}
