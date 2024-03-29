// also who's getting the domain, it's not cheap
// its 3.99 on godaddy https://www.godaddy.com/domainsearch/find?domainToCheck=repls.best&tmskey=1dom_03_buydomain

// cant make subdomains of the Repl's url ah true

// Maybe its an idea to add a option to manually get a repl.best/gold subdomain? Like if you have ... likes but didn't got on trending? Or something like that. (Raadsel)

// Also what about malicious repls. The entire domain could be marked as malicious if one subdomain decides to do some stuff. + if we get a subdomain for root & www we could add a form where people who got a subdomain want it to be shorter (ex: amongus-remake.repls.best) -- Raadsel

// We can cover ourselves from getting blacklisted by saying we don't condone anything on the subdomains, but we still need to protect others by watching for malicious subdomains. -- Will that work?

// CatR3kd here, I added a JSON DB with a backup that automatically checks for empty files. Also, I made sure that no repl can appear twice, it just gets updated. For malicious repls, we can either do it with humans (moderators), or programmatically, which is the dream. Also, should we make a discord server and use that to communicate, and have a bot send the new domains in for verification? And, how are we contacting them? Discord bot? Replit bot? 

//For contacting I think a Replit bot (maybe a new one or G'day bot or something) if we want it to be automatic (which we want). Discord bot to contact people would even more sounds like a scam. And if you want you can make a discord server. Maybe we could moderate malicious repls also via Discord. But it would be unlikely that there will be a malicious repl on trending + there are not that much repls on trending so it would be easy to do with humans.



const fs = require('fs');
const trendingReplsQuery = process.env.GQL_QUERY_TRENDING_REPLS;
const getReplURLQuery = process.env.GQL_QUERY_REPL_URL;

const GraphQL = require('./gql');
const token = process.env.SID;
const client = new GraphQL(token);
const bot = new (require('./bot'))(client);
//removed light fetch

const fetch = require('node-fetch'); //Raadsel here, somehow discord webhooks only work trough node-fetch and not lightfetch 

const replteam = { team: ["Raadsel", "haroon", "CatR3kd", "DillonB07", "VulcanWM", "codingMASTER398", "CosmicBear", "conspicious", "sojs", "bddy", "PikachuB2005"], special: ["RCC", "CommunityCollab", "replit-community-collabs"] } //if more people join they can add themselves here 

replteam.schemaUsers = [
  ...replteam.team
];

var lastRepls = [];

function updateData(){
  fs.writeFileSync('Data/Current.json', JSON.stringify({}));
  client.request(trendingReplsQuery).then(data => {
    let repls = data.trendingReplPosts.map(({repl}) => repl.id)

    // Updated to 10 seconds between request
    let replCount = 0;
    const verifyInterval = setInterval(function(){
      client.request(getReplURLQuery, { id: repls[replCount] }).then(data => {
        // Send verification if it hasn't been sent recently
        if(!(lastRepls.includes(repls[replCount]))) sendVerification(data);

        replCount++;

        saveToDB(data.repl)
        
        if(replCount >= 5){
          lastRepls = repls;
          clearInterval(verifyInterval);
        }
      });
    }, 10000);
  })
}

updateData();
setInterval(updateData, 5 * 60 * 1000);



// Verification and creation steps by CatR3kd

function registerNewRecord(record_type, subdomain, content) {
  fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({
      type: record_type,
      name: subdomain+"replsbest",
      content,
      ttl: 1
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ process.env.CF_API_TOKEN
    }
  }).then(r => r.json());
}

function editExistingRecord(record_type, subdomain, content, cf_id) {
  fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records/${cf_id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      content,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ process.env.CF_API_TOKEN
    }
  }).then(r => r.json());
}

// Function to be called once a repl is verified
function createEntry(data, id){
  sendReplMessage(data, id);
  
  saveToDB(data.repl);
  
  registerNewRecord("CNAME", data.repl.slug.toLowerCase(), data.repl.id+".id.repl.co");
  
  registerNewRecord("TXT", data.repl.slug.toLowerCase(), `replit-verify=${data.repl.id}`);
}

