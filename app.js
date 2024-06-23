import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Read data
async function readData() {
    try {
        const querySnapshot = await getDocs(collection(db, "adresseTable"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Document ID:", doc.id, "Index:", data.index, "Cluster:", data.cluster, 
                "Date de passage:", data.date_de_passage,
                "Assigné:", data.assigned);
            return doc;
        });
    } catch (error) {
        console.error("Error reading documents: ", error);
    }
}

// Write data
async function writeData(index, cluster, date_de_passage, assigned) {
    try {
        const q = query(collection(db, "adresseTable"), where("index", "==", index));
        const querySnapshot = await getDocs(q);

        // Add document if no document with the same index exists
        if (querySnapshot.empty) {
            const docRef = await addDoc(collection(db, "adresseTable"), {
                index: index,
                cluster: cluster,
                date_de_passage: date_de_passage,
                assigned: assigned
            });
            console.log("Document written with ID: ", docRef.id);
        // Or update the existing document with same index
        } else {
            console.log("Document already exists with ID: " + querySnapshot.docs[0].id);
        }
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Update data
async function updateData(index, newData) {
    try {
        const q = query(collection(db, "adresseTable"), where("index", "==", index));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            await updateDoc(doc.ref, newData);
            console.log("Document successfully updated");
        } else {
            throw new Error("No document found with index: " + index);
        }
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Delete data
async function deleteData(index) {
    try {
        const q = query(collection(db, "adresseTable"), where("index", "==", index));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            await deleteDoc(doc.ref);
            console.log("Document successfully deleted");
        } else {
            throw new Error("No document found with index: " + index);
        }
    } catch (error) {
        console.error("Error removing document: ", error);
    }
}

// Find data by index
async function findDataByIndex(index) {
    try {
        const q = query(collection(db, "adresseTable"), where("index", "==", index));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            console.log("Found document - Index:", data.index, "Cluster:", data.cluster, 
                "Date de passage:", data.date_de_passage,
                "Assigné:", data.assigned);
        } else {
            console.log("No document found with index: " + index);
        }
    } catch (error) {
        console.error("Error finding document: ", error);
    }
}


async function transferVisits(spreadsheetURL) {
    fetch(spreadsheetURL)
        .then(response => response.text())
        .then(data => {
            // Parse the CSV data
            const rows = data.split('\n');
            const csvArray = rows.map(row => row.split(','));
            let fetchedDataVisited = csvArray;

            // check if group has been assigned
            let isAssigned = Array(fetchedDataVisited.length).fill(false);

            // check if group has a date
            let dates = Array(fetchedDataVisited.length).fill('');

            // iterate over data except first row which contains csv headers
            // compute the dates and assignments for each row as some are omitted
            fetchedDataVisited.slice(1).forEach((visit, i) => {
                let index = visit[0];
                let group = visit[2];
                let date = visit[3];
                let assigned = visit[4];

                if (
                    date !== '' &&
                    date !== '\r'
                ) {
                    dates[index] = date;
                }

                if (assigned === 'TRUE') {
                    isAssigned[index] = date;
                }
            });

            // write to database
            fetchedDataVisited.slice(1).forEach((visit, i) => {
                let index = visit[0];
                let group = visit[2];
                let date = dates[index];
                let assigned = isAssigned[index];
                writeData(index, group, date, assigned);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
        });
}


// Make functions available globally
window.readData = readData;
window.writeData = writeData;
window.updateData = updateData;
window.deleteData = deleteData;
window.findDataByIndex = findDataByIndex;


// Export functions to make them accessible
export { readData, writeData, updateData, deleteData, findDataByIndex, transferVisits};
