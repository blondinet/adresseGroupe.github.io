// parse CSV data protecting cells with included commas (like some adresses)
function parseCSV(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const row = [];
        let insideQuotes = false;
        let cellContent = '';
        
        for (let char of line) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                row.push(cellContent.trim());
                cellContent = '';
            } else {
                cellContent += char;
            }
        }
        row.push(cellContent.trim());
        return row;
    });
}

export { parseCSV }
