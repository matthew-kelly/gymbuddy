module.exports = function knexData(knex) {
  return {
    // Return user data for Friends list
    getFriendsList: (id) => {
      return knex.select('*')
      .from('friends')
      .join('users', 'friend_id', '=', 'users.id')
      .where({
        user_id: id
      })
    },

    // Return user data for Connections list
    getConnectionsList: (id) => {
      return knex.select('*')
      .from('connections')
      .join('users', 'connection_id', '=', 'users.id')
      .where({
        user_id: id
      })
    },

    // Return user and goals data for one user
    getUser: (id) => {
      return knex.select('*')
      .from('users')
      .join('goals', 'user_id', '=', 'users.id')
      .where({
        id: id
      })
    },

    // Return list of all users
    allUsers: () => {
      return knex.select('*')
        .from('users')
    }
  }
}