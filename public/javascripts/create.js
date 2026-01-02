    document.addEventListener('DOMContentLoaded', function() {
            const noteContent = document.getElementById('noteContent');
            const titleCount = document.getElementById('titleCount');
            const contentCount = document.getElementById('contentCount');
            const categoryOptions = document.querySelectorAll('.category-option');
            const saveBtn = document.getElementById('saveBtn');
            const noteForm = document.getElementById('noteForm');
            const previewPlaceholder = document.getElementById('previewPlaceholder');
            const notePreview = document.getElementById('notePreview');
            const previewTitle = document.getElementById('previewTitle');
            const previewCategory = document.getElementById('previewCategory');
            const previewDate = document.getElementById('previewDate');
            const previewContent = document.getElementById('previewContent');
            const recentNotesContainer = document.getElementById('recentNotes');
            
            // Navigation buttons
            const homeBtn = document.getElementById('homeBtn');
            const allNotesBtn = document.getElementById('allNotesBtn');
            const profileBtn = document.getElementById('profileBtn');
            
            // Initialize
            let selectedCategory = 'work';
            updateCategorySelection();
            updateCharacterCounts();
            loadRecentNotes();
            
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
            noteForm.addEventListener('submit', function(e) {
                saveNote();
            });
            
            // Navigation button handlers
            homeBtn.addEventListener('click', () => navigateTo('home'));
            allNotesBtn.addEventListener('click', () => navigateTo('all-notes'));
            profileBtn.addEventListener('click', () => navigateTo('profile'));
            
            // Functions
            function updateCharacterCounts() {
                titleCount.textContent = noteTitle.value.length;
                contentCount.textContent = noteContent.value.length;
                
                // Update colors based on limits
                if (noteTitle.value.length > 90) {
                    titleCount.style.color = 'var(--accent)';
                } else if (noteTitle.value.length > 70) {
                    titleCount.style.color = 'var(--primary)';
                } else {
                    titleCount.style.color = 'var(--gray)';
                }
                
                if (noteContent.value.length > 4500) {
                    contentCount.style.color = 'var(--accent)';
                } else if (noteContent.value.length > 4000) {
                    contentCount.style.color = 'var(--primary)';
                } else {
                    contentCount.style.color = 'var(--gray)';
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
                    previewCategory.textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                    previewCategory.className = 'note-preview-category ' + selectedCategory;
                    
                    // Update date
                    const now = new Date();
                    previewDate.textContent = now.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    // Update content with basic markdown parsing
                    let formattedContent = content;
                    
                    // Convert markdown to HTML (basic implementation)
                    formattedContent = formattedContent
                        .replace(/^# (.*$)/gm, '<h4>$1</h4>')
                        .replace(/^## (.*$)/gm, '<h5>$1</h5>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^- (.*$)/gm, '<li>$1</li>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                        .replace(/\n/g, '<br>');
                    
                    // Wrap list items in ul
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
            
            function saveNote() {
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
                
                // Show loading state
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // Create note object
                    const newNote = {
                        id: Date.now(),
                        title: title,
                        content: content,
                        category: selectedCategory,
                        date: new Date().toISOString(),
                        formattedDate: new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };
                    
                    // Save to localStorage (in a real app, this would be an API call)
                    let notes = JSON.parse(localStorage.getItem('luvtonote_notes') || '[]');
                    notes.unshift(newNote); // Add to beginning
                    localStorage.setItem('luvtonote_notes', JSON.stringify(notes.slice(0, 50))); // Keep only last 50
                    
                    // Reset button
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    
                    // Show success message
                    showNotification('Note saved successfully!', 'success');
                    
                    // Reset form
                    noteForm.reset();
                    selectedCategory = 'work';
                    updateCategorySelection();
                    updateCharacterCounts();
                    updatePreview();
                    
                    // Update recent notes
                    loadRecentNotes();
                    
                    // Animate save button
                    animateSaveButton();
                }, 1500);
            }
            
            function loadRecentNotes() {
                // Get notes from localStorage
                const notes = JSON.parse(localStorage.getItem('luvtonote_notes') || '[]');
                
                // Clear container
                recentNotesContainer.innerHTML = '';
                
                // If no notes, show message
                if (notes.length === 0) {
                    recentNotesContainer.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                            <i class="fas fa-sticky-note" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                            <h3>No notes yet</h3>
                            <p>Create your first note to see it here!</p>
                        </div>
                    `;
                    return;
                }
                
                // Display recent notes (max 3)
                const recentNotes = notes.slice(0, 3);
                
                recentNotes.forEach((note, index) => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'recent-note-card';
                    noteCard.style.animationDelay = `${index * 0.1}s`;
                    
                    // Truncate content for preview
                    const truncatedContent = note.content.length > 150 
                        ? note.content.substring(0, 150) + '...' 
                        : note.content;
                    
                    noteCard.innerHTML = `
                        <h3 class="recent-note-title">${note.title}</h3>
                        <p class="recent-note-content">${truncatedContent}</p>
                        <div class="recent-note-meta">
                            <div class="recent-note-date">
                                <i class="far fa-calendar"></i>
                                ${note.formattedDate}
                            </div>
                            <div class="recent-note-category ${note.category}">
                                ${note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                            </div>
                        </div>
                    `;
                    
                    recentNotesContainer.appendChild(noteCard);
                });
            }
            
            function navigateTo(destination) {
                // Animate button click
                const buttons = {
                    'home': homeBtn,
                    'all-notes': allNotesBtn,
                    'profile': profileBtn
                };
                
                if (buttons[destination]) {
                    buttons[destination].style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        buttons[destination].style.transform = '';
                    }, 300);
                }
                
                // Show message (in a real app, this would navigate)
                const messages = {
                    'home': 'Navigating to Home page...',
                    'all-notes': 'Opening All Notes...',
                    'profile': 'Opening Your Profile...'
                };
                
                showNotification(messages[destination], 'success');
                
                // In a real app, you would navigate here:
                // window.location.href = `/${destination}`;
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
            
            function showNotification(message, type) {
                // Remove existing notification
                const existingNotification = document.querySelector('.notification');
                if (existingNotification) {
                    existingNotification.style.animation = 'slideOutRight 0.3s ease forwards';
                    setTimeout(() => existingNotification.remove(), 300);
                }
                
                // Create notification
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                        <span>${message}</span>
                    </div>
                    <button class="notification-close">
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
            
            // Initialize with sample data if empty
            if (!localStorage.getItem('luvtonote_notes')) {
                const sampleNotes = [
                    {
                        id: 1,
                        title: "Meeting Notes - Project Update",
                        content: "Discussed progress on the new features. Need to finalize UI design by Friday. Team will meet again on Wednesday.",
                        category: "work",
                        date: new Date().toISOString(),
                        formattedDate: "Today, 10:30 AM"
                    },
                    {
                        id: 2,
                        title: "Grocery Shopping List",
                        content: "- Milk\n- Eggs\n- Bread\n- Coffee\n- Fruits\n- Vegetables\n- Chicken",
                        category: "personal",
                        date: new Date(Date.now() - 86400000).toISOString(),
                        formattedDate: "Yesterday, 3:15 PM"
                    },
                    {
                        id: 3,
                        title: "React Study Plan",
                        content: "Topics to cover:\n1. React Hooks\n2. Context API\n3. React Router\n4. State Management\n\nGoal: Complete by end of month.",
                        category: "study",
                        date: new Date(Date.now() - 172800000).toISOString(),
                        formattedDate: "Nov 10, 2:00 PM"
                    }
                ];
                localStorage.setItem('luvtonote_notes', JSON.stringify(sampleNotes));
                loadRecentNotes();
            }
            
            // Add hover animations to cards
            const cards = document.querySelectorAll('.form-card, .preview-card, .recent-note-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                });
            });
            
            // Focus on title input on page load
            noteTitle.focus();
        });