        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const notesGridContainer = document.getElementById('notesGridContainer');
            const notesCounter = document.getElementById('notesCounter');
            const notesCount = document.getElementById('notesCount');
            
            // Navigation buttons
            const createNoteBtn = document.getElementById('createNoteBtn');
            const profileBtn = document.getElementById('profileBtn');
            const signoutBtn = document.getElementById('signoutBtn');
            
            // Modal Elements
            const deleteModal = document.getElementById('deleteModal');
            const editModal = document.getElementById('editModal');
            const deleteNoteTitle = document.getElementById('deleteNoteTitle');
            const editForm = document.getElementById('editForm');
            const editNoteTitle = document.getElementById('editNoteTitle');
            const editNoteContent = document.getElementById('editNoteContent');
            const editCategoryOptions = document.querySelectorAll('#editForm .category-option');
            
            // State variables
            let notes = [];
            let noteToDelete = null;
            let noteToEdit = null;
            
            // Initialize
            initializeNotes();
            setupEventListeners();
            
            function initializeNotes() {
                // Count notes
                const noteContainers = document.querySelectorAll('.note-container');
                notesCount.textContent = noteContainers.length;
                
                // Add hover animation to all note containers
                noteContainers.forEach((container, index) => {
                    // Preserve server-rendered data-note-id if present
                    if (!container.hasAttribute('data-note-id')) {
                        container.setAttribute('data-note-id', index + 1);
                    }
                    
                    // Add click animation
                    container.addEventListener('click', function(e) {
                        if (!e.target.closest('.action-btn')) {
                            this.style.transform = 'scale(0.98)';
                            setTimeout(() => {
                                this.style.transform = '';
                            }, 200);
                        }
                    });
                });
            }
            
            function setupEventListeners() {
                // Edit button event delegation
                notesGridContainer.addEventListener('click', function(e) {
                        if (e.target.closest('.edit-btn')) {
                            const noteId = e.target.closest('.edit-btn').getAttribute('data-note-id');
                            openEditModal(noteId);
                        }

                        if (e.target.closest('.delete-btn')) {
                            // Prevent default anchor navigation so we can show confirmation modal
                            e.preventDefault();
                            const noteId = e.target.closest('.delete-btn').getAttribute('data-note-id');
                            openDeleteModal(noteId);
                        }
                });
                
                // Navigation buttons
                createNoteBtn.addEventListener('click', () => navigateTo('create-notes'));
                profileBtn.addEventListener('click', () => navigateTo('profile'));
                signoutBtn.addEventListener('click', () => showSignoutConfirmation());
                
                // Delete modal
                document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
                document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
                document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
                
                // Edit modal
                document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
                document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
                editForm.addEventListener('submit', updateNote);
                
                // Category selection in edit modal
                editCategoryOptions.forEach(option => {
                    option.addEventListener('click', function() {
                        editCategoryOptions.forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                    });
                });
                
                // Close modals on overlay click
                [deleteModal, editModal].forEach(modal => {
                    modal.addEventListener('click', function(e) {
                        if (e.target === this) {
                            closeModal(this);
                        }
                    });
                });
                
                // Add keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        if (deleteModal.style.display === 'flex') closeDeleteModal();
                        if (editModal.style.display === 'flex') closeEditModal();
                    }
                });
            }
            
            function openDeleteModal(noteId) {
                const noteContainer = document.querySelector(`[data-note-id="${noteId}"]`);
                if (!noteContainer) return;
                
                const noteTitle = noteContainer.querySelector('.note-title').textContent;
                deleteNoteTitle.textContent = noteTitle;
                noteToDelete = noteId;
                
                deleteModal.style.display = 'flex';
                deleteModal.style.animation = 'fadeInModal 0.3s ease';
                
                // Animate modal content
                const modalContent = deleteModal.querySelector('.modal-content');
                modalContent.style.animation = 'slideUpModal 0.4s ease';
            }
            
            function closeDeleteModal() {
                deleteModal.style.animation = 'fadeInModal 0.3s ease reverse';
                setTimeout(() => {
                    deleteModal.style.display = 'none';
                    noteToDelete = null;
                }, 300);
            }
            
            async function confirmDelete() {
                if (!noteToDelete) return;

                const noteContainer = document.querySelector(`[data-note-id="${noteToDelete}"]`);
                if (!noteContainer) {
                    closeDeleteModal();
                    return;
                }

                const noteId = noteContainer.getAttribute('data-note-id');
                const title = deleteNoteTitle.textContent;
                try{
                    const res = await fetch(`/delete/${encodeURIComponent(title)}`, { method: 'GET', credentials: 'include' })
                    // optional: check res status
                    if(!res.ok){
                        showNotification('Failed to delete note on server', 'error')
                        closeDeleteModal()
                        return
                    }
                }
                catch(err){
                    console.error('Delete request failed', err)
                    showNotification('Delete request failed', 'error')
                    closeDeleteModal()
                    return
                }

                // Remove from DOM with animation
                // Add delete animation
                noteContainer.style.animation = 'slideUpNote 0.3s ease reverse';
                noteContainer.style.opacity = '0';
                noteContainer.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    noteContainer.remove();

                    // Update notes count
                    const remainingNotes = document.querySelectorAll('.note-container').length;
                    animateCounterUpdate(remainingNotes);

                    // Show empty state if no notes left
                    if (remainingNotes === 0) {
                        showEmptyState();
                    }

                    // Show success notification
                    showNotification('Note deleted successfully', 'success');
                }, 300);

                closeDeleteModal();
            }
            
            function openEditModal(noteId) {
                const noteContainer = document.querySelector(`[data-note-id="${noteId}"]`);
                if (!noteContainer) return;
                
                const noteTitle = noteContainer.querySelector('.note-title').textContent;
                const noteContent = noteContainer.querySelector('.note-content').textContent;
                const noteCategory = noteContainer.querySelector('.note-category').textContent.toLowerCase();
                
                // Populate form
                editNoteTitle.value = noteTitle;
                editNoteContent.value = noteContent;
                
                // Set category
                editCategoryOptions.forEach(option => {
                    if (option.getAttribute('data-category') === noteCategory) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
                
                noteToEdit = noteId;
                editModal.style.display = 'flex';
                editModal.style.animation = 'fadeInModal 0.3s ease';
                
                // Animate modal content
                const modalContent = editModal.querySelector('.modal-content');
                modalContent.style.animation = 'slideUpModal 0.4s ease';
            }
            
            function closeEditModal() {
                editModal.style.animation = 'fadeInModal 0.3s ease reverse';
                setTimeout(() => {
                    editModal.style.display = 'none';
                    noteToEdit = null;
                    editForm.reset();
                }, 300);
            }
            
            function updateNote(e) {
                
                if (!noteToEdit) return;
                
                const noteContainer = document.querySelector(`[data-note-id="${noteToEdit}"]`);
                if (!noteContainer) return;
                
                // Get form values
                const newTitle = editNoteTitle.value.trim();
                const newContent = editNoteContent.value.trim();
                const selectedCategory = document.querySelector('#editForm .category-option.selected');
                
                if (!selectedCategory) {
                    showNotification('Please select a category', 'error');
                    return;
                }
                
                const newCategory = selectedCategory.getAttribute('data-category');
                
                // Update note container
                noteContainer.querySelector('.note-title').textContent = newTitle;
                noteContainer.querySelector('.note-content').innerHTML = newContent.replace(/\n/g, '<br>');
                
                // Update category
                const categoryBadge = noteContainer.querySelector('.note-category');
                categoryBadge.textContent = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
                categoryBadge.className = 'note-category ' + newCategory;
                
                // Update date to current time
                const now = new Date();
                const formattedDate = now.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                noteContainer.querySelector('.note-date').innerHTML = `
                    <i class="far fa-calendar"></i>
                    ${formattedDate}
                `;
                
                // Add update animation
                noteContainer.style.animation = 'none';
                setTimeout(() => {
                    noteContainer.style.animation = 'slideUpNote 0.5s ease';
                }, 10);
                
                // Show success notification
                showNotification('Note updated successfully', 'success');
                
                closeEditModal();
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
                    'create-notes': 'Opening Create Notes page...',
                    'profile': 'Opening Your Profile...'
                };
                
                if (messages[destination]) {
                    showNotification(messages[destination], 'success');
                }
                
                // In a real app, this would navigate to the actual page
                // window.location.href = `/${destination.replace('-', '')}.html`;
            }
            
                
                document.body.appendChild(modal);
                
                // Button handlers
                document.getElementById('cancelSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeInModal 0.3s ease reverse';
                    setTimeout(() => modal.remove(), 300);
                });
                
                document.getElementById('confirmSignout').addEventListener('click', () => {
                    modal.style.animation = 'fadeInModal 0.3s ease reverse';
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
                        modal.style.animation = 'fadeInModal 0.3s ease reverse';
                        setTimeout(() => modal.remove(), 300);
                    }
                });
            }
            
            function showEmptyState() {
                notesGridContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-sticky-note"></i>
                        </div>
                        <h3>No Notes Found</h3>
                        <p>You haven't created any notes yet. Start capturing your thoughts, ideas, and important information by creating your first note!</p>
                        <button class="empty-btn" id="createFirstNote">
                            <i class="fas fa-plus-circle"></i>
                            Create Your First Note
                        </button>
                    </div>
                `;
                
                // Add event listener to create first note button
                document.getElementById('createFirstNote').addEventListener('click', () => {
                    navigateTo('create-notes');
                });
            }
            
            function animateCounterUpdate(newValue) {
                const counter = notesCounter;
                counter.style.transform = 'scale(1.1)';
                counter.style.backgroundColor = 'var(--primary)';
                counter.style.color = 'white';
                
                setTimeout(() => {
                    counter.style.transform = 'scale(1)';
                    setTimeout(() => {
                        counter.style.backgroundColor = '';
                        counter.style.color = '';
                    }, 300);
                }, 300);
            }
            
            function showNotification(message, type) {
                // Remove existing notification
                const existing = document.querySelector('.notification');
                if (existing) existing.remove();
                
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.style.cssText = `
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    background: ${type === 'success' ? 'var(--secondary)' : 'var(--danger)'};
                    color: white;
                    padding: 18px 25px;
                    border-radius: 16px;
                    box-shadow: var(--shadow-xl);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease forwards;
                    max-width: 400px;
                    backdrop-filter: blur(10px);
                `;
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="font-size: 1.3rem;"></i>
                        <span style="font-weight: 500;">${message}</span>
                    </div>
                    <button class="notification-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                document.body.appendChild(notification);
                
                // Close button
                notification.querySelector('.notification-close').addEventListener('click', () => {
                    notification.style.animation = 'slideOutRight 0.3s ease forwards';
                    setTimeout(() => notification.remove(), 300);
                });
                
                // Auto remove after 4 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.animation = 'slideOutRight 0.3s ease forwards';
                        setTimeout(() => notification.remove(), 300);
                    }
                }, 4000);
            }
            
            function closeModal(modal) {
                modal.style.animation = 'fadeInModal 0.3s ease reverse';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
            
            // Add animation keyframes for notification
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
                
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Initialize animations
            const noteContainers = document.querySelectorAll('.note-container');
            noteContainers.forEach((container, index) => {
                container.style.animationDelay = `${(index + 1) * 0.1}s`;
            });
        });