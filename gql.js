// Better GQL Function
// Courtesy @RayhanADev <3

const { lightfetch } = require('lightfetch-node');

class GraphQL {
    constructor(token) {
        this.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Referrer': 'https://replit.com/',
            'Cookie': token ? `connect.sid=${token};` : '',
        };
    }
    async request(query, variables={}) {
        const { data, errors } = await lightfetch('https://replit.com/graphql', {
            method: 'POST',
            headers: {
                ...this.headers
            },
            body: {
                query,
                variables: JSON.stringify(variables),
            }
        }).then(async (res) => {
            let data = await res.text();

            //console.log(data);
            // ^^^^^^ IF YOU NEED TO DEBUG AN ERROR, UNCOMMENT THIS LINE

            return res.json()
        }).catch(e => {
            console.error(e)
            return { data: {}, errors: [e] }
        });

        if (errors) throw new Error(errors);
        return data;
    }
}

module.exports = GraphQL