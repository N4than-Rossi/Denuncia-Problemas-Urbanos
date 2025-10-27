document.addEventListener('DOMContentLoaded', function() {
// inicializando o mapa
        var map = L.map('map').setView([39.61, -105.02], 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    // Adicionando marcadores em grupo
    var A    = L.marker([39.61, -105.02]).bindPopup('A').openPopup(),
        B    = L.marker([39.74, -104.99]).bindPopup('B'),
        C    = L.marker([39.73, -104.8]).bindPopup('C'),
        D    = L.marker([39.77, -105.23]).bindPopup('D');
    
    var cities = L.layerGroup([A, B, C, D]);
    
    var overlayMaps = {
        "Cities": cities
    };
    var layerControl = L.control.layers(null,overlayMaps).addTo(map);

    // Pop-up functionality
    // Get all denuncia elements
    const denuncias = document.querySelectorAll('.denuncia-historico');
    
    // Add click event listener to each denuncia
    denuncias.forEach(denuncia => {
        denuncia.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const popup = document.getElementById(`popup-${id}`);
            if (popup) {
                popup.classList.add('active');
            }
        });
    });

    // Add click event listener to all close buttons
    const closeButtons = document.querySelectorAll('.close-popup');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popup = this.closest('.popup');
            if (popup) {
                popup.classList.remove('active');
            }
        });
    });

    // Close popup when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup')) {
            e.target.classList.remove('active');
        }
    });
});