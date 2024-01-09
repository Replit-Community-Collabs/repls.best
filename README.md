repls.best was intended to get trending repls and provide them with a `PROJECT.repls.best` subdomain to showcase their qualtiy. We would manually approve these in Discord. However, the project never got finished.


Environment variables:

- `SID`: connect.sid
- `GQL_QUERY_TRENDING_REPLS`: Replit GraphQL Query for Trending Repls from home. Returns 6 items with the following:
    - id
    - iconUrl
    - description
    - title
    - imageUrl
    - templateInfo
        - label
        - iconUrl
    - likeCount
    - runCount
    - commentCount
    - url
    - nextPagePathname
    - tags
        - id
        - isOfficial
    - owner
        - id
        - username
        - url
        - image
    - __typename (for each of the entities where it appears)

- `GQL_QUERY_REPL_URL`: Takes repl id returning hostedUrl, isServer, username (user), username (team) and language.
- `GQL_MUTATION_SEND_COMMENT`: Takes `$body` (comment text) and `$replId` (id of the repl to comment on)
- `CF_API_TOKEN`: Cloudflare API key for updating zone dns
- `CF_ZONE_ID`: Cloudflare zone id for domain
- `HOOK`: Discord webhook to post to
