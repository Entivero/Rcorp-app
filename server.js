const express = require('express');
const xlsx = require('xlsx');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(express.json());

// Leer el archivo de Excel
let worksheet;
try {
    const workbook = xlsx.readFile(path.join(__dirname, 'data', 'ALL_LEADS.xlsx'));
    const sheet_name = workbook.SheetNames[0];
    worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name]);
    console.log('Datos cargados del archivo de Excel:', worksheet);
} catch (error) {
    console.error('Error al leer el archivo de Excel:', error);
    worksheet = [];
}

app.post('/filter', (req, res) => {
    const { rol, industria, pais, cnae } = req.body;
    let filteredData = worksheet;

    console.log('Criterios de filtro recibidos:', req.body);

    try {
        if (rol) {
            filteredData = filteredData.filter(row => row.Role && row.Role.includes(rol));
            console.log(`Datos después de filtrar por Rol (${rol}):`, filteredData);
        }
        if (industria) {
            filteredData = filteredData.filter(row => row.industry && row.industry.includes(industria));
            console.log(`Datos después de filtrar por Industria (${industria}):`, filteredData);
        }
        if (pais) {
            filteredData = filteredData.filter(row => row.country && row.country.includes(pais));
            console.log(`Datos después de filtrar por País (${pais}):`, filteredData);
        }
        if (cnae) {
            filteredData = filteredData.filter(row => row.CNAE && row.CNAE.includes(cnae));
            console.log(`Datos después de filtrar por CNAE (${cnae}):`, filteredData);
        }

        console.log('Datos filtrados:', filteredData);

        if (filteredData.length === 0) {
            console.error('Error al filtrar los datos: No se encontraron datos que coincidan con los criterios.');
            return res.status(404).send('No se encontraron datos que coincidan con los criterios.');
        }

        // Incrementar el contador de descargas
        filteredData = filteredData.map(row => {
            if (!row.DownloadCount) {
                row.DownloadCount = 1;
            } else {
                row.DownloadCount += 1;
            }
            return row;
        });

        // Escribir el archivo CSV
        const csvWriter = createObjectCsvWriter({
            path: 'filtered_leads.csv',
            header: Object.keys(filteredData[0]).map(key => ({ id: key, title: key }))
        });

        csvWriter.writeRecords(filteredData)
            .then(() => {
                console.log('CSV escrito correctamente.');
                res.download('filtered_leads.csv', 'filtered_leads.csv', (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo:', err);
                        res.status(500).send('Error al enviar el archivo.');
                    }
                });
            })
            .catch(error => {
                console.error('Error al escribir el archivo CSV:', error);
                res.status(500).send('Error al escribir el archivo CSV.');
            });
    } catch (error) {
        console.error('Error durante el proceso de filtrado:', error);
        res.status(500).send('Error durante el proceso de filtrado.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
