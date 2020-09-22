const users = []

const addUser = ({id, username, room}) =>{
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room){
        return {
            error: "username and room are required"
        }
    }

    //check for existing user
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    //validate user
    if (existingUser){
        return {
            error: "Username is in use"
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const userIndex = users.findIndex((user)=>user.id === id)
    if (userIndex!=-1){
        return users.splice(userIndex, 1)[0] //remove elements starting from an index, returns an array of the deleted the elements
    }
}

const getUser = (id) => users.find((user)=>user.id==id)

const getUsers = (room) => users.filter((user)=>user.room === room)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsers
}