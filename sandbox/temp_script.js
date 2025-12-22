<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Profile sidebar tab switching
    const sidebarLinks = document.querySelectorAll('.profile-sidebar-link');
    const tabContents = document.querySelectorAll('[data-tab-content]');

    function showTab(targetId) {
      // Hide all tab contents
      tabContents.forEach(content => {
        content.classList.add('hidden');
      });
      
      // Remove active class from all sidebar links
      sidebarLinks.forEach(link => {
        link.classList.remove('active', 'bg-[#F3EDF7]', 'text-[#6750A4]');
        link.classList.add('text-gray-600');
      });
      
      // Show target tab
      const targetTab = document.querySelector(targetId);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }
      
      // Add active class to clicked link
      const activeLink = document.querySelector(`[data-tab-target="${targetId}"]`);
      if (activeLink) {
        activeLink.classList.add('active', 'bg-[#F3EDF7]', 'text-[#6750A4]');
        activeLink.classList.remove('text-gray-600');
      }
    }

    // Add click handlers to sidebar links
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-tab-target');
        if (targetId) {
          showTab(targetId);
        }
      });
    });

    // Order status filter buttons
    const filterButtons = document.querySelectorAll('.bg-white.rounded-2xl .flex.items-center.justify-between.mb-6 .flex.gap-2 button');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active state from all buttons
        filterButtons.forEach(btn => {
          btn.classList.remove('bg-[#6750A4]', 'text-white');
          btn.classList.add('text-gray-600');
        });
        
        // Add active state to clicked button
        button.classList.add('bg-[#6750A4]', 'text-white');
        button.classList.remove('text-gray-600');
        
        // Here you can add filtering logic based on button text
        const filterText = button.textContent.trim();
        console.log('Filter by:', filterText);
      });
    });

    // Logout functionality
    const logoutLink = document.querySelector('a[href="../index.html"]');
    if (logoutLink && logoutLink.textContent.includes('خروج از حساب')) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('آیا از خروج از حساب کاربری مطمئن هستید؟')) {
          // Clear user data from localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('loginPhone');
          localStorage.removeItem('registerPhone');
          
          // Redirect to login page
          window.location.href = 'login.html';
        }
      });
    }

    // Initialize active state for first filter button
    const firstFilterButton = document.querySelector('.bg-white.rounded-2xl .flex.items-center.justify-between.mb-6 .flex.gap-2 button');
    if (firstFilterButton) {
      firstFilterButton.classList.add('bg-[#6750A4]', 'text-white');
      firstFilterButton.classList.remove('text-gray-600');
    }

    // Edit Name Modal functionality
    const editNameModal = document.getElementById('editNameModal');
    const closeNameModal = document.getElementById('closeNameModal');
    const cancelNameEdit = document.getElementById('cancelNameEdit');
    const editNameForm = document.getElementById('editNameForm');
    
    // Open modal when clicking name edit button
    function openNameEditModal() {
      editNameModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('Name edit modal opened');
    }
    
    // Close modal function
    function closeNameEditModal() {
      editNameModal.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('Name edit modal closed');
    }
    
    // Event listeners for modal controls
    closeNameModal?.addEventListener('click', closeNameEditModal);
    cancelNameEdit?.addEventListener('click', closeNameEditModal);
    
    // Close modal when clicking backdrop
    editNameModal?.addEventListener('click', (e) => {
      if (e.target === editNameModal) {
        closeNameEditModal();
      }
    });
    
    // Handle form submission
    editNameForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('firstNameInput').value;
      const lastName = document.getElementById('lastNameInput').value;
      const fullName = `${firstName} ${lastName}`;
      
      console.log('Form submitted:', { firstName, lastName, fullName });
      
      // Update the name in the profile
      const nameElements = document.querySelectorAll('h3.font-bold.text-gray-900, p.text-gray-900.font-medium');
      nameElements.forEach(el => {
        if (el.textContent.includes('علی محمدی')) {
          el.textContent = fullName;
        }
      });
      
      // Update avatar initials
      const avatarElements = document.querySelectorAll('.rounded-full.flex.items-center.justify-center');
      avatarElements.forEach(el => {
        if (el.textContent === 'ع') {
          el.textContent = firstName.charAt(0);
        }
      });
      
      // Show success notification
      if (successNotification) {
        showSuccessNotification('نام با موفقیت ویرایش شد');
      } else if (typeof showToast === 'function') {
        showToast('نام با موفقیت ویرایش شد', { 
          icon: 'check_circle', 
          iconClass: 'text-green-400' 
        });
      }
      
      // Close modal
      closeNameEditModal();
    });
    
    // Edit Phone Modal functionality
    const editPhoneModal = document.getElementById('editPhoneModal');
    const closePhoneModal = document.getElementById('closePhoneModal');
    const cancelPhoneEdit = document.getElementById('cancelPhoneEdit');
    const editPhoneForm = document.getElementById('editPhoneForm');
    const newPhoneInput = document.getElementById('newPhoneInput');
    
    // Open modal when clicking phone edit button
    function openPhoneEditModal() {
      editPhoneModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      newPhoneInput.value = '';
      newPhoneInput.focus();
      console.log('Phone edit modal opened');
    }
    
    // Close modal function
    function closePhoneEditModal() {
      editPhoneModal.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('Phone edit modal closed');
    }
    
    // Event listeners for modal controls
    closePhoneModal?.addEventListener('click', closePhoneEditModal);
    cancelPhoneEdit?.addEventListener('click', closePhoneEditModal);
    
    // Close modal when clicking backdrop
    editPhoneModal?.addEventListener('click', (e) => {
      if (e.target === editPhoneModal) {
        closePhoneEditModal();
      }
    });
    
    // Phone number validation
    function validatePhoneNumber(phone) {
      const phoneRegex = /^09[0-9]{9}$/;
      return phoneRegex.test(phone);
    }
    
    // Phone Verification Modal functionality
    const phoneVerificationModal = document.getElementById('phoneVerificationModal');
    const closeVerificationModal = document.getElementById('cancelVerification');
    const phoneVerificationForm = document.getElementById('phoneVerificationForm');
    const verificationPhone = document.getElementById('verificationPhone');
    const resendCodeBtn = document.getElementById('resendCode');
    const countdownEl = document.getElementById('countdown');
    
    let currentNewPhone = '';
    let countdownInterval;
    
    // Open verification modal
    function openPhoneVerificationModal(phone) {
      currentNewPhone = phone;
      
      // Mask the phone number
      const maskedPhone = phone.slice(0, 4) + 'XXXX' + phone.slice(-2);
      if (verificationPhone) verificationPhone.textContent = maskedPhone;
      
      // Close phone modal and open verification modal
      closePhoneEditModal();
      
      // Small delay to ensure phone modal is fully closed
      setTimeout(() => {
        if (phoneVerificationModal) {
          phoneVerificationModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          
          // Focus first OTP field
          const firstOtpField = phoneVerificationModal.querySelector('.otp-field');
          if (firstOtpField) firstOtpField.focus();
          
          // Start countdown
          startCountdown();
          
          console.log('Phone verification modal opened for:', phone);
        }
      }, 100);
    }
    
    // Close verification modal
    function closePhoneVerificationModal() {
      phoneVerificationModal.classList.add('hidden');
      document.body.style.overflow = '';
      
      // Clear countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      
      // Reset OTP fields
      const otpFields = phoneVerificationModal.querySelectorAll('.otp-field');
      otpFields.forEach(field => field.value = '');
      
      console.log('Phone verification modal closed');
    }
    
    // Countdown timer
    function startCountdown() {
      let seconds = 120;
      countdownEl.textContent = seconds;
      resendCodeBtn.disabled = true;
      resendCodeBtn.classList.add('opacity-50', 'cursor-not-allowed');
      
      countdownInterval = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;
        
        if (seconds <= 0) {
          clearInterval(countdownInterval);
          resendCodeBtn.disabled = false;
          resendCodeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          countdownEl.textContent = '0';
        }
      }, 1000);
    }
    
    // Event listeners for verification modal
    closeVerificationModal?.addEventListener('click', closePhoneVerificationModal);
    
    // Close modal when clicking backdrop
    phoneVerificationModal?.addEventListener('click', (e) => {
      if (e.target === phoneVerificationModal) {
        closePhoneVerificationModal();
      }
    });
    
    // Resend code
    resendCodeBtn?.addEventListener('click', () => {
      if (!resendCodeBtn.disabled) {
        if (typeof showToast === 'function') {
          showToast(`کد تایید مجدد به شماره ${currentNewPhone} ارسال شد`, { 
            icon: 'check_circle', 
            iconClass: 'text-green-400' 
          });
        }
        startCountdown();
        console.log('Code resent to:', currentNewPhone);
      }
    });
    
    // OTP field navigation
    const otpFields = phoneVerificationModal?.querySelectorAll('.otp-field');
    otpFields?.forEach((field, index) => {
      field.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (value && !/^[0-9]$/.test(value)) {
          e.target.value = '';
          return;
        }
        
        // Move to next field
        if (value && index < otpFields.length - 1) {
          otpFields[index + 1].focus();
        }
        
        // Auto-submit when all fields are filled
        const allFilled = Array.from(otpFields).every(f => f.value);
        if (allFilled) {
          setTimeout(() => phoneVerificationForm?.requestSubmit(), 100);
        }
      });
      
      field.addEventListener('keydown', (e) => {
        // Move to previous field on backspace
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          otpFields[index - 1].focus();
        }
      });
    });
    
    // Handle verification form submission
    phoneVerificationForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get OTP code
      const otpCode = Array.from(otpFields).map(f => f.value).join('');
      
      if (otpCode.length !== 6) {
        if (typeof showToast === 'function') {
          showToast('لطفاً کد تایید ۶ رقمی را وارد کنید', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        } else {
          alert('لطفاً کد تایید ۶ رقمی را وارد کنید');
        }
        return;
      }
      
      console.log('OTP verification submitted:', { phone: currentNewPhone, code: otpCode });
      
      // Simulate verification (in real app, send to server)
      if (otpCode === '123456') { // Demo code
        // Success - update phone number
        const phoneElements = document.querySelectorAll('p.text-gray-500, p.text-xs.text-gray-500');
        phoneElements.forEach(el => {
          if (el.textContent.includes('09121234567')) {
            el.textContent = currentNewPhone;
          }
        });
        
        if (typeof showToast === 'function') {
          showToast('شماره موبایل با موفقیت تغییر کرد', { 
            icon: 'check_circle', 
            iconClass: 'text-green-400' 
          });
        }
        
        closePhoneVerificationModal();
      } else {
        if (typeof showToast === 'function') {
          showToast('کد تایید نامعتبر است', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        } else {
          alert('کد تایید نامعتبر است');
        }
        
        // Clear OTP fields
        otpFields.forEach(field => field.value = '');
        otpFields[0].focus();
      }
    });
    
    // Handle form submission
    editPhoneForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPhone = newPhoneInput.value.trim();
      
      console.log('Phone form submitted:', { newPhone });
      
      // Validate phone number
      if (!validatePhoneNumber(newPhone)) {
        // Use custom toast or alert since showToast is not available here
        if (typeof showToast === 'function') {
          showToast('شماره موبایل نامعتبر است. لطفاً شماره صحیح وارد کنید.', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        } else {
          alert('شماره موبایل نامعتبر است. لطفاً شماره صحیح وارد کنید.');
        }
        newPhoneInput.focus();
        return;
      }
      
      // Show success message and open verification modal
      if (successNotification) {
        showSuccessNotification(`کد تایید به شماره ${newPhone} ارسال شد`);
      } else if (typeof showToast === 'function') {
        showToast(`کد تایید به شماره ${newPhone} ارسال شد`, { 
          icon: 'check_circle', 
          iconClass: 'text-green-400' 
        });
      }
      
      // Open verification modal
      setTimeout(() => {
        openPhoneVerificationModal(newPhone);
      }, 500);
    });
    
    // Input formatting and validation
    newPhoneInput?.addEventListener('input', (e) => {
      let value = e.target.value;
      
      // Only allow numbers
      value = value.replace(/[^0-9]/g, '');
      
      // Limit to 11 digits
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      
      e.target.value = value;
      
      // Visual feedback for valid/invalid phone
      if (value.length === 11) {
        if (validatePhoneNumber(value)) {
          e.target.classList.remove('border-red-300');
          e.target.classList.add('border-green-300');
        } else {
          e.target.classList.remove('border-green-300');
          e.target.classList.add('border-red-300');
        }
      } else {
        e.target.classList.remove('border-red-300', 'border-green-300');
      }
    });
    
    // Edit buttons functionality
    const editButtons = document.querySelectorAll('#details button');
    editButtons.forEach(button => {
      if (button.textContent.includes('ویرایش')) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const card = button.closest('.bg-gradient-to-br');
          const title = card.querySelector('h3').textContent;
          
          // Check which edit button was clicked
          if (title.includes('نام کامل')) {
            openNameEditModal();
          } else if (title.includes('شماره موبایل')) {
            openPhoneEditModal();
          } else if (title.includes('آدرس تحویل')) {
            openAddressEditModal();
          } else {
            // Show edit modal or inline editing for other items
            if (typeof showToast === 'function') {
              showToast(`در حال ویرایش ${title}`, { 
                icon: 'edit', 
                iconClass: 'text-blue-400' 
              });
            }
            
            // Here you can add modal logic or inline editing
            console.log(`Edit clicked for: ${title}`);
          }
        });
      }
    });
    
    // Edit Address Modal functionality
    const editAddressModal = document.getElementById('editAddressModal');
    const closeAddressModal = document.getElementById('closeAddressModal');
    const cancelAddressEdit = document.getElementById('cancelAddressEdit');
    const editAddressForm = document.getElementById('editAddressForm');
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const provinceInput = document.getElementById('provinceInput');
    const cityInput = document.getElementById('cityInput');
    const provinceDropdown = document.getElementById('provinceDropdown');
    const cityDropdown = document.getElementById('cityDropdown');
    const successNotification = document.getElementById('successNotification');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotification = document.getElementById('closeNotification');
    
    let provinces = [];
    let cities = [];
    let selectedProvince = null;
    let selectedCity = null;
    let notificationTimeout = null;
    
    // Open modal when clicking address edit button
    async function openAddressEditModal() {
      editAddressModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      console.log('🚀 Opening address edit modal...');
      
      // Reset values
      selectedProvince = null;
      selectedCity = null;
      provinceInput.value = '';
      cityInput.value = '';
      cityInput.disabled = true;
      cityInput.classList.add('bg-gray-50');
      cityInput.placeholder = 'ابتدا استان را انتخاب کنید';
      provinceDropdown.classList.add('hidden');
      cityDropdown.classList.add('hidden');
      
      // Load provinces
      await loadProvinces();
      
      console.log('✅ Address edit modal opened');
    }
    
    // Close modal function
    function closeAddressEditModal() {
      editAddressModal.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('Address edit modal closed');
    }
    
    // Load provinces from Iran Locations API
    async function loadProvinces() {
      if (!provinceSelect) return;
      
      try {
        // Show loading state
        provinceDropdown.innerHTML = '<div class="p-2 text-sm text-gray-500">در حال بارگذاری استان‌ها...</div>';
        
        // Fetch provinces from API
        if (window.IranLocationsAPI) {
          provinces = await window.IranLocationsAPI.fetchStatesFromAPI();
        } else {
          throw new Error('IranLocationsAPI not available');
        }
        
        // Populate province dropdown
        populateProvinceDropdown(provinces);
        console.log('✅ Provinces loaded from API:', provinces.length);
        
      } catch (error) {
        console.error('❌ Error loading provinces from API:', error);
        provinceDropdown.innerHTML = '<div class="p-2 text-sm text-red-500">خطا در بارگذاری استان‌ها</div>';
        
        // Show error message to user
        if (typeof showToast === 'function') {
          showToast('خطا در بارگذاری استان‌ها. لطفاً صفحه را رفرش کنید.', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        }
      }
    }
    
    // Populate province dropdown
    function populateProvinceDropdown(provinceList) {
      const filteredProvinces = filterProvinces(provinceList, provinceInput?.value || '');
      
      if (filteredProvinces.length === 0) {
        provinceDropdown.innerHTML = '<div class="p-2 text-sm text-gray-500">استانی یافت نشد</div>';
        return;
      }
      
      let html = '';
      filteredProvinces.forEach(province => {
        html += `
          <div class="px-3 py-2 hover:bg-[#F3EDF7] cursor-pointer text-sm transition-colors" data-province-id="${province.id}" data-province-name="${province.name}">
            ${province.name}
          </div>
        `;
      });
      
      provinceDropdown.innerHTML = html;
      
      // Add click handlers
      provinceDropdown.querySelectorAll('[data-province-id]').forEach(item => {
        item.addEventListener('click', () => selectProvince(item.dataset.provinceId, item.dataset.provinceName));
      });
    }
    
    // Filter provinces based on search
    function filterProvinces(provinceList, searchTerm) {
      if (!searchTerm) return provinceList;
      
      return provinceList.filter(province => 
        province.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Select a province
    function selectProvince(id, name) {
      // Check if this is actually a change
      if (selectedProvince && selectedProvince.id == id) {
        provinceDropdown.classList.add('hidden');
        console.log('🔄 Same province selected, no need to reload cities');
        return;
      }
      
      selectedProvince = { id, name };
      provinceInput.value = name;
      provinceSelect.value = id;
      provinceDropdown.classList.add('hidden');
      
      // Reset city selection and prepare for new cities
      selectedCity = null;
      cityInput.value = '';
      cityInput.disabled = false;
      cityInput.classList.remove('bg-gray-50');
      cityInput.placeholder = 'در حال بارگذاری شهرها...';
      cityDropdown.classList.add('hidden');
      
      // Load cities for newly selected province
      loadCities(id);
      
      console.log('✅ Province selected and cities reloaded:', { id, name });
    }
    
    // Load cities based on selected province from Iran Locations API
    async function loadCities(provinceId) {
      if (!citySelect) return;
      
      // Show loading state
      cityDropdown.innerHTML = '<div class="p-2 text-sm text-gray-500">در حال بارگذاری شهرها...</div>';
      
      try {
        console.log(`🔄 Loading cities for province ${provinceId} from API...`);
        
        // Get selected province for logging
        const selectedProvince = provinces.find(p => p.id == provinceId);
        if (!selectedProvince) {
          throw new Error('Province not found');
        }
        
        // Fetch cities from API
        if (window.IranLocationsAPI) {
          cities = await window.IranLocationsAPI.fetchCitiesFromAPI(provinceId);
        } else {
          throw new Error('IranLocationsAPI not available');
        }
        
        // Update placeholder after successful loading
        cityInput.placeholder = 'جستجو و انتخاب شهر';
        
        // Populate city dropdown
        populateCityDropdown(cities);
        console.log(`✅ Cities loaded for province ${selectedProvince.name}:`, cities.length);
        
      } catch (error) {
        console.error(`❌ Error loading cities from API for province ${provinceId}:`, error);
        cityDropdown.innerHTML = '<div class="p-2 text-sm text-red-500">خطا در بارگذاری شهرها</div>';
        
        // Show error message to user
        if (typeof showToast === 'function') {
          showToast('خطا در بارگذاری شهرها. لطفاً دوباره تلاش کنید.', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        }
      }
    }
    
    // Populate city dropdown
    function populateCityDropdown(cityList) {
      if (cityList.length === 0) {
        cityDropdown.innerHTML = '<div class="p-2 text-sm text-gray-500">شهری یافت نشد</div>';
        return;
      }
      
      let html = '';
      cityList.forEach(city => {
        html += `
          <div class="px-3 py-2 hover:bg-[#F3EDF7] cursor-pointer text-sm transition-colors" data-city-id="${city.id}" data-city-name="${city.name}">
            ${city.name}
          </div>
        `;
      });
      
      cityDropdown.innerHTML = html;
      
      // Add click handlers
      cityDropdown.querySelectorAll('[data-city-id]').forEach(item => {
        item.addEventListener('click', () => selectCity(item.dataset.cityId, item.dataset.cityName));
      });
    }
    
    // Filter cities based on search
    function filterCities(cityList, searchTerm) {
      if (!searchTerm) return cityList;
      
      return cityList.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Reset city selection
    function resetCitySelection() {
      selectedCity = null;
      cityInput.value = '';
      cityInput.disabled = true;
      cityInput.classList.add('bg-gray-50');
      cityInput.placeholder = 'ابتدا استان را انتخاب کنید';
      citySelect.value = '';
      cityDropdown.classList.add('hidden');
      cities = [];
      
      console.log('🔄 City selection reset');
    }

    // Select a city
    function selectCity(id, name) {
      selectedCity = { id, name };
      cityInput.value = name;
      citySelect.value = id;
      cityDropdown.classList.add('hidden');
      
      console.log('✅ City selected:', { id, name });
    }
    

    
    // Event listeners for modal controls
    closeAddressModal?.addEventListener('click', closeAddressEditModal);
    cancelAddressEdit?.addEventListener('click', closeAddressEditModal);
    
    // Close modal when clicking backdrop
    editAddressModal?.addEventListener('click', (e) => {
      if (e.target === editAddressModal) {
        closeAddressEditModal();
      }
    });
    
    // Province input handlers
    provinceInput?.addEventListener('focus', () => {
      if (!provinceDropdown.classList.contains('hidden')) return;
      provinceDropdown.classList.remove('hidden');
      populateProvinceDropdown(provinces);
    });
    
    provinceInput?.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      populateProvinceDropdown(provinces);
    });
    
    provinceInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        provinceDropdown.classList.add('hidden');
      }
    });
    
    // City input handlers
    cityInput?.addEventListener('focus', () => {
      if (!selectedProvince) {
        cityDropdown.classList.remove('hidden');
        cityDropdown.innerHTML = '<div class="p-2 text-sm text-gray-500">ابتدا استان را انتخاب کنید</div>';
        return;
      }
      if (!cityDropdown.classList.contains('hidden')) return;
      cityDropdown.classList.remove('hidden');
      populateCityDropdown(cities);
    });
    
    cityInput?.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      const filteredCities = filterCities(cities, searchTerm);
      populateCityDropdown(filteredCities);
    });
    
    cityInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cityDropdown.classList.add('hidden');
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#provinceInput') && !e.target.closest('#provinceDropdown')) {
        provinceDropdown.classList.add('hidden');
      }
      if (!e.target.closest('#cityInput') && !e.target.closest('#cityDropdown')) {
        cityDropdown.classList.add('hidden');
      }
    });
    
    // Province change handler (for form submission and real-time updates)
    provinceSelect?.addEventListener('change', (e) => {
      const provinceId = e.target.value;
      const provinceName = provinces.find(p => p.id == provinceId)?.name;
      
      if (provinceId && provinceName) {
        // Check if this is actually a change
        if (selectedProvince && selectedProvince.id == provinceId) {
          console.log('🔄 Same province selected via select, no need to reload cities');
          return;
        }
        
        // Update selected province
        selectedProvince = { id: provinceId, name: provinceName };
        provinceInput.value = provinceName;
        
        // Reset city selection and prepare for new cities
        selectedCity = null;
        cityInput.value = '';
        cityInput.disabled = false;
        cityInput.classList.remove('bg-gray-50');
        cityInput.placeholder = 'در حال بارگذاری شهرها...';
        cityDropdown.classList.add('hidden');
        
        // Load cities for newly selected province
        loadCities(provinceId);
        
        console.log('🔄 Province changed via select, reloading cities:', { id: provinceId, name: provinceName });
      } else {
        // Reset everything if no province selected
        selectedProvince = null;
        resetCitySelection();
        console.log('🔄 Province deselected, resetting cities');
      }
    });
    
    // Postal code validation
    const postalCodeInput = document.getElementById('postalCodeInput');
    postalCodeInput?.addEventListener('input', (e) => {
      let value = e.target.value;
      
      // Only allow numbers
      value = value.replace(/[^0-9]/g, '');
      
      // Limit to 10 digits
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
      
      e.target.value = value;
      
      // Visual feedback for valid postal code
      if (value.length === 10) {
        e.target.classList.remove('border-red-300');
        e.target.classList.add('border-green-300');
      } else {
        e.target.classList.remove('border-red-300', 'border-green-300');
      }
    });
    
    // Handle form submission
    editAddressForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data from selected values
      const formData = {
        province: selectedProvince?.id || '',
        provinceName: selectedProvince?.name || '',
        city: selectedCity?.id || '',
        cityName: selectedCity?.name || '',
        address: document.getElementById('addressInput').value,
        postalCode: document.getElementById('postalCodeInput').value
      };
      
      console.log('Address form submitted:', formData);
      
      // Validation
      if (!formData.province || !formData.city || !formData.address || !formData.postalCode) {
        if (typeof showToast === 'function') {
          showToast('لطفاً تمام فیلدها را تکمیل کنید', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        } else {
          alert('لطفاً تمام فیلدها را تکمیل کنید');
        }
        return;
      }
      
      // Validate postal code
      if (formData.postalCode.length !== 10) {
        if (typeof showToast === 'function') {
          showToast('کد پستی باید ۱۰ رقم باشد', { 
            icon: 'error', 
            iconClass: 'text-red-400' 
          });
        } else {
          alert('کد پستی باید ۱۰ رقم باشد');
        }
        return;
      }
      
      // Update address in profile
      updateAddressInProfile(formData);
      
      // Show success notification
      showSuccessNotification('آدرس با موفقیت ویرایش شد');
      
      // Close modal
      closeAddressEditModal();
    });
    
    // Show success notification
    function showSuccessNotification(message, duration = 4000) {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
      
      notificationMessage.textContent = message;
      successNotification.classList.remove('translate-x-full');
      successNotification.classList.add('translate-x-0');
      
      console.log('✅ Success notification shown:', message);
      
      // Auto-hide after duration
      notificationTimeout = setTimeout(() => {
        hideSuccessNotification();
      }, duration);
    }
    
    // Hide success notification
    function hideSuccessNotification() {
      successNotification.classList.remove('translate-x-0');
      successNotification.classList.add('translate-x-full');
      
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
      }
      
      console.log('🔔 Success notification hidden');
    }
    
    // Close notification handler
    closeNotification?.addEventListener('click', hideSuccessNotification);
    
    // Update address in profile
    function updateAddressInProfile(data) {
      // Update address text in profile
      const addressElements = document.querySelectorAll('p.text-gray-700.leading-relaxed');
      addressElements.forEach(el => {
        if (el.textContent.includes('تهران، خیابان ولیعصر')) {
          el.textContent = `${data.provinceName}، ${data.cityName}، ${data.address}`;
        }
      });
      
      // Update location info
      const locationElements = document.querySelectorAll('.flex.items-center.gap-1\\.5.text-gray-600');
      locationElements.forEach(el => {
        const locationIcon = el.querySelector('.material-icon');
        if (locationIcon?.textContent === 'location_city') {
          el.innerHTML = `
            <span class="material-icon text-sm">location_city</span>
            ${data.provinceName}، ${data.cityName}
          `;
        } else if (locationIcon?.textContent === 'markunread_mailbox') {
          el.innerHTML = `
            <span class="material-icon text-sm">markunread_mailbox</span>
            <span class="font-mono">${data.postalCode}</span>
          `;
        }
      });
      
      console.log('Address updated in profile:', data);
    }
  });
