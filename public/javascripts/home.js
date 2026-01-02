 document.addEventListener('DOMContentLoaded', function() {
            // Feature cards animation on scroll
            const featureCards = document.querySelectorAll('.feature-card');
            const audienceCards = document.querySelectorAll('.audience-card');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            featureCards.forEach(card => {
                card.style.animationPlayState = 'paused';
                observer.observe(card);
            });
            
            audienceCards.forEach(card => {
                card.style.animationPlayState = 'paused';
                observer.observe(card);
            });
            
            // Interactive note example
            const noteCheckboxes = document.querySelectorAll('.note-checkbox');
            const noteTexts = document.querySelectorAll('.note-text');
            
            noteCheckboxes.forEach((checkbox, index) => {
                checkbox.addEventListener('click', function() {
                    this.classList.toggle('completed');
                    noteTexts[index].classList.toggle('completed');
                });
            });
            
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Button hover effects
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px)';
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        });