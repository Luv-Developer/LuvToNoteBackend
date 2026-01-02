        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const editNoteForm = document.getElementById('editNoteForm');
            const noteTitle = document.getElementById('noteTitle');
            const noteContent = document.getElementById('noteContent');
            const titleCount = document.getElementById('titleCount');
            const contentCount = document.getElementById('contentCount');
            const categoryOptions = document.querySelectorAll('.category-option');
            const saveBtn = document.getElementById('saveBtn');
            const previewPlaceholder = document.getElementById('previewPlaceholder');
            const notePreview = document.getElementById('notePreview');
            const previewTitle = document.getElementById('previewTitle');
            const previewCategory = document.getElementById('previewCategory');
            const previewDate = document.getElementById('previewDate');
            const previewContent = document.getElementById('previewContent');
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notificationMessage');
            
            // Navigation buttons
            const allNotesBtn = document.getElementById('allNotesBtn');
            const profileBtn = document.getElementById('profileBtn');
            const signoutBtn = document.getElementById('signoutBtn');
            
            // Initialize
            let selectedCategory = 'work';
            updateCategorySelection();
            updateCharacterCounts();
            setupEventListeners();
            
            // Simulate loading existing note data
            simulateLoadNoteData();
            
            function simulateLoadNoteData() {
                // In a real app, you would fetch this from your database
                setTimeout(() => {
                    noteTitle.value = "Project Meeting Notes - Q4 Planning";
                    noteContent.value = "Discussed the roadmap for Q4 2023. Key points:\n\n• Launch new dashboard feature by Nov 30\n• Improve mobile responsiveness\n• Add dark mode support\n• Team will meet weekly on Mondays at 10 AM\n\nAdditional notes:\nNeed to follow up with design team about the new UI components.";
                    selectedCategory = 'work';
                    
                    updateCategorySelection();
                    updateCharacterCounts();
                    updatePreview();
                    
                    // Show success notification
                    showNotification('Note loaded successfully', 'success');
                }, 1000);
            }
            
            function setupEventListeners() {
                // Character count updates
                noteTitle.addEventListener('input', updateCharacterCounts);
                noteContent.addEventListener('input', updateCharacterCounts);
                
                // Live preview updates
                noteTitle.addEventListener('input', updatePreview);
                noteContent.addEventListener('input', updatePreview);
                
                // Category selection
                categoryOptions.forEach(option => {
                    option.addEventListener('click', function() {
                        selectedCategory = this.getAttribute('data-category');
                        updateCategorySelection();
                        updatePreview();
                    });
                });
                
                // Form submission
                editNoteForm.addEventListener('submit', function(e) {
                    saveChanges();
                });
                
                // Navigation buttons
                allNotesBtn.addEventListener('click', () => navigateTo('all-notes'));
                profileBtn.addEventListener('click', () => navigateTo('profile'));
                signoutBtn.addEventListener('click', () => showSignoutConfirmation());
                
                // Notification close button
                document.getElementById('closeNotification').addEventListener('click', () => {
                    hideNotification();
                });
            }
            
            function updateCharacterCounts() {
                const titleLength = noteTitle.value.length;
                const contentLength = noteContent.value.length;
                
                // Update title count
                titleCount.textContent = `${titleLength}/100 characters`;
                if (titleLength > 90) {
                    titleCount.classList.add('danger');
                    titleCount.classList.remove('warning');
                } else if (titleLength > 70) {
                    titleCount.classList.add('warning');
                    titleCount.classList.remove('danger');
                } else {
                    titleCount.classList.remove('warning', 'danger');
                }
                
                // Update content count
                contentCount.textContent = `${contentLength}/5000 characters`;
                if (contentLength > 4500) {
                    contentCount.classList.add('danger');
                    contentCount.classList.remove('warning');
                } else if (contentLength > 4000) {
                    contentCount.classList.add('warning');
                    contentCount.classList.remove('danger');
                } else {
                    contentCount.classList.remove('warning', 'danger');
                }
            }
            
            function updateCategorySelection() {
                categoryOptions.forEach(option => {
                    if (option.getAttribute('data-category') === selectedCategory) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
            }
            
            function updatePreview() {
                const title = noteTitle.value.trim();
                const content = noteContent.value.trim();
                
                if (title || content) {
                    previewPlaceholder.style.display = 'none';
                    notePreview.style.display = 'block';
                    
                    // Update title
                    previewTitle.textContent = title || 'Untitled Note';
                    
                    // Update category
                    const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                    previewCategory.textContent = categoryName;
                    previewCategory.className = `preview-note-category ${selectedCategory}`;
                    
                    // Update date
                    const now = new Date();
                    const formattedDate = now.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    previewDate.textContent = formattedDate;
                    
                    // Update content with basic markdown parsing
                    let formattedContent = content;
                    
                    // Convert markdown to HTML
                    formattedContent = formattedContent
                        .replace(/^# (.*$)/gm, '<h4>$1</h4>')
                        .replace(/^## (.*$)/gm, '<h5>$1</h5>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^- (.*$)/gm, '<li>$1</li>')
                        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary);">$1</a>')
                        .replace(/\n{2,}/g, '</p><p>')
                        .replace(/\n/g, '<br>');
                    
                    // Wrap list items
                    if (formattedContent.includes('<li>')) {
                        formattedContent = formattedContent.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
                        formattedContent = formattedContent.replace(/<\/ul><br><ul>/g, '');
                    }
                    
                    previewContent.innerHTML = formattedContent || '<p style="color: var(--gray); font-style: italic;">No content yet...</p>';
                } else {
                    previewPlaceholder.style.display = 'flex';
                    notePreview.style.display = 'none';
                }
            }
            
            function saveChanges() {
                const title = noteTitle.value.trim();
                const content = noteContent.value.trim();
                
                // Validation
                if (!title) {
                    showNotification('Please enter a note title', 'error');
                    noteTitle.focus();
                    return;
                }
                
                if (!content) {
                    showNotification('Please enter note content', 'error');
                    noteContent.focus();
                    return;
                }
                
                if (title.length > 100) {
                    showNotification('Title cannot exceed 100 characters', 'error');
                    noteTitle.focus();
                    return;
                }
                
                if (content.length > 5000) {
                    showNotification('Content cannot exceed 5000 characters', 'error');
                    noteContent.focus();
                    return;
                }
                
                // Show loading state
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Changes...';
                saveBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // In a real app, this would be an API call to update the note
                    console.log('Saving note:', {
                        title: title,
                        content: content,
                        category: selectedCategory,
                        updatedAt: new Date().toISOString()
                    });
                    
                    // Reset button
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    
                    // Show success notification
                    showNotification('Changes saved successfully!', 'success');
                    
                    // Add animation to save button
                    animateSaveButton();
                    
                    // Update original info
                    updateOriginalInfo();
                    
                }, 1500);
            }
            
            function animateSaveButton() {
                const button = saveBtn;
                button.style.animation = 'none';
                
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                const size = Math.max(button.offsetWidth, button.offsetHeight);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (button.offsetWidth / 2 - size / 2) + 'px';
                ripple.style.top = (button.offsetHeight / 2 - size / 2) + 'px';
                
                button.appendChild(ripple);
                
                // Add ripple animation keyframes
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                    style.remove();
                }, 600);
            }
            
            function updateOriginalInfo() {
                const now = new Date();
                const formattedDate = now.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                });
                const formattedTime = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                document.getElementById('originalEditDate').textContent = `Today, ${formattedTime}`;
                document.getElementById('originalCharCount').textContent = 
                    noteContent.value.length.toLocaleString();
            }
            
            function navigateTo(destination) {
                // Animate button click
                const button = document.getElementById(destination + 'Btn');
                if (button) {
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 300);
                }
                
                // Show message
                const messages = {
                    'all-notes': 'Navigating to All Notes...',
                    'profile': 'Opening Your Profile...'
                };
                
                if (messages[destination]) {
                    showNotification(messages[destination], 'success');
                }
                
                // In a real app, this would navigate to the actual page
                // window.location.href = `/${destination.replace('-', '')}.html`;
            }
            
            function showSignoutConfirmation() {
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                    backdrop-filter: blur(5px);
                `;
                
                modal.innerHTML = `
                    <div style="background: white; padding: 45px; border-radius: 24px; max-width: 450px; text-align: center; animation: slideUp 0.4s ease; box-shadow: var(--shadow-xl);">
                        <i class="fas fa-sign-out-alt" style="font-size: 3.5rem; color: var(--danger); margin-bottom: 25px;"></i>
                        <h2 style="margin-bottom: 15px; color: var(--dark); font-size: 1.8rem;">Sign Out</h2>
                        <p style="color: var(--gray); margin-bottom: 35px; font-size: 1.1rem; line-height: 1.6;">Are you sure you want to sign out of LuvToNote? Any unsaved changes will be lost.</p>
                        <div style="display: flex; gap: 20px; justify-content: center;">
                            <button id="cancelSignout" style="padding: 14px 35px; background: var(--light); color: var(--gray); border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: var(--transition); font-size: 1rem;">
                                Cancel
                            </button>
                            <button id="confirmSignout" style="padding: 14px 35px; background: linear-gradient(135deg, var(--danger), #dc2626); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: var(--transition); font-size: 1rem; box-shadow: var(--shadow);">
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Button handlers
                document.getElementById('cancelSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeIn 0.3s ease reverse';
                    setTimeout(() => modal.remove(), 300);
                });
                
                document.getElementById('confirmSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeIn 0.3s ease reverse';
                    setTimeout(() => {
                        modal.remove();
                        showNotification('Successfully signed out. Redirecting...', 'success');
                        
                        // In real app: window.location.href = 'login.html';
                        setTimeout(() => {
                            alert('Redirecting to login page... (This would navigate to login in a real app)');
                        }, 1500);
                    }, 300);
                });
                
                // Close on overlay click
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        modal.style.animation = 'fadeIn 0.3s ease reverse';
                        setTimeout(() => modal.remove(), 300);
                    }
                });
            }
            
            function showNotification(message, type) {
                // Update notification
                notification.className = `notification ${type}`;
                notificationMessage.textContent = message;
                
                // Show notification
                notification.style.display = 'flex';
                notification.style.animation = 'slideInRight 0.3s ease forwards';
                
                // Auto hide after 4 seconds
                setTimeout(() => {
                    hideNotification();
                }, 4000);
            }
            
            function hideNotification() {
                notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 300);
            }
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        });