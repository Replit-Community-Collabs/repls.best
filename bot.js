const createComment = require('fs').readFileSync('./GQL/sendComment.graphql', 'utf-8');

/** Class to comment on Replit repls */
class Bot {
    /**
      * Create a Replit Bot
      * @param {import('./gql')} gql - The graphql client.
    **/
    constructor(gql) {
        this.graph = gql
    }
    /**
      * Send a comment on a repl.
      * @param {String} text - The text to send.
      * @param {String} replId - The repl ID to send the comment to.
      * @returns Promise<Object>
    **/
    async comment(text, replId) {
        return this.graph.request(createComment, {
            body: text,
            replId: replId
        })
    }
}

module.exports = Bot