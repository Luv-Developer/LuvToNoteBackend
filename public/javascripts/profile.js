      document.addEventListener('DOMContentLoaded', function() {
            // Set username from localStorage or default
            document.getElementById('usernameTitle').textContent = `Welcome, ${username}!`;
            
            // Create rating stars
            const ratingStars = document.getElementById('ratingStars');
            const rating = 4.8;
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = 'star fas fa-star';
                
                if (i <= fullStars) {
                    star.classList.add('filled');
                } else if (i === fullStars + 1 && hasHalfStar) {
                    star.className = 'star fas fa-star-half-alt filled';
                }
                
                ratingStars.appendChild(star);
            }
            
            // Create recent notes
            const recentNotes = [
                {
                    title: "Project Meeting Notes",
                    content: "Discussed the new features for the upcoming release. Need to finalize the UI design by Friday.",
                    date: "Today",
                    category: "Work"
                },
                {
                    title: "Shopping List",
                    content: "Milk, Eggs, Bread, Coffee, Fruits, Vegetables, Chicken",
                    date: "Yesterday",
                    category: "Personal"
                },
                {
                    title: "Study Plan - React",
                    content: "Complete hooks section, practice with useEffect, learn React Router",
                    date: "Nov 10",
                    category: "Education"
                },
                {
                    title: "Book Ideas",
                    content: "Science fiction novel about AI ethics. Need to develop characters and plot structure.",
                    date: "Nov 8",
                    category: "Creative"
                }
            ];
            
            const notesContainer = document.getElementById('recentNotes');
            recentNotes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                noteCard.innerHTML = `
                    <h3 class="note-title">${note.title}</h3>
                    <p class="note-content">${note.content}</p>
                    <div class="note-meta">
                        <div class="note-date">
                            <i class="far fa-calendar"></i>
                            ${note.date}
                        </div>
                        <div class="note-category">${note.category}</div>
                    </div>
                `;
                notesContainer.appendChild(noteCard);
            });
            
            // Button click handlers
            const homeBtn = document.querySelector('.btn-home');
            const notesBtn = document.querySelector('.btn-notes');
            const signoutBtn = document.getElementById('signoutBtn');
            
            homeBtn.addEventListener('click', function() {
                animateButton(this);
                setTimeout(() => {
                }, 300);
            });
            
            notesBtn.addEventListener('click', function() {
                animateButton(this);
                setTimeout(() => {
                }, 300);
            });
            
            signoutBtn.addEventListener('click', function() {
                animateButton(this);
                
                // Create confirmation modal
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                `;
                
                modal.innerHTML = `
                    <div style="background: white; padding: 40px; border-radius: 20px; max-width: 400px; text-align: center; animation: slideUp 0.3s ease;">
                        <i class="fas fa-sign-out-alt" style="font-size: 3rem; color: var(--danger); margin-bottom: 20px;"></i>
                        <h2 style="margin-bottom: 10px; color: var(--dark);">Sign Out</h2>
                        <p style="color: var(--gray); margin-bottom: 30px;">Are you sure you want to sign out?</p>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <button id="cancelSignout" style="padding: 12px 30px; background: var(--light); color: var(--gray); border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: var(--transition);">
                                Cancel
                            </button>
                            <button id="confirmSignout" style="padding: 12px 30px; background: var(--danger); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: var(--transition);">
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Add animation keyframes
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
                
                // Modal button handlers
                document.getElementById('cancelSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeIn 0.3s ease reverse';
                    setTimeout(() => modal.remove(), 300);
                });
                
                document.getElementById('confirmSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeIn 0.3s ease reverse';
                    setTimeout(() => {
                        modal.remove();
                        showNotification('Successfully signed out. Redirecting to login...', 'success');
                        setTimeout(() => {
                        }, 2000);
                    }, 300);
                });
            });
            
            // Animate button click
            function animateButton(button) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 300);
            }
            
            // Show notification
            function showNotification(message, type) {
                // Remove existing notification
                const existingNotification = document.querySelector('.notification');
                if (existingNotification) {
                    existingNotification.remove();
                }
                
                // Create notification
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.style.cssText = `
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: ${type === 'success' ? 'var(--secondary)' : 'var(--danger)'};
                    color: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease forwards;
                `;
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                        <span>${message}</span>
                    </div>
                    <button class="notification-close" style="background: none; border: none; color: white; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                document.body.appendChild(notification);
                
                // Close button
                notification.querySelector('.notification-close').addEventListener('click', () => {
                    notification.style.animation = 'slideOutRight 0.3s ease forwards';
                    setTimeout(() => notification.remove(), 300);
                });
                
                // Auto remove after 5 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.animation = 'slideOutRight 0.3s ease forwards';
                        setTimeout(() => notification.remove(), 300);
                    }
                }, 5000);
            }
            
            // Add hover animation to profile cards
            const profileCards = document.querySelectorAll('.profile-card, .info-card, .note-card');
            profileCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                });
            });
            
            // Update stats with animation
            function animateCounter(elementId, finalValue, duration = 2000) {
                const element = document.getElementById(elementId);
                const startValue = 0;
                const increment = finalValue / (duration / 16); // 60fps
                let currentValue = startValue;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        element.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(currentValue);
                    }
                }, 16);
            }
            
            // Start counter animations
            setTimeout(() => {
                animateCounter('totalNotes', 247);
                animateCounter('streakDays', 42);
            }, 1000);
            
            // Add click effect to info items
            const infoValues = document.querySelectorAll('.info-value');
            infoValues.forEach(value => {
                value.style.cursor = 'pointer';
                value.addEventListener('click', function() {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
            });
        });