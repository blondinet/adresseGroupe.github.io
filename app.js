import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { parseCSV } from './csv.js';
import { isInt } from './utils.js';

// Read data
async function readData() {
    try {
        const querySnapshot = await getDocs(collection(db, "adresseTable"));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                index: doc.data().index,
                cluster: doc.data().cluster,
                date_de_passage: doc.data().date_de_passage,
                assigned: doc.data().assigned
            });
            // console.log("Document ID:", doc.id, "Index:", data.index, "Cluster:", data.cluster, 
            //     "Date de passage:", data.date_de_passage,
            //     "Assigné:", data.assigned);
        });
        return data;
    } catch (error) {
        console.error("Error reading documents: ", error);
        return [];
    }
}

// Write data
async function writeData(index, cluster, date_de_passage, assigned) {
    if (
        !isInt(index) ||
        !isInt(cluster)
    ) {
        throw new Error("index and cluster should be integer");
    }

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
        // Or update the existing document with same index if it's different than the one on the database
        } else {
            const doc = querySnapshot.docs[0];
            const data = doc.data();

            const newData = {cluster: cluster, date_de_passage: date_de_passage, assigned: assigned}

            if (
                newData.cluster !== data.cluster ||
                newData.date_de_passage !== data.date_de_passage ||
                newData.assigned !== data.assigned
            ) {
                await updateDoc(doc.ref, newData);
                console.log("Document updated: ID=" + querySnapshot.docs[0].id);
            } else {
                // console.log("Document already up to date: ID=" + querySnapshot.docs[0].id);
            }
        }
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Update data
async function updateData(index, newData) {
    if (!isInt(index)) throw new Error("index should be integer");

    if (newData.cluster) {
        if (!isInt(newData.cluster))
        throw new Error("cluster should be integer");
    }

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
    if (!isInt(index)) throw new Error("index should be integer");

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
    if (!isInt(index)) throw new Error("Error: index should be integer");

    try {
        const q = query(collection(db, "adresseTable"), where("index", "==", index));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            console.log("Found document - Index:", data.index, "Cluster:", data.cluster, 
                "Date de passage:", data.date_de_passage,
                "Assigné:", data.assigned);
            return data;
        } else {
            console.log("No document found with index: " + index);
        }
    } catch (error) {
        console.error("Error finding document: ", error);
    }
}


// write database using google sheet
async function transferVisits(spreadsheetURL) {
    fetch(spreadsheetURL)
        .then(response => response.text())
        .then(async data => {
            let fetchedSheetData = await parseCSV(data);

            let nb_groups = Math.max(...fetchedSheetData.map(visit => visit.Groupe));
            console.log(nb_groups);

            // check if group has been assigned
            let isAssigned = Array(nb_groups+1).fill(false);

            // check if group has a date
            let dates = Array(nb_groups+1).fill('');

            // iterate over data except first row which contains csv headers
            // compute the dates and assignments for each row as some are omitted
            fetchedSheetData.forEach((visit, i) => {
                let index = visit.Index;
                let group = visit.Groupe;
                let date = visit["Date de passage"];
                let assigned = visit["Attribué"];

                if (
                    date !== '' &&
                    date !== '\r' &&
                    date !== null
                ) {
                    dates[group] = date;
                }

                if (assigned) {
                    isAssigned[group] = true;
                }
            });

            // write to database
            fetchedSheetData.forEach((visit, i) => {
                let index = visit.Index;
                let group = visit.Groupe;
                let date = dates[group];
                let assigned = isAssigned[group];
                writeData(index, group, date, assigned);
            });
            console.log('Transfer finished');
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
