// Version simplifiée pour GitHub Pages - pas de Firebase

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Modal RDV
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du modal de rendez-vous
    document.getElementById('openRdvModal').onclick = function() {
        document.getElementById('rdvModal').style.display = 'block';
        setTimeout(() => {
            document.getElementById('rdvModal').classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
        document.getElementById('rdvForm').style.display = 'block';
        document.getElementById('rdvInfo').style.display = 'none';
        document.getElementById('rdvForm').reset();
    };

    document.getElementById('closeRdvModal').onclick = function() {
        document.getElementById('rdvModal').classList.remove('show');
        setTimeout(() => {
            document.getElementById('rdvModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    };

    window.onclick = function(event) {
        if (event.target == document.getElementById('rdvModal')) {
            document.getElementById('rdvModal').classList.remove('show');
            setTimeout(() => {
                document.getElementById('rdvModal').style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    // Validation du formulaire RDV
    document.getElementById('rdvBtn').onclick = function() {
        const firstName = document.getElementById('rdvFirstName').value.trim();
        const lastName = document.getElementById('rdvLastName').value.trim();
        const phone = document.getElementById('rdvPhone').value.trim();
        const message = document.getElementById('rdvMessage').value.trim();
        const legalConsent = document.getElementById('rdvLegalConsent').checked;
        
        if (!firstName || !lastName || !phone || !message) {
            alert("Merci de remplir tous les champs obligatoires.");
            return;
        }
        
        if (!legalConsent) {
            alert("Vous devez accepter les conditions de traitement des données personnelles pour continuer.");
            return;
        }
        
        document.getElementById('rdvForm').style.display = 'none';
        document.getElementById('rdvInfo').style.display = 'block';
        document.getElementById('rdvInfoText').textContent = "Votre demande a été enregistrée. Kathleen vous recontactera rapidement.";
    };

    // Gestion simple des témoignages (local seulement)
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('testimonialName');
            const textInput = document.getElementById('testimonialText');
            
            if (!nameInput || !textInput) {
                alert("Erreur: Formulaire incomplet");
                return;
            }
            
            const name = nameInput.value.trim() || 'Anonyme';
            const text = textInput.value.trim();
            
            if (!text) {
                alert("Merci d'écrire votre avis.");
                return;
            }
            
            // Créer le nouveau témoignage
            const testimonialDiv = document.createElement('div');
            testimonialDiv.className = 'testimonial';
            testimonialDiv.innerHTML = `
                <strong>${name}</strong>
                <p>${text}</p>
            `;
            
            // Ajouter au début de la liste
            const testimonialsList = document.getElementById('testimonialsList');
            if (testimonialsList) {
                testimonialsList.insertBefore(testimonialDiv, testimonialsList.firstChild);
                testimonialForm.reset();
                alert("✅ Merci pour votre témoignage ! Il est maintenant visible. 😊");
            }
        });
    }
});
