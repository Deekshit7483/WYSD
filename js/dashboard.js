     type="module"
        // Import Firebase functions
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
        import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
        import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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

        // BULLETPROOF Mobile navigation functions
        window.toggleMobileMenu = function() {
            console.log('🍔 HAMBURGER CLICKED - Mobile menu toggle initiated');
            
            const overlay = document.getElementById('mobileNavOverlay');
            const menu = document.getElementById('mobileNavMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            console.log('🔍 Element check:', {
                overlay: overlay ? 'FOUND' : 'MISSING',
                menu: menu ? 'FOUND' : 'MISSING',
                toggle: toggle ? 'FOUND' : 'MISSING'
            });
            
            if (!overlay || !menu || !toggle) {
                console.error('❌ CRITICAL: Mobile menu elements missing!');
                alert('Mobile navigation error: Elements not found');
                return;
            }
            
            // FORCE show overlay and menu with multiple methods
            overlay.style.display = 'block';
            overlay.style.visibility = 'visible';
            overlay.style.opacity = '1';
            overlay.classList.add('active');
            
            menu.style.right = '0';
            menu.classList.add('open');
            
            toggle.setAttribute('aria-expanded', 'true');
            
            // Lock body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            console.log('✅ Mobile menu FORCED open - all methods applied');
            
            // Focus management
            setTimeout(() => {
                const firstLink = menu.querySelector('a[role="menuitem"]');
                if (firstLink) {
                    firstLink.focus();
                    console.log('👍 Focus set to first menu item');
                }
            }, 150);
        };

        window.closeMobileMenu = function() {
            console.log('❌ CLOSE MOBILE MENU - Close sequence initiated');
            
            const overlay = document.getElementById('mobileNavOverlay');
            const menu = document.getElementById('mobileNavMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                overlay.classList.remove('active');
            }
            
            if (menu) {
                menu.style.right = '-100%';
                menu.classList.remove('open');
            }
            
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            console.log('✅ Mobile menu CLOSED - all cleanup applied');
            
            // Return focus
            if (toggle) {
                setTimeout(() => toggle.focus(), 100);
            }
        };

        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alertContainer');
            const alertId = 'alert_' + Date.now();
            
            const alert = document.createElement('div');
            alert.id = alertId;
            alert.className = `alert ${type}`;
            
            const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
            alert.innerHTML = `${icon} ${message}`;
            
            alertContainer.appendChild(alert);
            
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    alertElement.style.opacity = '0';
                    alertElement.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        alertElement.remove();
                    }, 300);
                }
            }, 5000);
        }

        function hideLoadingScreen() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }

        function redirectToLogin() {
            showAlert('⚠️ Please login to access your dashboard.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }

        // Generate user avatar initial
        function generateAvatar(name) {
            const initial = name ? name.charAt(0).toUpperCase() : 'U';
            const avatarElements = [
                document.getElementById('userAvatar'),
                document.getElementById('mobileUserAvatar')
            ];
            
            avatarElements.forEach(element => {
                if (element) {
                    element.textContent = initial;
                }
            });
        }

        // Format time display
        function formatTime(seconds) {
            if (!seconds) return '--';
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (minutes > 0) {
                return `${minutes}m ${remainingSeconds}s`;
            } else {
                return `${remainingSeconds}s`;
            }
        }

        // Update progress bars with animation
        function updateProgressBar(elementId, percentage) {
            const progressBar = document.getElementById(elementId);
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.width = percentage + '%';
                }, 500);
            }
        }

        // SIMPLIFIED Authentication check
        onAuthStateChanged(auth, async (user) => {
            console.log('🔐 Auth state changed:', user ? 'LOGGED IN' : 'LOGGED OUT');
            
            if (user) {
                console.log('✅ User authenticated:', user.email);
                
                const userSession = localStorage.getItem('wysd_user');
                if (userSession) {
                    try {
                        const userData = JSON.parse(userSession);
                        await loadUserDashboardData(user);
                        hideLoadingScreen();
                    } catch (e) {
                        console.error('❌ Invalid session data:', e);
                        localStorage.removeItem('wysd_user');
                        redirectToLogin();
                    }
                } else {
                    redirectToLogin();
                }
            } else {
                console.log('⚠️ No user authenticated');
                redirectToLogin();
            }
        });

        // FIXED Load comprehensive user dashboard data
        async function loadUserDashboardData(currentUser) {
            console.log('📊 Loading dashboard data for:', currentUser.email);
            
            try {
                // Step 1: Get user registration data (simplified query)
                console.log('🔍 Fetching user registration data...');
                const userQuery = query(collection(db, 'registrations'), where('uid', '==', currentUser.uid));
                const userSnapshot = await getDocs(userQuery);
                
                let userData = null;
                if (!userSnapshot.empty) {
                    userData = userSnapshot.docs[0].data();
                    console.log('✅ User data found:', userData.name || 'Anonymous');
                } else {
                    console.log('⚠️ No user registration data found');
                }
                
                const userName = userData ? userData.name : currentUser.email.split('@')[0];
                
                // Step 2: Update user info in all locations
                console.log('🔄 Updating user interface...');
                const userNameElements = [
                    document.getElementById('userName'),
                    document.getElementById('mobileUserName'),
                    document.getElementById('welcomeUserName')
                ];
                
                userNameElements.forEach(element => {
                    if (element) {
                        element.textContent = userName;
                    }
                });
                
                generateAvatar(userName);
                
                // Step 3: Get test results (simplified query without orderBy)
                console.log('🔍 Fetching test results...');
                const testQuery = query(collection(db, 'test_results'), where('uid', '==', currentUser.uid));
                const testSnapshot = await getDocs(testQuery);
                
                let bestScore = 0;
                let bestTime = null;
                let testCount = testSnapshot.size;
                let latestTest = null;
                
                console.log(`📊 Found ${testCount} test results`);
                
                if (!testSnapshot.empty) {
                    // Process all test results manually
                    const testResults = [];
                    testSnapshot.forEach(doc => {
                        testResults.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    // Sort by completion date (manually)
                    testResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                    
                    latestTest = testResults[0];
                    
                    // Find best scores
                    testResults.forEach(test => {
                        if (test.percentage > bestScore) {
                            bestScore = test.percentage;
                        }
                        if (!bestTime || test.timeTaken < bestTime) {
                            bestTime = test.timeTaken;
                        }
                    });
                    
                    console.log(`🏆 Best score: ${bestScore}%, Best time: ${bestTime}s`);
                }
                
                // Step 4: Calculate rank (simplified approach)
                let userRank = '--';
                if (userData && userData.hasCompletedTest) {
                    try {
                        console.log('🔍 Calculating user rank...');
                        const allResultsQuery = query(collection(db, 'test_results'));
                        const allResultsSnapshot = await getDocs(allResultsQuery);
                        
                        const allResults = [];
                        allResultsSnapshot.forEach(doc => {
                            allResults.push({
                                uid: doc.data().uid,
                                percentage: doc.data().percentage,
                                timeTaken: doc.data().timeTaken
                            });
                        });
                        
                        // Sort manually by percentage (desc), then by time (asc)
                        allResults.sort((a, b) => {
                            if (a.percentage !== b.percentage) {
                                return b.percentage - a.percentage;
                            }
                            return a.timeTaken - b.timeTaken;
                        });
                        
                        const rank = allResults.findIndex(result => result.uid === currentUser.uid) + 1;
                        userRank = rank > 0 ? '#' + rank : '--';
                        
                        console.log(`🏅 User rank: ${userRank}`);
                    } catch (rankError) {
                        console.warn('⚠️ Could not calculate rank:', rankError);
                        userRank = '--';
                    }
                }
                
                // Step 5: Update all dashboard elements
                console.log('🎨 Updating dashboard display...');
                updateDashboardDisplay({
                    userData,
                    bestScore,
                    bestTime,
                    userRank,
                    testCount,
                    latestTest
                });
                
                // Step 6: Update activity feed
                updateActivityFeed(userData, testSnapshot);
                
                console.log('✅ Dashboard loaded successfully!');
                showAlert('✅ Dashboard loaded successfully!', 'success');
                
            } catch (error) {
                console.error('💥 Error loading dashboard data:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
                
                // Show a more helpful error message
                let errorMessage = 'Error loading dashboard data.';
                if (error.message.includes('permission')) {
                    errorMessage = 'Permission denied. Please check your account access.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                }
                
                showAlert(`❌ ${errorMessage}`, 'error');
                
                // Still show basic user info even if data loading fails
                const userNameElements = [
                    document.getElementById('userName'),
                    document.getElementById('mobileUserName'),
                    document.getElementById('welcomeUserName')
                ];
                
                const fallbackName = currentUser.email.split('@')[0];
                userNameElements.forEach(element => {
                    if (element) {
                        element.textContent = fallbackName;
                    }
                });
                
                generateAvatar(fallbackName);
            }
        }

        // Update dashboard display
        function updateDashboardDisplay(data) {
            const {
                userData,
                bestScore,
                bestTime,
                userRank,
                testCount,
                latestTest
            } = data;
            
            // Update welcome stats
            const elements = {
                welcomeTestStatus: document.getElementById('welcomeTestStatus'),
                welcomeScore: document.getElementById('welcomeScore'),
                welcomeRank: document.getElementById('welcomeRank'),
                scoreCard: document.getElementById('scoreCard'),
                rankCard: document.getElementById('rankCard'),
                timeCard: document.getElementById('timeCard'),
                statusCard: document.getElementById('statusCard'),
                statusText: document.getElementById('statusText')
            };
            
            // Welcome section
            if (elements.welcomeTestStatus) {
                elements.welcomeTestStatus.textContent = userData && userData.hasCompletedTest ? 'COMPLETED' : 'PENDING';
            }
            if (elements.welcomeScore) {
                elements.welcomeScore.textContent = bestScore ? bestScore + '%' : '--';
            }
            if (elements.welcomeRank) {
                elements.welcomeRank.textContent = userRank;
            }
            
            // Performance cards
            if (elements.scoreCard) {
                elements.scoreCard.textContent = bestScore ? bestScore + '%' : '--';
            }
            if (elements.rankCard) {
                elements.rankCard.textContent = userRank;
            }
            if (elements.timeCard) {
                elements.timeCard.textContent = formatTime(bestTime);
            }
            
            // Status card
            if (elements.statusCard && elements.statusText) {
                if (userData && userData.hasCompletedTest) {
                    elements.statusText.textContent = 'COMPLETED';
                    elements.statusCard.className = 'performance-card';
                } else {
                    elements.statusText.textContent = 'READY';
                    elements.statusCard.className = 'performance-card warning';
                }
            }
            
            // Progress bars
            const mathSkillsProgress = Math.min(bestScore, 100);
            const speedProgress = bestTime ? Math.max(0, 100 - (bestTime / 300 * 100)) : 0;
            const overallProgress = (mathSkillsProgress + speedProgress) / 2;
            
            const progressElements = {
                mathProgress: document.getElementById('mathProgress'),
                speedProgress: document.getElementById('speedProgress'),
                overallProgress: document.getElementById('overallProgress')
            };
            
            if (progressElements.mathProgress) {
                progressElements.mathProgress.textContent = mathSkillsProgress + '%';
            }
            if (progressElements.speedProgress) {
                progressElements.speedProgress.textContent = Math.round(speedProgress) + '%';
            }
            if (progressElements.overallProgress) {
                progressElements.overallProgress.textContent = Math.round(overallProgress) + '%';
            }
            
            updateProgressBar('mathProgressBar', mathSkillsProgress);
            updateProgressBar('speedProgressBar', speedProgress);
            updateProgressBar('overallProgressBar', overallProgress);
        }

        // Update activity feed
        function updateActivityFeed(userData, testSnapshot) {
            const activityFeed = document.getElementById('activityFeed');
            if (!activityFeed) return;
            
            let activities = [];
            
            // Registration activity
            activities.push({
                icon: '🎯',
                title: 'Welcome to WYSD 2025!',
                time: userData && userData.registrationDate 
                    ? 'Registered on ' + new Date(userData.registrationDate).toLocaleDateString()
                    : 'Account created'
            });
            
            // Test activities
            if (!testSnapshot.empty) {
                const testResults = [];
                testSnapshot.forEach(doc => {
                    testResults.push(doc.data());
                });
                
                // Sort by completion date
                testResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                
                testResults.forEach(data => {
                    const percentage = data.percentage;
                    let icon = '📝';
                    let title = `Completed assessment with ${percentage}% score`;
                    
                    if (percentage >= 90) {
                        icon = '🏆';
                        title = `Excellent performance: ${percentage}%!`;
                    } else if (percentage >= 80) {
                        icon = '⭐';
                        title = `Great achievement: ${percentage}% score!`;
                    }
                    
                    activities.push({
                        icon: icon,
                        title: title,
                        time: new Date(data.completedAt).toLocaleDateString()
                    });
                });
            }
            
            // Limit to 5 most recent activities
            activities = activities.slice(0, 5);
            
            activityFeed.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }

        // Show user profile
        window.showUserProfile = async function() {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                showAlert('⚠️ Please login first.', 'error');
                return;
            }

            try {
                console.log('👤 Loading user profile...');
                const userQuery = query(collection(db, 'registrations'), where('uid', '==', currentUser.uid));
                const userDoc = await getDocs(userQuery);
                
                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    const html = `
                        <div class="dashboard-section full-width-section">
                            <div class="section-header">
                                <div class="section-icon">👤</div>
                                <div class="section-title">
                                    <h3>Your Profile Information</h3>
                                    <p>View and manage your account details</p>
                                </div>
                            </div>
                            <div class="data-table">
                                <table>
                                    <tr><th>Full Name</th><td>${userData.name || 'Not provided'}</td></tr>
                                    <tr><th>Email Address</th><td>${userData.email || currentUser.email}</td></tr>
                                    <tr><th>Age</th><td>${userData.age ? userData.age + ' years old' : 'Not provided'}</td></tr>
                                    <tr><th>Phone Number</th><td>${userData.phone || 'Not provided'}</td></tr>
                                    <tr><th>Registration Date</th><td>${userData.registrationDate ? new Date(userData.registrationDate).toLocaleDateString() : 'Unknown'}</td></tr>
                                    <tr><th>Assessment Status</th><td>${userData.hasCompletedTest ? '✅ Completed' : '⏳ Pending'}</td></tr>
                                    <tr><th>Best Score</th><td>${userData.lastScore ? userData.lastScore + '%' : 'Not taken yet'}</td></tr>
                                </table>
                            </div>
                            <div style="margin-top: 2rem; text-align: center;">
                                <button class="btn secondary" onclick="hideProfile()">Close Profile</button>
                                <button class="btn success" onclick="showUserResults()">View Test History</button>
                            </div>
                        </div>
                    `;
                    document.getElementById('userDataView').innerHTML = html;
                    document.getElementById('userDataView').scrollIntoView({ behavior: 'smooth' });
                } else {
                    showAlert('❌ Profile not found.', 'error');
                }
            } catch (error) {
                console.error('❌ Error loading profile:', error);
                showAlert('❌ Error loading profile.', 'error');
            }
        };

        // Hide profile
        window.hideProfile = function() {
            const userDataView = document.getElementById('userDataView');
            if (userDataView) {
                userDataView.innerHTML = '';
            }
        };

        // Show user results
        window.showUserResults = async function() {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                showAlert('⚠️ Please login first.', 'error');
                return;
            }

            try {
                console.log('📊 Loading test results...');
                const testQuery = query(collection(db, 'test_results'), where('uid', '==', currentUser.uid));
                const snapshot = await getDocs(testQuery);
                
                let html = `
                    <div class="dashboard-section full-width-section">
                        <div class="section-header">
                            <div class="section-icon">📊</div>
                            <div class="section-title">
                                <h3>Your Assessment History</h3>
                                <p>Complete record of all your test attempts</p>
                            </div>
                        </div>
                `;
                
                if (snapshot.empty) {
                    html += `
                        <div style="text-align: center; padding: 3rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">No Assessments Taken Yet</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 2rem;">You haven't taken any assessments yet. Ready to showcase your skills?</p>
                            <a href="test.html" class="btn success">Take Your First Assessment</a>
                        </div>
                    `;
                } else {
                    // Process and sort results manually
                    const testResults = [];
                    snapshot.forEach(doc => {
                        testResults.push(doc.data());
                    });
                    
                    // Sort by completion date (newest first)
                    testResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                    
                    html += `
                        <div class="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Score</th>
                                        <th>Percentage</th>
                                        <th>Time Taken</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    testResults.forEach(data => {
                        let performanceIcon = '📚';
                        let performanceText = 'Good effort';
                        
                        if (data.percentage >= 90) {
                            performanceIcon = '🏆';
                            performanceText = 'Excellent';
                        } else if (data.percentage >= 80) {
                            performanceIcon = '⭐';
                            performanceText = 'Great';
                        } else if (data.percentage >= 70) {
                            performanceIcon = '👍';
                            performanceText = 'Good';
                        }
                        
                        html += `
                            <tr>
                                <td>${new Date(data.completedAt).toLocaleString()}</td>
                                <td><strong>${data.score}/${data.totalQuestions}</strong></td>
                                <td><strong style="color: var(--primary-color);">${data.percentage}%</strong></td>
                                <td>${formatTime(data.timeTaken)}</td>
                                <td>${performanceIcon} ${performanceText}</td>
                            </tr>
                        `;
                    });
                    
                    html += '</tbody></table></div>';
                }
                
                html += `
                        <div style="margin-top: 2rem; text-align: center;">
                            <button class="btn secondary" onclick="hideProfile()">Close Results</button>
                            <a href="test.html" class="btn success">Take Another Assessment</a>
                        </div>
                    </div>
                `;
                
                document.getElementById('userDataView').innerHTML = html;
                document.getElementById('userDataView').scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('❌ Error loading test results:', error);
                showAlert('❌ Error loading test results.', 'error');
            }
        };

        // Enhanced logout function
        window.logout = function() {
            if (confirm('Are you sure you want to logout?')) {
                signOut(auth).then(() => {
                    localStorage.removeItem('wysd_user');
                    closeMobileMenu(); // Close mobile menu if open
                    showAlert('✅ Logged out successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }).catch((error) => {
                    console.error('Logout error:', error);
                    showAlert('❌ Error logging out.', 'error');
                });
            }
        };

        // BULLETPROOF mobile navigation event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 DOM LOADED - Initializing BULLETPROOF mobile navigation');
            
            // Get all elements
            const overlay = document.getElementById('mobileNavOverlay');
            const menu = document.getElementById('mobileNavMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            const closeBtn = document.querySelector('.mobile-close-btn');
            
            console.log('📋 COMPREHENSIVE element check:', {
                overlay: overlay ? '✅ FOUND' : '❌ MISSING',
                menu: menu ? '✅ FOUND' : '❌ MISSING',
                toggle: toggle ? '✅ FOUND' : '❌ MISSING',
                closeBtn: closeBtn ? '✅ FOUND' : '❌ MISSING'
            });
            
            // Force initial state
            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                overlay.classList.remove('active');
                console.log('🔧 Overlay reset to hidden state');
            }
            
            if (menu) {
                menu.style.right = '-100%';
                menu.classList.remove('open');
                console.log('🔧 Menu reset to closed state');
            }
            
            // HAMBURGER BUTTON - Multiple event types for maximum compatibility
            if (toggle) {
                console.log('🍔 Setting up hamburger button events...');
                
                // Method 1: Standard click
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ CLICK event triggered on hamburger');
                    toggleMobileMenu();
                });
                
                // Method 2: Touch events
                toggle.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👆 TOUCHSTART event triggered on hamburger');
                });
                
                toggle.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👆 TOUCHEND event triggered on hamburger');
                    toggleMobileMenu();
                });
                
                // Method 3: Pointer events
                toggle.addEventListener('pointerup', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👆 POINTERUP event triggered on hamburger');
                    toggleMobileMenu();
                });
                
                // Method 4: Mouse events
                toggle.addEventListener('mouseup', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ MOUSEUP event triggered on hamburger');
                    toggleMobileMenu();
                });
                
                console.log('✅ Hamburger button - ALL event types attached');
            } else {
                console.error('❌ FATAL: Hamburger button not found in DOM!');
                // Create emergency hamburger button
                const nav = document.querySelector('nav');
                if (nav) {
                    const emergencyToggle = document.createElement('button');
                    emergencyToggle.className = 'mobile-menu-toggle';
                    emergencyToggle.innerHTML = '☰';
                    emergencyToggle.onclick = toggleMobileMenu;
                    nav.appendChild(emergencyToggle);
                    console.log('🚑 Emergency hamburger button created');
                }
            }
            
            // CLOSE BUTTON events
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ Close button CLICKED');
                    closeMobileMenu();
                });
                
                closeBtn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ Close button TOUCHED');
                    closeMobileMenu();
                });
                
                console.log('✅ Close button events attached');
            }
            
            // OVERLAY click to close
            if (overlay) {
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        console.log('🎯 Overlay clicked - closing menu');
                        closeMobileMenu();
                    }
                });
                
                overlay.addEventListener('touchend', function(e) {
                    if (e.target === overlay) {
                        console.log('🎯 Overlay touched - closing menu');
                        closeMobileMenu();
                    }
                });
            }
            
            // ESCAPE key handler
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
                    console.log('⌨️ Escape key pressed - closing menu');
                    closeMobileMenu();
                }
            });
            
            // PREVENT menu close on inside click
            if (menu) {
                menu.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('📱 Menu inside click - prevented close');
                });
            }
            
            // MOBILE LINK handlers
            const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
            console.log(`🔗 Found ${mobileLinks.length} mobile navigation links`);
            
            mobileLinks.forEach((link, index) => {
                link.addEventListener('click', function(e) {
                    console.log(`🔗 Mobile link ${index + 1} clicked: ${link.textContent.trim()}`);
                    setTimeout(() => {
                        closeMobileMenu();
                    }, 100);
                });
            });
            
            console.log('🎉 BULLETPROOF mobile navigation setup COMPLETE!');
            
            // TEST function for debugging
            window.testMobileMenu = function() {
                console.log('🧪 TESTING mobile menu functionality...');
                console.log('Current state:', {
                    overlayVisible: overlay ? overlay.style.display : 'N/A',
                    menuPosition: menu ? menu.style.right : 'N/A',
                    toggleExists: !!toggle
                });
                
                if (toggle) {
                    console.log('🔧 Manually triggering toggle...');
                    toggleMobileMenu();
                } else {
                    console.log('❌ No toggle button found for testing');
                }
            };
            
            // Debug info
            console.log('📱 Mobile navigation debug info:', {
                windowWidth: window.innerWidth,
                isMobile: window.innerWidth <= 768,
                toggleVisible: toggle ? window.getComputedStyle(toggle).display : 'N/A',
                overlayZIndex: overlay ? window.getComputedStyle(overlay).zIndex : 'N/A',
                menuZIndex: menu ? window.getComputedStyle(menu).zIndex : 'N/A'
            });
        });

        // Error handling for missing elements
        window.addEventListener('error', function(e) {
            console.error('Dashboard error:', e.error);
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Dashboard load time: ${loadTime}ms`);
            });
        }