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




module.exports = {
    filterMessages 
};