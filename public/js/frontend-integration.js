(function() {
  // 1. Inject CSS and Custom DOM Elements
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/css/dynamic-styles.css';
  document.head.appendChild(link);

  const modalHTML = `
    <div class="vcet-modal-overlay" id="vcetEnquiryModal">
      <div class="vcet-modal">
        <button class="vcet-modal-close" id="vcetModalClose">&times;</button>
        <h3>Admission Enquiry</h3>
        <p>Leave your details and our admission cell will completely guide you.</p>
        <form id="vcetEnquiryForm">
          <div class="vcet-form-group">
            <label>Full Name</label>
            <input type="text" class="vcet-form-control" name="name" required placeholder="John Doe">
          </div>
          <div class="vcet-form-group">
            <label>Email Address</label>
            <input type="email" class="vcet-form-control" name="email" required placeholder="john@example.com">
          </div>
          <div class="vcet-form-group">
            <label>Phone Number</label>
            <input type="tel" class="vcet-form-control" name="phone" required placeholder="1234567890" pattern="[0-9]{10}">
          </div>
          <div class="vcet-form-group">
            <label>Desired Course</label>
            <select class="vcet-form-control" name="course" required>
              <option value="" disabled selected>Select a Course</option>
              <option value="B.E. Computer Engineering">B.E. Computer Engineering</option>
              <option value="B.E. IT">B.E. Information Technology</option>
              <option value="B.E. AI & DS">B.E. AI & Data Science</option>
              <option value="M.E. Structural">M.E. Structural Engineering</option>
              <option value="MMS">MMS (MBA)</option>
            </select>
          </div>
          <button type="submit" class="vcet-submit-btn" id="vcetSubmitBtn">
            <span class="loader-spinner" id="vcetSpinner"></span>
            <span id="vcetBtnText">Submit Enquiry</span>
          </button>
        </form>
      </div>
    </div>
    <div class="vcet-toast" id="vcetToast"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 2. Intercept Enquiries
  const modal = document.getElementById('vcetEnquiryModal');
  const closeBtn = document.getElementById('vcetModalClose');
  const form = document.getElementById('vcetEnquiryForm');
  const toast = document.getElementById('vcetToast');
  const submitBtn = document.getElementById('vcetSubmitBtn');
  const spinner = document.getElementById('vcetSpinner');
  const btnText = document.getElementById('vcetBtnText');

  const showToast = (message, isError = false) => {
    toast.textContent = message;
    toast.className = 'vcet-toast show' + (isError ? ' error' : '');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
  };

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  
  // Attach overrides robustly based on text or href
  const applyLinks = Array.from(document.querySelectorAll('a')).filter(a => {
    const text = a.textContent.toLowerCase();
    const href = a.getAttribute('href') || '';
    return href.includes('forms.gle') || 
           text.includes('apply now') || 
           text.includes('admission enquiry');
  });

  applyLinks.forEach(link => {
    // If it's simply a scroll link, skip override
    if (link.getAttribute('href') === '#admissions') return;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    spinner.style.display = 'block';
    btnText.textContent = 'Submitting...';

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        showToast('Enquiry submitted. We will contact you soon!');
        form.reset();
        modal.classList.remove('active');
      } else {
        showToast(result.message || 'Error submitting enquiry', true);
      }
    } catch (err) {
      showToast('Network error, please try again later.', true);
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = 'Submit Enquiry';
    }
  });

  // 3. Dynamic Notices Fetching
  const loadNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (!res.ok) return;
      const notices = await res.json();
      if (notices.length === 0) return;

      const noticeContainer = document.querySelector('.notice-scroll');
      if (noticeContainer) {
        let spans = notices.map(n => 
          `<span class="notice-item">${n.emoji} <a href="${n.link || '#'}">${n.text}</a></span>`
        ).join('<span class="notice-sep">◆</span>');
        
        // Duplicate for seamless scroll
        noticeContainer.innerHTML = spans + '<span class="notice-sep">◆</span>' + spans;
      }
    } catch (e) {
      console.log('Failed to load notices', e);
    }
  };

  // 4. Dynamic Events Fetching
  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const events = await res.json();
      if (events.length === 0) return;

      const eventList = document.querySelector('.events-list');
      if (eventList) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let html = events.map((ev, i) => {
          const d = new Date(ev.date);
          const day = String(d.getDate()).padStart(2, '0');
          const month = months[d.getMonth()];
          const year = d.getFullYear();
          const delayClass = i === 1 ? 'reveal-delay-1' : (i === 2 ? 'reveal-delay-2' : '');
          
          return `
            <a href="${ev.link || '#'}" target="_blank" class="event-item reveal visible ${delayClass}">
              <div class="event-date">
                <div class="event-day">${day}</div>
                <div class="event-month">${month} ${year}</div>
              </div>
              <div class="event-divider"></div>
              <div>
                <div class="event-title">${ev.title}</div>
                <div class="event-sub">${ev.description || ''}</div>
              </div>
              <div class="event-arrow">→</div>
            </a>
          `;
        }).join('');
        eventList.innerHTML = html;
      }
    } catch (e) {
      console.log('Failed to load events', e);
    }
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
    loadEvents();
  });
})();
