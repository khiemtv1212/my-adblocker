// Danh sách các selector phổ biến của quảng cáo (mở rộng)
const adSelectors = [
  // Google Ads specific
  'ins.adsbygoogle',
  '[data-ad-slot]',
  '[data-ad-client]',
  '[data-google-query-id]',
  
  // AMP ads
  'amp-ad',
  'amp-embed[type="taboola"]',
  'amp-embed[type="outbrain"]',
  
  // Iframes from ad networks
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  'iframe[src*="googleadservices"]',
  'iframe[id*="google_ads"]',
  'iframe[name*="google_ads"]',
  'iframe[src*="criteo"]',
  'iframe[src*="outbrain"]',
  'iframe[src*="taboola"]',
  'iframe[src*="exoclick"]',
  'iframe[src*="popads"]',
  'iframe[src*="revcontent"]',
  'iframe[src*="chargeads"]',
  
  // Common ad container patterns - BUT NOT matching normal elements
  '.advertisement',
  '.advertising',
  '.ad-container',
  '.ad-wrapper',
  '.ad-unit',
  '.ad-banner',
  '.ad-box',
  '.ad-block',
  '.adsbox',
  '.advert',
  '.adsbygoogle',
  
  // Specific patterns for ads
  '.banner-ad',
  '.google-ad',
  '.google_ads',
  '.top-ad',
  '.bottom-ad',
  '.sidebar-ad',
  '.content-ad',
  '[class*="advertisement"]',
  '[id*="advertisement"]',
  
  // Aria labels for ads
  '[aria-label*="Advertisement"]',
  '[aria-label*="Sponsored"]',
  '[aria-label*="Quảng cáo"]',
  '[aria-label*="Tài trợ"]',
  
  // Native ads
  '[class*="native-ad"]',
  '[class*="native_ad"]',
  '[data-native-ad]',
  
  // Outbrain & Taboola
  '[class*="outbrain"]',
  '[class*="taboola"]',
  '[class*="OUTBRAIN"]',
  '[class*="TABOOLA"]',
  
  // Stripchat & Brazzers
  'a[href*="stripchat.com"]',
  'a[href*="go.stripchat.com"]',
  'a[href*="brazzersnetwork.com"]',
  'a[href*="landing.brazzersnetwork.com"]',
  '[href*="stripchat"][class*="ad"]',
  '[href*="brazzers"][class*="ad"]',
  '[class*="stripchat"]',
  '[class*="brazzers"]',
  '[id*="stripchat"]',
  '[id*="brazzers"]',
  'img[src*="stripchat"]',
  'img[src*="brazzers"]'
];

// Hàm ẩn các phần tử quảng cáo
function hideAds() {
  const selector = adSelectors.join(', ');
  const ads = document.querySelectorAll(selector);
  
  let blockedCount = 0;
  ads.forEach(ad => {
    // Bỏ qua các element không cần thiết
    if (!ad || !ad.offsetParent) return;
    
    // Kiểm tra xem element có thực sự là quảng cáo không
    const isRealAd = checkIfRealAd(ad);
    if (!isRealAd) return;
    
    // Ẩn element
    ad.style.setProperty('display', 'none', 'important');
    ad.style.setProperty('visibility', 'hidden', 'important');
    ad.style.setProperty('opacity', '0', 'important');
    
    // Thử ẩn parent nếu parent chỉ chứa quảng cáo
    const parent = ad.parentElement;
    if (parent && parent.children.length === 1 && !isImportantElement(parent)) {
      parent.style.setProperty('display', 'none', 'important');
    }
    
    blockedCount++;
  });
  
  // Xóa các empty divs có thể còn lại
  removeEmptyContainers();
  
  if (blockedCount > 0) {
    console.log(`[Ad Blocker] Đã chặn ${blockedCount} quảng cáo`);
  }
}

// Kiểm tra xem element có phải là quảng cáo thực sự không
function checkIfRealAd(element) {
  // Những element này luôn là quảng cáo
  if (element.tagName === 'INS' || 
      element.tagName === 'AMP-AD' ||
      element.src?.includes('doubleclick') ||
      element.src?.includes('googlesyndication')) {
    return true;
  }
  
  // Kiểm tra data attributes
  if (element.dataset?.adSlot || element.dataset?.adClient) {
    return true;
  }
  
  // Aria labels rõ ràng là quảng cáo
  const ariaLabel = element.getAttribute('aria-label') || '';
  if (ariaLabel.includes('Advertisement') || 
      ariaLabel.includes('Sponsored') ||
      ariaLabel.includes('Quảng cáo') ||
      ariaLabel.includes('Tài trợ')) {
    return true;
  }
  
  // Class names như .advertisement, .advertising chắc chắn là quảng cáo
  if (element.classList.contains('advertisement') || 
      element.classList.contains('advertising') ||
      element.classList.contains('adsbox')) {
    return true;
  }
  
  return false;
}

