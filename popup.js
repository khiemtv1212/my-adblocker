// Lấy các element
const toggleBtn = document.getElementById('toggle-btn');
const statusText = document.getElementById('status');
const blockedCount = document.getElementById('blocked-count');

// Trạng thái mặc định
let isEnabled = true;
let totalBlocked = 0;

// Load trạng thái từ storage
chrome.storage.local.get(['isEnabled', 'totalBlocked'], (result) => {
  if (result.isEnabled !== undefined) {
    isEnabled = result.isEnabled;
  }
  if (result.totalBlocked !== undefined) {
    totalBlocked = result.totalBlocked;
  }
  updateUI();
});

// Cập nhật giao diện
function updateUI() {
  if (isEnabled) {
    statusText.textContent = 'Đang hoạt động';
    toggleBtn.textContent = 'Tắt Ad Blocker';
    toggleBtn.classList.remove('disabled');
  } else {
    statusText.textContent = 'Đã tắt';
    toggleBtn.textContent = 'Bật Ad Blocker';
    toggleBtn.classList.add('disabled');
  }
  
  blockedCount.textContent = totalBlocked.toLocaleString();
}

// Xử lý khi click nút toggle
toggleBtn.addEventListener('click', () => {
  isEnabled = !isEnabled;
  
  // Lưu trạng thái
  chrome.storage.local.set({ isEnabled: isEnabled });
  
  // Cập nhật UI
  updateUI();
  
  // Reload trang hiện tại để áp dụng thay đổi
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// Tăng counter khi chặn được quảng cáo (có thể mở rộng sau)
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'incrementBlocked') {
    totalBlocked++;
    chrome.storage.local.set({ totalBlocked: totalBlocked });
    updateUI();
  }
});