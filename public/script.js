document.getElementById('filterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const rol = document.getElementById('rol').value;
    const industria = document.getElementById('industria').value;
    const pais = document.getElementById('pais').value;
    const cnae = document.getElementById('cnae').value;

    fetch('/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rol, industria, pais, cnae })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filtered_leads.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error('Error:', error));
});

