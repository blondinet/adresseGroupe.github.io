import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Read data
async function readData() {
    try {
        const querySnapshot = await getDocs(collection(db, "adresseTable"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Document ID:", doc.id, "Index:", data.index, "Cluster:", data.cluster, 
                "Date de passage:", data.date_de_passage.toDate(), 
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
        const docRef = await addDoc(collection(db, "adresseTable"), {
            index: index,
            cluster: cluster,
            date_de_passage: Timestamp.fromDate(new Date(date_de_passage)),
            assigned: assigned
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Update data
async function updateData(index, newData) {
    try {
        if (newData.date_de_passage) {
            newData.date_de_passage = Timestamp.fromDate(new Date(newData.date_de_passage));
        }

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
                "Date de passage:", data.date_de_passage.toDate(), 
                "Assigné:", data.assigned);
        } else {
            console.log("No document found with index: " + index);
        }
    } catch (error) {
        console.error("Error finding document: ", error);
    }
}


// Make functions available globally
window.readData = readData;
window.writeData = writeData;
window.updateData = updateData;
window.deleteData = deleteData;
window.findDataByIndex = findDataByIndex;


// Export functions to make them accessible
export { readData, writeData, updateData, deleteData, findDataByIndex };