</script>

<!-- Edit Name Modal -->
<div id="editNameModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-lg text-gray-900">ویرایش نام کامل</h3>
        <button id="closeNameModal" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <span class="material-icon text-gray-600">close</span>
        </button>
      </div>
      
      <form id="editNameForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">نام</label>
          <input type="text" id="firstNameInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6750A4] focus:border-[#6750A4] transition" placeholder="نام خود را وارد کنید" value="علی">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
          <input type="text" id="lastNameInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6750A4] focus:border-[#6750A4] transition" placeholder="نام خانوادگی خود را وارد کنید" value="محمدی">
        </div>
        
        <div class="flex gap-3 pt-4">
          <button type="button" id="cancelNameEdit" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
            انصراف
          </button>
          <button type="submit" class="flex-1 px-4 py-2 bg-[#6750A4] text-white rounded-lg hover:bg-[#5A3F8A] transition font-medium">
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Edit Phone Modal -->
<div id="editPhoneModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-lg text-gray-900">ویرایش شماره موبایل</h3>
        <button id="closePhoneModal" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <span class="material-icon text-gray-600">close</span>
        </button>
      </div>
      
      <form id="editPhoneForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">شماره موبایل فعلی</label>
          <div class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" dir="ltr">09121234567</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">شماره موبایل جدید</label>
          <input type="tel" id="newPhoneInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6750A4] focus:border-[#6750A4] transition" placeholder="شماره موبایل جدید را وارد کنید" maxlength="11" dir="ltr">
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <span class="material-icon text-blue-600 text-sm mt-0.5">info</span>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">توجه:</p>
              <ul class="space-y-1 text-xs">
                <li>• شماره موبایل باید با 09 شروع شود</li>
                <li>• پس از تغییر شماره، کد تایید به شماره جدید ارسال می‌شود</li>
                <li>• برای ورود بعدی باید از شماره جدید استفاده کنید</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button type="button" id="cancelPhoneEdit" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
            انصراف
          </button>