// Verify via Discord webhook
function sendVerification(data){
  const db = JSON.parse(fs.readFileSync('Data/DB.json'));
  if(db.hasOwnProperty(data.repl.slug)) return;
  
  let domain = data.repl.slug.toLowerCase()+'.repls.best';
  const hookmsg = {
    "content": "`<@&1032369704507023424>`",
    "embeds": [
      {
        "title": "New repl to be approved!",
        "description": "Approve via <@1032306356692205578>.",
        "color": 15884807,
        "fields": [
          {
            "name": "Default Domain",
            "value": `${domain}`,
            "inline": true
          },
          {
            "name": "Spotlight page",
            "value": `https://replit.com/@${data.repl.owner.username}/${data.repl.slug}?v=1`,
            "inline": true
          },
          {
            "name": "Webserver?",
            "value": data.repl.config.isServer || data.repl.language ==  "html" ? "Yes" : "No",
            "inline": true
          }
        ],
        "footer": {
          "text": "repls.best!",
          "icon_url": "https://blog.replit.com/images/logo.svg"
        }
      }
    ],
    "attachments": []
  }

        
        
  fetch(process.env.HOOK, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(hookmsg)
  });
}

function sendReplMessage(data, id){
  let message;
  let domain = data.repl.slug.toLowerCase()+'.repls.best';
  if (data.repl.config.isServer || data.repl.language == "html") {
    message = `Hey, @${data.repl.owner.username}! Congrats on getting your Repl on Trending! You're now eligible for a free \`repls.best\` domain. The default one for your repl is \`${domain}\`. If you would like to claim this, please add \`${domain}\` as a domain in your repl and click verify.  \n*With ❤️ from [The RCC Team](https://replit.com/@rcc)*`;
  } else {
    message = `Hey, @${data.repl.owner.username}! Congrats on getting your Repl on Trending! You're now eligible for a free \`repls.best\` domain. The default one for your repl is \`${domain}\`. Since your repl is not a webserver, it will redirect to the spotlight page, and is setup already.  \n*With ❤️ from [The RCC Team] (https://replit.com/@rcc)*`;
  }

  bot.comment(id, message);
}



// DB by CatR3kd



function saveToDB(repl){
  // Check for lost data
  checkData();

  // Get DB and create new entry
  const db = JSON.parse(fs.readFileSync('Data/DB.json'));
  const current = JSON.parse(fs.readFileSync('Data/Current.json'));
  const replName = repl.slug;
  
  // Delete old instance of repl
  if(db.hasOwnProperty(replName)){
    delete db[replName];
  }

  const obj = {
    name: replName,
    language: repl.language,
    owner: repl.owner.username,
    url: repl.hostedUrl
  }
  
  // Add to DB
  db[replName] = obj;
  fs.writeFileSync('Data/DB.json', JSON.stringify(db));

  // Add to current
  current[replName] = obj;
  fs.writeFileSync('Data/Current.json', JSON.stringify(current));
  
  // Update backup file
  fs.writeFileSync('Data/Backup.json', JSON.stringify(db)); // Backup by stringifying again, just so it's practitcally impossible to have both corrupted.

  // Double check for lost data
  checkData();
}


function checkData(){
  if((isEmpty('Data/Backup.json') == true) && (isEmpty('Data/DB.json') == false)){
    // Only Backup is empty
    fs.writeFileSync('Data/Backup.json', fs.readFileSync('Data/DB.json'));
    console.log("Backup data is lost. Syncing with main");
    return;
  }
  
  if(isEmpty('Data/DB.json') == true){
    if(isEmpty('Data/Backup.json') == false){
      // Only DB is empty
      fs.writeFileSync('Data/DB.json', fs.readFileSync('Data/Backup.json'));
      console.log("Main data is lost. Syncing with backup.");
      
      return;
    } else if(isEmpty('Data/Backup.json') == true){
      // Both DB and backup are empty
      console.log('All data is lost, bad'); 
      const hookmsg = {
    "content": "All data is lost, badbad",
    "embeds": [],
    "attachments": []
      }
      fetch(process.env.HOOK, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hookmsg)
      });
      fs.writeFileSync('Data/Backup.json', JSON.stringify({}));
      fs.writeFileSync('Data/DB.json', JSON.stringify({}));

      return;
    }
  }
}

