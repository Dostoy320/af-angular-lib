var href = window.location.href;

if (window.location.host !== 'localhost' &&
    window.location.host !== 'dev' &&
    window.location.protocol != 'https:')
  href = "https:" + window.location.href.substring(window.location.protocol.length);

if (href.slice(-1) !== '/')
  href += '/';

// if we changed href... redirect
if(window.location.href !== href)
  window.location.href = href;