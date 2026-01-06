// Service Worker để chặn requests ở mức nền

// Danh sách domain quảng cáo cần chặn
const blockedDomains = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'adnxs.com',
  'adsrvr.org',
  'advertising.com',
  'criteo.com',
  'outbrain.com',
  'taboola.com',
  'pubmatic.com',
  'rubiconproject.com',
  'openx.net',
  'amazon-adsystem.com',
  'scorecardresearch.com',
  'quantserve.com',
  'moatads.com',
  'exoclick.com',
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'adcash.com',
  'clickadu.com',
  'hilltopads.net',
  'bidvertiser.com',
  'revenuehits.com',
  'ads-twitter.com',
  'facebook.net',
  'connect.facebook.net'
];

// Pattern URL cần chặn
const blockedPatterns = [
  '/ads/',
  '/adv/',
  '/banner/',
  '/banners/',
  '/adserver/',
  '/ad-',
  'ads.',
  'ad.',
  '/tracking/',
  '/tracker/',
  '/analytics/',
  'pagead',
  'adsense'
];

// Kiểm tra URL có nên chặn không
function shouldBlock(url) {
  const urlLower = url.toLowerCase();
  
  // Kiểm tra domain
  for (const domain of blockedDomains) {
    if (urlLower.includes(domain)) {
      return true;
    }
  }
  
  // Kiểm tra pattern
  for (const pattern of blockedPatterns) {
    if (urlLower.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// Lắng nghe các request
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (shouldBlock(details.url)) {
      console.log('[Ad Blocker] Đã chặn:', details.url);
      return { cancel: true };
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Đếm số quảng cáo đã chặn
let blockedCount = 0;

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (shouldBlock(details.url)) {
      blockedCount++;
      chrome.storage.local.set({ totalBlocked: blockedCount });
      
      // Cập nhật badge
      chrome.action.setBadgeText({ text: blockedCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
      
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Reset counter khi browser khởi động
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['totalBlocked'], (result) => {
    if (result.totalBlocked) {
      blockedCount = result.totalBlocked;
    }
  });
});

// Xử lý message từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBlockedCount') {
    sendResponse({ count: blockedCount });
  }
});