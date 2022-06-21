
function isAdmin (loggedInUser) {
    if(loggedInUser === process.env.ADMIN_MAIL) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {isAdmin}