type="module"
        // Import Firebase functions
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
        import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
        import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyD2WcLwVWvylk6fiEietUSDRp4JG9PnI8o",
            authDomain: "wysd-a7d59.firebaseapp.com",
            projectId: "wysd-a7d59",
            storageBucket: "wysd-a7d59.firebasestorage.app",
            messagingSenderId: "942089219233",
            appId: "1:942089219233:web:4f4a7736325a0602ba94e0",
            measurementId: "G-FHVP7SJQLH"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Admin configuration
        const ADMIN_ACCESS_KEY = "WYSD2025ADMIN#SECURE!";
        const ADMIN_EMAILS = ["admin@wysd2025.com", "superadmin@wysd2025.com"];

        // Mobile navigation functions
        window.toggleMobileMenu = function() {
            const overlay = document.getElementById('mobileNavOverlay');
            const menu = document.getElementById('mobileNavMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (!overlay || !menu || !toggle) return;
            
            overlay.classList.add('active');
            menu.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            
            const firstMenuItem = menu.querySelector('a[role="menuitem"]');
            if (firstMenuItem) firstMenuItem.focus();
        };

        window.closeMobileMenu = function() {
            const overlay = document.getElementById('mobileNavOverlay');
            const menu = document.getElementById('mobileNavMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (!overlay || !menu || !toggle) return;
            
            overlay.classList.remove('active');
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            toggle.focus();
        };

        // Tab switching function
        window.switchLoginTab = function(type) {
            const userForm = document.getElementById('userLoginForm');
            const adminForm = document.getElementById('adminLoginForm');
            const tabs = document.querySelectorAll('.login-tab');

            tabs.forEach(tab => tab.classList.remove('active'));

            if (type === 'user') {
                userForm.style.display = 'block';
                adminForm.style.display = 'none';
                tabs[0].classList.add('active');
            } else {
                userForm.style.display = 'none';
                adminForm.style.display = 'block';
                tabs[1].classList.add('active');
            }

            // Clear any existing alerts when switching tabs
            document.getElementById('alertContainer').innerHTML = '';
        };

        // Alert system
        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alertContainer');
            alertContainer.innerHTML = `<div class="alert ${type}">${message}</div>`;
            
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }

        // User login handler
        document.getElementById('userLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            if (!email || !password) {
                showAlert('❌ Please fill in all fields.', 'error');
                return;
            }

            try {
                submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Logging in...</div>';
                submitBtn.disabled = true;

                await signInWithEmailAndPassword(auth, email, password);
                
                // Store user session
                localStorage.setItem('wysd_user', JSON.stringify({
                    email: email,
                    role: 'user',
                    loginTime: new Date().toISOString()
                }));

                showAlert('✅ Login successful! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);

            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email. Please register first.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed attempts. Please try again later.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showAlert('❌ ' + errorMessage, 'error');
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });

        // Admin login handler
        document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;
            const adminKey = document.getElementById('adminKey').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            if (!email || !password || !adminKey) {
                showAlert('❌ Please fill in all fields.', 'error');
                return;
            }

            if (!ADMIN_EMAILS.includes(email)) {
                showAlert('❌ Invalid admin email address.', 'error');
                return;
            }

            if (adminKey !== ADMIN_ACCESS_KEY) {
                showAlert('❌ Invalid admin access key.', 'error');
                return;
            }

            try {
                submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Authenticating...</div>';
                submitBtn.disabled = true;

                await signInWithEmailAndPassword(auth, email, password);

                // Store admin role
                await setDoc(doc(db, 'user_roles', auth.currentUser.uid), {
                    email: email,
                    role: 'admin',
                    verified: true,
                    loginTime: new Date().toISOString()
                });

                // Store admin session
                localStorage.setItem('wysd_user', JSON.stringify({
                    email: email,
                    role: 'admin',
                    loginTime: new Date().toISOString()
                }));

                showAlert('🔧 Admin login successful! Redirecting to admin panel...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);

            } catch (error) {
                console.error('Admin login error:', error);
                let errorMessage = 'Admin login failed. Please check your credentials.';
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Admin account not found. Please contact system administrator.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect admin password. Please try again.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid admin email address.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed attempts. Please try again later.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showAlert('❌ ' + errorMessage, 'error');
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Mobile menu event listeners
            document.addEventListener('click', function(e) {
                const menu = document.getElementById('mobileNavMenu');
                const toggle = document.querySelector('.mobile-menu-toggle');
                
                if (menu && menu.classList.contains('open') && 
                    !menu.contains(e.target) && 
                    toggle && !toggle.contains(e.target)) {
                    closeMobileMenu();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const menu = document.getElementById('mobileNavMenu');
                    if (menu && menu.classList.contains('open')) {
                        closeMobileMenu();
                    }
                }
            });

            const mobileMenu = document.getElementById('mobileNavMenu');
            if (mobileMenu) {
                mobileMenu.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }

            const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', function() {
                    setTimeout(closeMobileMenu, 100);
                });
            });

            // Check if user is already logged in
            const existingUser = localStorage.getItem('wysd_user');
            if (existingUser) {
                try {
                    const userData = JSON.parse(existingUser);
                    if (userData.role === 'admin') {
                        showAlert('ℹ️ You are already logged in as admin. Redirecting...', 'warning');
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 2000);
                    } else {
                        showAlert('ℹ️ You are already logged in. Redirecting to dashboard...', 'success');
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    }
                } catch (e) {
                    // Invalid session data, remove it
                    localStorage.removeItem('wysd_user');
                }
            }

            // Form validation for better UX
            const userEmailInput = document.getElementById('userEmail');
            const adminEmailInput = document.getElementById('adminEmail');

            function validateEmail(input) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (input.value && !emailRegex.test(input.value)) {
                    input.classList.add('error');
                    input.classList.remove('success');
                } else if (input.value) {
                    input.classList.add('success');
                    input.classList.remove('error');
                } else {
                    input.classList.remove('error', 'success');
                }
            }

            if (userEmailInput) {
                userEmailInput.addEventListener('blur', () => validateEmail(userEmailInput));
            }

            if (adminEmailInput) {
                adminEmailInput.addEventListener('blur', () => validateEmail(adminEmailInput));
            }
        });

        // Error handling for network issues
        window.addEventListener('error', function(e) {
            console.error('Page error:', e.error);
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Login page load time: ${loadTime}ms`);
            });
        }

        // Demo credentials helper (for testing purposes)
        window.fillDemoCredentials = function(type) {
            if (type === 'user') {
                document.getElementById('userEmail').value = 'demo@wysd2025.com';
                document.getElementById('userPassword').value = 'demo123';
                showAlert('ℹ️ Demo credentials filled. Note: Create this account first via registration.', 'warning');
            } else if (type === 'admin') {
                document.getElementById('adminEmail').value = 'admin@wysd2025.com';
                document.getElementById('adminPassword').value = 'admin123';
                document.getElementById('adminKey').value = 'WYSD2025ADMIN#SECURE!';
                showAlert('ℹ️ Demo admin credentials filled. Note: Create this account first.', 'warning');
            }
        };

        // Add demo buttons for testing (remove in production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                const userForm = document.getElementById('userLoginForm');
                const adminForm = document.getElementById('adminLoginForm');
                
                if (userForm) {
                    const demoUserBtn = document.createElement('button');
                    demoUserBtn.type = 'button';
                    demoUserBtn.className = 'btn secondary';
                    demoUserBtn.style.marginTop = '1rem';
                    demoUserBtn.innerHTML = '🧪 Fill Demo User Credentials';
                    demoUserBtn.onclick = () => fillDemoCredentials('user');
                    userForm.appendChild(demoUserBtn);
                }
                
                if (adminForm) {
                    const demoAdminBtn = document.createElement('button');
                    demoAdminBtn.type = 'button';
                    demoAdminBtn.className = 'btn secondary';
                    demoAdminBtn.style.marginTop = '1rem';
                    demoAdminBtn.innerHTML = '🧪 Fill Demo Admin Credentials';
                    demoAdminBtn.onclick = () => fillDemoCredentials('admin');
                    adminForm.appendChild(demoAdminBtn);
                }
            }, 1000);
        }