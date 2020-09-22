const generateMessage = (username, message) => {
    return {
        username,
        text: message,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, location) => {
    return {
        username,
        url: location,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation,
}