// Check data on start
checkData();


// Check if JSON is empty
function isEmpty(path) {
  const file = fs.readFileSync(path);
  for(var key in file) {
    if(file.hasOwnProperty(key) && Object.keys(JSON.parse(file)).length !== 0)
      return false;
    }
  return true;
}




// Server + API by CatR3kd
// GQL rewrite by Haroon
// oh no he's not kidding guys we have to use gql );;;;;;;;;;;;;;;;;;;; i haven't found a good gql middleware for express
// lol
// Okay what if I make a different route for gql but we still use REST at the same time

// Express server + API:
const path = require('path');
const express = require('express');
const app = express();
const { MAXREQUESTS, PERMIN } = require("./Data/ratelimits.json");
const rateLimit = require("express-rate-limit");

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(fs.readFileSync('./schema.graphql', 'utf-8'))

const resolver = {
  domains({ current }) {
    const data = JSON.parse(fs.readFileSync(`./Data/${current ? 'Current' : 'DB'}.json`, 'utf-8'))

    let resp = []
    
    Object.keys(data).forEach((d, i) => {
      let e = data[d]
      resp.push(e)
    })

    return resp
  },
  team() {
    return replteam.team
  },
  domainStatus({ domainSlug, status }, {username, id}, context) {
    if (!replteam.team.includes(username)) {
      let error = new graphql.GraphQLError(
        'You can\'t use this mutation.'
      )
      throw error;
    }

    return {
      name: "Test",
      language: "nix",
      owner: "haroon",
      url: "https://test.haroon.repl.co/",
      update: ""
    }
  }
}

// added ratelimits again - Raadsel
const limiter = rateLimit({
	windowMs: PERMIN * 60 * 1000,
	max: MAXREQUESTS,
	standardHeaders: true,
	legacyHeaders: false,
})

app.use("/api", limiter)


app.listen(8000, () => {
  console.log(`App listening on port 8000`);
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname + '/Public/index.html'));
});
//public API
app.get('/api', (req,res) => {
  res.sendFile(path.join(__dirname + '/Public/docs.html'));
});

app.get('/docs', (req,res) => {
  res.sendFile(path.join(__dirname + '/Public/docs.html'));
}); //docs

app.get('/api/all', (req, res) => { //all repls in DB
  res.sendFile(path.join(__dirname + '/Data/DB.json'));
});

app.get('/api/current', (req, res) => { //see current trending repls
  res.sendFile(path.join(__dirname + '/Data/Current.json'));
});

app.get('/api/team', (req, res) => { //repl team API
  res.send(replteam); 
});

const graphql = require('graphql');

function Introspection(req) {
  return function(context) {
    return {
      Field(node) {
        if (!replteam.schemaUsers.includes(req.get('X-Replit-User-Name'))) {
          if (node.name.value === '__schema' || node.name.value === '__type') {
            let error = new graphql.GraphQLError(
              'GraphQL introspection is only allowed for staff members and some whitelisted users. Login via https://replit.com/auth_with_repl_site?domain=replsbest-working.replit-community-efforts.repl.co'
            )
  				  context.reportError(error);
  			  }	
        }
      }
    }
  }
}

app.use('/graphql', (req, res, next) => {
  graphqlHTTP({
    schema,
    rootValue: resolver,
    graphiql: true,
    validationRules: [
      Introspection(req)
    ],
    context: {
      username: req.get('X-Replit-User-Name'),
      id: req.get('X-Replit-User-Id')
    }
  })(req, res, next)
})

//private API here (with key)

const keys = process.env.PRIVATEAPIKEY


app.get("/api/private/", function (req, res) {
  const key = req.query.t; 

  if (!key) {
    res.send({ Error: "No key given" }); 

  } else if (!key == keys) {
    res.send({ Error: "Key provided invalid" }); 

  } else {
    res.send({ info: `soon^tm`, Error: false });

  }
});
