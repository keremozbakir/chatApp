const fs = require('fs');
const filePath = './public/messages.json';


function filterMessages(messages, messageAmount) {
    const adminMessages = messages.filter(message => message.isAdmin === true);
    let nonAdminMessages;

    if (messageAmount >= 0) {
        nonAdminMessages = messages.filter(message => message.isAdmin === false).slice(0, messageAmount);
    } else {
        nonAdminMessages = messages.filter(message => message.isAdmin === false).slice(messageAmount);
    }

    return adminMessages.concat(nonAdminMessages);
}
function generateRandomInteger() {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function addNewMessage(newObject) {
     // Read the existing JSON data from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }
        newObject.id = generateRandomInteger()
        let messages = JSON.parse(data); // Parse the JSON data into an array of objects
        messages.push(newObject);
        let updatedData = JSON.stringify(messages, null, 4); // Convert the updated array back to JSON format

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, updatedData, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log('Object appended successfully.');
            }
        });
    });
}

function allMessages() {
    
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const messages = JSON.parse(jsonData);
        return filterMessages(messages,-10)
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}



function deleteMessagesByIds(idsToDelete) {
    // Read the existing JSON data from the file
    console.log("delete messages by id")
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file: ${err}`);
            return;
        }
        let messages = JSON.parse(data); // Parse the JSON data into an array of objects

        // Iterate through the array of IDs to delete
        idsToDelete.forEach(idToDelete => {
            // Find the index of the object with the specified id
            const indexToDelete = messages.findIndex(message => message.id === idToDelete);

            if (indexToDelete !== -1) {
                // Remove the object from the array
                messages.splice(indexToDelete, 1);
                console.log(`Object with id ${idToDelete} deleted successfully.`);
            } else {
                console.log(`Object with id ${idToDelete} not found.`);
            }
        });

        // Convert the updated array back to JSON format
        let updatedData = JSON.stringify(messages, null, 4);

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, updatedData, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`All specified objects deleted successfully.`);
            }
        });
    });
}

module.exports = {
    filterMessages ,
    generateRandomInteger,
    addNewMessage,
    allMessages,
    deleteMessagesByIds
};