    type="module"
        // Import Firebase functions
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
        import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
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

        // Alert system
        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alertContainer');
            alertContainer.innerHTML = `<div class="alert ${type}">${message}</div>`;
            
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }

        // Success message display
        function showSuccessMessage(userName) {
            document.getElementById('registerContainer').innerHTML = `
                <div class="form-content">
                    <div class="success-message">
                        <h2>🎉 Registration Successful!</h2>
                        <p>Welcome, <strong>${userName}</strong>! Your account has been created successfully.</p>
                        <p>You can now access your dashboard and prepare for the assessment on July 15th, 2025.</p>
                        <div class="success-actions">
                            <a href="dashboard.html" class="btn success">📊 Go to Dashboard</a>
                            <a href="test.html" class="btn secondary">📝 View Assessment</a>
                            <a href="leaderboard.html" class="btn primary">🏆 View Leaderboard</a>
                        </div>
                        <div class="success-info">
                            <small>
                                📧 Your account has been created successfully.<br>
                                🎯 The skills assessment will be available on July 15th, 2025.<br>
                                🔐 You are now logged in and can access all features.
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }

        // Form validation
        function validateRegistrationData(data) {
            if (data.name.length < 2) {
                showAlert('❌ Name must be at least 2 characters long.', 'error');
                return false;
            }

            if (data.age < 1 || data.age > 100) {
                showAlert('❌ Please enter a valid age between 1 and 100.', 'error');
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showAlert('❌ Please enter a valid email address.', 'error');
                return false;
            }

            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
                showAlert('❌ Please enter a valid phone number.', 'error');
                return false;
            }

            if (data.password.length < 6) {
                showAlert('❌ Password must be at least 6 characters long.', 'error');
                return false;
            }

            if (data.password !== data.confirmPassword) {
                showAlert('❌ Passwords do not match.', 'error');
                return false;
            }

            return true;
        }

        // Real-time form validation
        function setupFormValidation() {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            const email = document.getElementById('email');

            if (confirmPassword) {
                confirmPassword.addEventListener('input', function() {
                    if (this.value && password.value !== this.value) {
                        this.classList.add('error');
                        this.classList.remove('success');
                    } else if (this.value && password.value === this.value) {
                        this.classList.add('success');
                        this.classList.remove('error');
                    } else {
                        this.classList.remove('error', 'success');
                    }
                });
            }

            if (email) {
                email.addEventListener('blur', function() {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (this.value && !emailRegex.test(this.value)) {
                        this.classList.add('error');
                        this.classList.remove('success');
                    } else if (this.value) {
                        this.classList.add('success');
                        this.classList.remove('error');
                    } else {
                        this.classList.remove('error', 'success');
                    }
                });
            }
        }

        // Registration form handler
        document.getElementById('registrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                age: parseInt(document.getElementById('age').value),
                email: document.getElementById('email').value.trim().toLowerCase(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            if (!validateRegistrationData(formData)) {
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            try {
                submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Registering...</div>';
                submitBtn.disabled = true;

                // Create user account with Firebase
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Save additional user data to Firestore
                await setDoc(doc(db, 'registrations', user.uid), {
                    uid: user.uid,
                    name: formData.name,
                    age: formData.age,
                    email: formData.email,
                    phone: formData.phone,
                    registrationDate: new Date().toISOString(),
                    hasCompletedTest: false,
                    role: 'user'
                });

                // Store user session
                localStorage.setItem('wysd_user', JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    role: 'user',
                    loginTime: new Date().toISOString()
                }));

                showSuccessMessage(formData.name);
                showAlert('✅ Registration successful! You are now logged in.', 'success');

            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Registration failed. Please try again.';
                
                // Handle specific Firebase errors
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'An account with this email already exists. Please try logging in instead.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
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
            // Setup form validation
            setupFormValidation();

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
                    showAlert('ℹ️ You are already logged in. Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } catch (e) {
                    // Invalid session data, remove it
                    localStorage.removeItem('wysd_user');
                }
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
                console.log(`Registration page load time: ${loadTime}ms`);
            });
        }