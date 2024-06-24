// parse CSV data protecting cells with included commas (like some adresses)
// function parseCSV(text) {
//     const lines = text.split('\n');
//     return lines.map(line => {
//         const row = [];
//         let insideQuotes = false;
//         let cellContent = '';
//         
//         for (let char of line) {
//             if (char === '"') {
//                 insideQuotes = !insideQuotes;
//             } else if (char === ',' && !insideQuotes) {
//                 row.push(cellContent.trim());
//                 cellContent = '';
//             } else {
//                 cellContent += char;
//             }
//         }
//         row.push(cellContent.trim());
//         return row;
//     });
// }


// first column is considered as index if not named
function parseCSV(csvText) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            complete: (results) => {
                // Get headers from the first row
                const headers = results.data[0];

                // rename first header as index if necessary
                if (headers[0] === null || headers[0] === '') {
                    headers[0] = "Index";
                }

                // Map the rest of the data to objects
                const mappedData = results.data.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        // discard empty headers
                        if (header !== null && header !== '')
                            obj[header] = row[index];
                    });
                    return obj;
                });

                resolve(mappedData);
            },
            error: (error) => {
                reject(error);
            },
            header: false, // we handle headers manually
            dynamicTyping: true, // Automatically convert to number, boolean, etc.
            skipEmptyLines: true // Skip empty lines
        });
    });
}

export { parseCSV }
