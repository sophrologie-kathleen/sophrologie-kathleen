function openModal() {
    const modal = document.getElementById('appointmentModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('appointmentModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

window.onclick = function(event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target == modal) {
        closeModal();
    }
}

function submitForm(event) {
    event.preventDefault();
    
    const method = document.querySelector('input[name="contactMethod"]:checked').value;
    
    if (method === 'sms') {
        sendSMS();
    } else {
        submitToDatabase();
    }
}

function sendSMS() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    let smsBody = `Bonjour Kathleen,\n\nJe souhaite prendre rendez-vous pour une séance de sophrologie.\n\nMes coordonnées :\n• Nom : ${name}\n• Téléphone : ${phone}`;
    if (message) {
        smsBody += `\n• Message : ${message}`;
    }
    smsBody += `\n\nMerci de me recontacter pour fixer un créneau.\n\nCordialement,\n${name}`;

    const sophrologistPhone = '0783767333';

    // Créer le lien SMS
    const smsLink = `sms:${sophrologistPhone}?body=${encodeURIComponent(smsBody)}`;
    
    // Essayer d'ouvrir l'application SMS
    try {
        window.location.href = smsLink;
        
        // Afficher un message d'instruction
        setTimeout(() => {
            alert('📱 Votre application Messages va s\'ouvrir avec le message pré-rempli.\n\n✅ Vérifiez le message et cliquez sur "Envoyer" pour confirmer votre demande de rendez-vous !');
        }, 100);
        
    } catch (error) {
        // En cas d'échec, afficher le message à copier
        copyToClipboard(smsBody, sophrologistPhone);
    }

    closeModal();
}

function copyToClipboard(message, phone) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
            alert(
                `📋 Le message a été copié dans votre presse-papiers !\n\n📱 Ouvrez votre application Messages et :\n1️⃣ Nouveau message au : ${phone}\n2️⃣ Collez le message (Ctrl+V ou Cmd+V)\n3️⃣ Envoyez\n\n📝 Message copié :\n${message}`
            );
        }).catch(() => {
            showManualCopyMessage(message, phone);
        });
    } else {
        showManualCopyMessage(message, phone);
    }
}

function showManualCopyMessage(message, phone) {
    alert(
        `📱 Pour envoyer votre demande de rendez-vous :\n\n1️⃣ Ouvrez votre application Messages\n2️⃣ Nouveau message au : ${phone}\n3️⃣ Copiez-collez ce message :\n\n${message}\n\n4️⃣ Envoyez !\n\n✅ Kathleen vous recontactera rapidement.`
    );
}

async function submitToDatabase() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    // Afficher l'état de chargement
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Attendre que Firebase soit chargé
        await waitForFirebase();
        
        // Ajouter le rendez-vous à Firebase
        await window.firebase.addDoc(window.firebase.collection(window.firebase.db, 'appointments'), {
            name: name,
            phone: phone,
            message: message || '',
            created_at: new Date().toISOString(),
            status: 'pending'
        });
        
        // Masquer le formulaire et afficher le message de succès
        document.getElementById('appointmentForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // Réinitialiser le formulaire
        document.getElementById('appointmentForm').reset();
        
        // Fermer automatiquement après 3 secondes
        setTimeout(() => {
            closeModal();
            // Réafficher le formulaire pour la prochaine utilisation
            document.getElementById('appointmentForm').style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Erreur Firebase:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer ou utiliser la méthode SMS.');
    } finally {
        // Restaurer le bouton
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Mise à jour du texte du bouton selon la méthode choisie
document.addEventListener('DOMContentLoaded', function() {
    const methodInputs = document.querySelectorAll('input[name="contactMethod"]');
    const submitBtn = document.getElementById('submitBtn');
    
        methodInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.value === 'sms') {
                    submitBtn.textContent = '📱 Ouvrir Messages';
                } else {
                    submitBtn.textContent = '💾 Envoyer ma demande';
                }
            });
        });    // Charger les témoignages approuvés
    loadApprovedTestimonials();
    
    // Initialiser le formulaire des témoignages
    initTestimonialForm();
});

// === FONCTIONS D'ADMINISTRATION ===