// Kiểm tra xem element có phải là element quan trọng không
function isImportantElement(element) {
  const tag = element.tagName?.toLowerCase();
  const id = (element.id || '').toLowerCase();
  const className = (element.className || '').toLowerCase();
  
  // Những element không nên ẩn
  const importantTags = ['body', 'html', 'head', 'main', 'nav', 'header', 'footer', 'section', 'article'];
  if (importantTags.includes(tag)) return true;
  
  // ID hoặc class quan trọng
  if (id.includes('main') || id.includes('content') || id.includes('app')) return true;
  if (className.includes('main') || className.includes('content') || className.includes('container')) return true;
  
  return false;
}

// Hàm xóa các container trống
function removeEmptyContainers() {
  const emptySelectors = [
    'div:empty[class*="ad"]',
    'div:empty[id*="ad"]',
    'aside:empty',
    'section:empty[class*="ad"]'
  ];
  
  emptySelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.hasChildNodes() || el.textContent.trim() === '') {
        el.remove();
      }
    });
  });
}

// Chặn popup và popunder
function blockPopups() {
  // Override window.open
  window.open = function(...args) {
    console.log('[Ad Blocker] Đã chặn popup');
    return null;
  };
  
  // Chặn target="_blank" trên các link quảng cáo
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, [role="button"]');
    if (!target) return;
    
    const href = target.getAttribute('href') || '';
    const target_attr = target.getAttribute('target') || '';
    
    // Danh sách domain quảng cáo
    const adDomains = [
      'doubleclick', 'googlesyndication', 'googleadservices', 
      'advertising', 'adserver', 'criteo', 'outbrain', 'taboola',
      'exoclick', 'popads', 'clickadilla', 'admaven', 'adf.ly',
      'bit.ly', 'tinyurl', 'adly', 'adclick'
    ];
    
    // Kiểm tra href
    const isAdLink = adDomains.some(domain => href.toLowerCase().includes(domain));
    
    if (isAdLink) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Ad Blocker] Đã chặn link quảng cáo:', href);
      return false;
    }
    
    // Chặn target="_blank" trên element có class ad
    if (target_attr === '_blank' && (
      target.className.toLowerCase().includes('ad') ||
      target.id.toLowerCase().includes('ad') ||
      (target.parentElement && (
        target.parentElement.className.toLowerCase().includes('ad') ||
        target.parentElement.id.toLowerCase().includes('ad')
      ))
    )) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Ad Blocker] Đã chặn popup từ link quảng cáo');
      return false;
    }
  }, true);
  
  // Chặn các popups được tạo bằng setTimeout/setInterval
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay, ...args) {
    if (typeof fn === 'function') {
      const fnStr = fn.toString();
      if (fnStr.includes('window.open') || fnStr.includes('showad')) {
        console.log('[Ad Blocker] Đã chặn popup được lên lịch');
        return 0;
      }
    }
    return originalSetTimeout.apply(this, arguments);
  };
  
  // Chặn mousedown/mouseup events trên element quảng cáo
  document.addEventListener('mousedown', function(e) {
    const target = e.target.closest('[class*="ad"], [id*="ad"]');
    if (target && target.onclick) {
      target.onclick = null;
    }
  }, true);
}

// Chạy ngay khi load
hideAds();
blockPopups();

// Theo dõi các thay đổi DOM để chặn quảng cáo được thêm sau
const observer = new MutationObserver((mutations) => {
  let shouldHideAds = false;
  
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          const tag = node.tagName?.toLowerCase();
          
          // Chỉ xử lý những thứ chắc chắn là quảng cáo
          if (tag === 'iframe' || tag === 'ins' || tag === 'amp-ad') {
            shouldHideAds = true;
          }
          
          // Kiểm tra src attribute của iframe
          if (tag === 'iframe' && node.src?.includes('doubleclick')) {
            shouldHideAds = true;
          }
          
          // Kiểm tra data attributes
          if (node.dataset?.adSlot || node.dataset?.adClient) {
            shouldHideAds = true;
          }
        }
      });
    }
  });
  
  if (shouldHideAds) {
    hideAds();
  }
});

// Bắt đầu theo dõi
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} else {
  // Nếu document.body chưa sẵn, đợi cho đến khi nó được tạo
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// Chạy lại sau khi trang load xong
window.addEventListener('load', () => {
  hideAds();
  blockPopups();
});

// Chạy định kỳ mỗi 3 giây để bắt các quảng cáo động
setInterval(hideAds, 3000);

// Chặn Google Analytics và tracking scripts
(function() {
  // Block ga() function
  window.ga = function() { 
    console.log('[Ad Blocker] Đã chặn Google Analytics');
  };
  
  // Block gtag() function
  window.gtag = function() {
    console.log('[Ad Blocker] Đã chặn Google Tag Manager');
  };
  
  // Block fbq() function (Facebook Pixel)
  window.fbq = function() {
    console.log('[Ad Blocker] Đã chặn Facebook Pixel');
  };
  
  // Block _gaq (old GA)
  window._gaq = { push: function() {} };
})();