// Mot de passe simple (à changer en production)
const ADMIN_PASSWORD = 'sophro2024';

// Toggle du panel d'administration avec animations
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    
    if (panel.style.display === 'block') {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    } else {
        panel.style.display = 'block';
        setTimeout(() => {
            panel.classList.add('show');
        }, 10);
        
        // Reset à la vue de connexion
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminInterface').style.display = 'none';
        document.getElementById('adminPassword').value = '';
        document.body.style.overflow = 'hidden';
    }
}

// Authentification admin
function adminAuthenticate() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'block';
        loadAdminData();
    } else {
        alert('Mot de passe incorrect');
        document.getElementById('adminPassword').value = '';
    }
}

// Gestion des onglets admin
function showAdminTab(tabName) {
    // Masquer tous les contenus
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Désactiver tous les onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    event.target.classList.add('active');
}

// Charger toutes les données admin
async function loadAdminData() {
    await Promise.all([
        loadAdminAppointments(),
        loadAdminTestimonials(),
        updateAdminStats()
    ]);
}

// Charger les rendez-vous pour l'admin
async function loadAdminAppointments() {
    try {
        await waitForFirebase();
        
        const appointmentsQuery = window.firebase.query(
            window.firebase.collection(window.firebase.db, 'appointments'),
            window.firebase.orderBy('created_at', 'desc')
        );
        
        const querySnapshot = await window.firebase.getDocs(appointmentsQuery);
        const appointments = [];
        
        querySnapshot.forEach((doc) => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        const container = document.getElementById('appointmentsList');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#8b6f47; padding:20px;">Aucune demande de rendez-vous.</p>';
            return;
        }
        
        container.innerHTML = appointments.map(appointment => `
            <div class="admin-appointment-card">
                <div class="admin-item-header">
                    <div class="admin-item-info">
                        <h4>${appointment.name}</h4>
                        <div class="admin-item-meta">
                            📞 ${appointment.phone} • 📅 ${new Date(appointment.created_at).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    <div class="admin-status ${appointment.status}">
                        ${getStatusText(appointment.status)}
                    </div>
                </div>
                
                ${appointment.message ? `
                    <div class="admin-message">
                        💬 ${appointment.message}
                    </div>
                ` : ''}
                
                <div class="admin-actions">
                    ${appointment.status === 'pending' ? `
                        <button class="admin-btn admin-btn-primary" onclick="updateAppointmentStatus('${appointment.id}', 'contacted')">
                            Contacté
                        </button>
                    ` : ''}
                    ${appointment.status !== 'completed' ? `
                        <button class="admin-btn admin-btn-success" onclick="updateAppointmentStatus('${appointment.id}', 'completed')">
                            Terminé
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
    }
}

// Charger les témoignages pour l'admin
async function loadAdminTestimonials() {
    try {
        await waitForFirebase();
        
        const testimonialsQuery = window.firebase.query(
            window.firebase.collection(window.firebase.db, 'testimonials'),
            window.firebase.orderBy('created_at', 'desc')
        );
        
        const querySnapshot = await window.firebase.getDocs(testimonialsQuery);
        const testimonials = [];
        
        querySnapshot.forEach((doc) => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });
        
        const container = document.getElementById('adminTestimonialsList');
        
        if (testimonials.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#8b6f47; padding:20px;">Aucun témoignage.</p>';
            return;
        }
        
        container.innerHTML = testimonials.map(testimonial => `
            <div class="admin-testimonial-card">
                <div class="admin-item-header">
                    <div class="admin-item-info">
                        <h4>${testimonial.name || 'Anonyme'}</h4>
                        <div class="admin-item-meta">
                            📅 ${new Date(testimonial.created_at).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    <div class="admin-status ${testimonial.approved ? 'approved' : 'pending'}">
                        ${testimonial.approved ? 'Approuvé' : 'En attente'}
                    </div>
                </div>
                
                <div class="admin-message">
                    "${testimonial.text}"
                </div>
                
                ${!testimonial.approved ? `
                    <div class="admin-actions">
                        <button class="admin-btn admin-btn-success" onclick="approveTestimonial('${testimonial.id}')">
                            Approuver
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
    }
}

// Mettre à jour les statistiques
async function updateAdminStats() {
    try {
        await waitForFirebase();
        
        // Charger les rendez-vous
        const appointmentsQuery = window.firebase.collection(window.firebase.db, 'appointments');
        const appointmentsSnapshot = await window.firebase.getDocs(appointmentsQuery);
        const appointments = [];
        appointmentsSnapshot.forEach((doc) => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        // Charger les témoignages
        const testimonialsQuery = window.firebase.collection(window.firebase.db, 'testimonials');
        const testimonialsSnapshot = await window.firebase.getDocs(testimonialsQuery);
        const testimonials = [];
        testimonialsSnapshot.forEach((doc) => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });
        
        document.getElementById('totalAppointments').textContent = appointments.length;
        document.getElementById('pendingAppointments').textContent = 
            appointments.filter(a => a.status === 'pending').length;
        document.getElementById('totalTestimonials').textContent = 
            testimonials.filter(t => t.approved).length;
            
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Mettre à jour le statut d'un rendez-vous
async function updateAppointmentStatus(appointmentId, status) {
    try {
        await waitForFirebase();
        
        const appointmentRef = window.firebase.doc(window.firebase.db, 'appointments', appointmentId);
        await window.firebase.updateDoc(appointmentRef, { status: status });
        
        loadAdminAppointments();
        updateAdminStats();
        
    } catch (error) {
        console.error('Erreur Firebase:', error);
        alert('Erreur lors de la mise à jour');
    }
}

// Approuver un témoignage
async function approveTestimonial(testimonialId) {
    try {
        await waitForFirebase();
        
        const testimonialRef = window.firebase.doc(window.firebase.db, 'testimonials', testimonialId);
        await window.firebase.updateDoc(testimonialRef, { approved: true });
        
        loadAdminTestimonials();
        updateAdminStats();
        loadApprovedTestimonials(); // Recharger les témoignages publics
        
    } catch (error) {
        console.error('Erreur Firebase:', error);
        alert('Erreur lors de l\'approbation');
    }
}

// Texte du statut
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'En attente';
        case 'contacted': return 'Contacté';
        case 'completed': return 'Terminé';
        default: return status;
    }
}

// Déconnexion admin
function adminLogout() {
    toggleAdminPanel();
}

// Charger les témoignages approuvés (pour l'affichage public)
async function loadApprovedTestimonials() {
    try {
        await waitForFirebase();
        
        const testimonialsQuery = window.firebase.query(
            window.firebase.collection(window.firebase.db, 'testimonials'),
            window.firebase.where('approved', '==', true),
            window.firebase.orderBy('created_at', 'desc')
        );
        
        const querySnapshot = await window.firebase.getDocs(testimonialsQuery);
        const testimonials = [];
        
        querySnapshot.forEach((doc) => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });
        
        const container = document.getElementById('testimonialsList');
        
        if (testimonials.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#8b6f47; padding:20px;">Soyez le premier à laisser un témoignage !</p>';
            return;
        }
        
        container.innerHTML = testimonials.map(testimonial => `
            <div style="background:#fefdf8; border:1px solid #e8d4b8; border-radius:12px; padding:15px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div>
                        <strong style="color:#7a5230;">${testimonial.name || 'Client anonyme'}</strong>
                        <div style="font-size:0.8em; color:#8b6f47;">${new Date(testimonial.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style="color:#c99a2e;">⭐⭐⭐⭐⭐</div>
                </div>
                <p style="color:#555; font-style:italic; line-height:1.4;">"${testimonial.text}"</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
    }
}

// Animations au scroll améliorées
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animer les éléments enfants avec un délai
            const children = entry.target.querySelectorAll('.benefit-card, .pricing-card');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    observer.observe(section);
});

// Animation d'apparition progressive des éléments
function animateElements() {
    const animatedElements = document.querySelectorAll('.benefit-card, .pricing-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Animation des boutons au survol
function addButtonAnimations() {
    const buttons = document.querySelectorAll('button, .cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Parallax léger pour le header
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Initialiser toutes les animations
document.addEventListener('DOMContentLoaded', function() {
    animateElements();
    addButtonAnimations();
    addParallaxEffect();
});

// Initialisation du formulaire des témoignages
function initTestimonialForm() {
    const testimonialForm = document.getElementById('testimonialForm');
    
    if (testimonialForm) {
        testimonialForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const nameElement = document.getElementById('testimonialName');
            const textElement = document.getElementById('testimonialText');
            
            if (!nameElement || !textElement) {
                console.error('Éléments du formulaire non trouvés');
                alert('Erreur du formulaire. Veuillez recharger la page.');
                return;
            }
            
            const name = nameElement.value.trim();
            const text = textElement.value.trim();
            
            if (!text) {
                alert('Veuillez écrire votre avis');
                return;
            }
            
            try {
                // Attendre que Firebase soit chargé
                await waitForFirebase();
                
                // Ajouter le témoignage à Firebase
                await window.firebase.addDoc(window.firebase.collection(window.firebase.db, 'testimonials'), {
                    name: name || null,
                    text: text,
                    created_at: new Date().toISOString(),
                    approved: false
                });
                
                alert('Merci pour votre témoignage ! Il sera visible après validation.');
                testimonialForm.reset();
                
            } catch (error) {
                console.error('Erreur Firebase:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        };
        
        console.log('Formulaire de témoignage initialisé');
    } else {
        console.error('Formulaire testimonialForm non trouvé');
    }
}

// Fonction d'attente pour Firebase
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 secondes max
        
        const checkFirebase = () => {
            if (window.firebase && window.firebase.db) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Firebase non chargé'));
            } else {
                attempts++;
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

// Initialisation des témoignages par défaut (une seule fois)
async function initDefaultTestimonials() {
    try {
        await waitForFirebase();
        
        // Vérifier s'il y a déjà des témoignages
        const testimonialsQuery = window.firebase.collection(window.firebase.db, 'testimonials');
        const querySnapshot = await window.firebase.getDocs(testimonialsQuery);
        
        if (querySnapshot.empty) {
            console.log('Ajout des témoignages par défaut...');
            
            // Ajouter les témoignages par défaut
            const defaultTestimonials = [
                {
                    name: "Marie L.",
                    text: "Les séances avec Kathleen m'ont permis de retrouver une sérénité que je pensais avoir perdue. Je recommande vivement !",
                    approved: true,
                    created_at: new Date().toISOString()
                },
                {
                    name: "Thomas B.", 
                    text: "Approche douce et bienveillante, j'ai appris des techniques que j'utilise maintenant au quotidien.",
                    approved: true,
                    created_at: new Date().toISOString()
                }
            ];
            
            for (const testimonial of defaultTestimonials) {
                await window.firebase.addDoc(window.firebase.collection(window.firebase.db, 'testimonials'), testimonial);
            }
            
            console.log('Témoignages par défaut ajoutés !');
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des témoignages par défaut:', error);
    }
}

// Initialiser les témoignages par défaut au chargement
setTimeout(initDefaultTestimonials, 2000);

// Dans la gestion du modal RDV, supprime toute référence à rdvSmsBtn et à l'émoji 📱
        // Validation du formulaire RDV (étape 2)
        document.getElementById('rdvBtn').onclick = function() {
            const firstName = document.getElementById('rdvFirstName').value.trim();
            const lastName = document.getElementById('rdvLastName').value.trim();
            const phone = document.getElementById('rdvPhone').value.trim();
            const message = document.getElementById('rdvMessage').value.trim();
            if (!firstName || !lastName || !phone || !message) {
                alert("Merci de remplir tous les champs obligatoires.");
                return;
            }
            let smsBody = `Bonjour Kathleen,\nJe souhaite prendre rendez-vous pour une séance de sophrologie.\nPrénom : ${firstName}\nNom : ${lastName}\nTéléphone : ${phone}\nMessage : ${message}\nMerci de me recontacter.`;
            document.getElementById('rdvForm').style.display = 'none';
            document.getElementById('rdvInfo').style.display = 'block';

            // Affiche juste le texte d'information, plus de bouton SMS
            document.getElementById('rdvInfoText').textContent =
                "Votre demande a été enregistrée. Kathleen vous recontactera rapidement.";
        };


