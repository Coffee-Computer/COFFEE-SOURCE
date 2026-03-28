# coffee.masto

**Mastodon-compatible REST client** built on [`coffee.request`](../COFFEE-REQUEST/README.md). Use for **Anti-Social α** and any Coffee app that talks to a Mastodon-style instance.

- **Not** full ActivityPub signing in the browser — this is the **official REST API** (`/api/v1/*`, `/api/v2/*`).
- **No OAuth UI** — pass a token from your app (developer token, or OAuth flow you implement elsewhere).

## Load order

```html
<script src="../COFFEE-REQUEST/coffee-request.js"></script>
<script src="./coffee-masto.js"></script>
```

## Usage

```js
const api = coffee.masto({
  instanceUrl: 'https://mastodon.social',
  token: 'your_oauth_access_token'
});

// Or mutate later
api.setInstanceUrl('https://mastodon.online');
api.setToken(token);

const me = await api.verifyCredentials();
const feed = await api.homeTimeline({ limit: 20 });

await api.postStatus({
  status: 'Hello from Coffee',
  visibility: 'public' // public | unlisted | private | direct
});

// Media (then pass media.id in postStatus as media_ids: [id])
const media = await api.uploadMedia(fileInput.files[0], { description: 'alt text' });
await api.postStatus({ status: 'pic', media_ids: [media.id] });

await api.favourite(statusId);
await api.reblog(statusId);
await api.deleteStatus(statusId);
```

## API surface

| Method | Mastodon method |
|--------|-----------------|
| `verifyCredentials()` | GET `/api/v1/accounts/verify_credentials` |
| `homeTimeline(params)` | GET `/api/v1/timelines/home` |
| `publicTimeline(params)` | GET `/api/v1/timelines/public` |
| `tagTimeline(tag, params)` | GET `/api/v1/timelines/tag/:hashtag` |
| `listTimeline(listId, params)` | GET `/api/v1/timelines/list/:id` |
| `postStatus(body)` | POST `/api/v1/statuses` |
| `getStatus(id)` | GET `/api/v1/statuses/:id` |
| `statusContext(id)` | GET `/api/v1/statuses/:id/context` |
| `deleteStatus(id)` | DELETE `/api/v1/statuses/:id` |
| `favourite` / `unfavourite` | POST `…/favourite`, `…/unfavourite` |
| `reblog` / `unreblog` | POST `…/reblog`, `…/unreblog` |
| `uploadMedia(file, opts)` | POST `/api/v2/media` (multipart) |
| `getAccount(id)` | GET `/api/v1/accounts/:id` |
| `accountStatuses(id, params)` | GET `/api/v1/accounts/:id/statuses` |
| `relationships(accountIds)` | GET `/api/v1/accounts/relationships` |
| `search(q, params)` | GET `/api/v2/search` |
| `notifications(params)` | GET `/api/v1/notifications` |
| `dismissNotification(id)` | POST `/api/v1/notifications/:id` |

Query params (`limit`, `since_id`, `max_id`, etc.) are passed as objects; arrays for `relationships` use `id[]` as Mastodon expects.

## Errors

Uses `coffee.request` behavior: **throws** on 4xx/5xx with `err.status` and `err.body` when JSON.

## Docs

- [Mastodon API](https://docs.joinmastodon.org/methods/)

## Demo

Serve `COFFEE-SOURCE` over HTTP and open **`MASTO-DEMO.html`**. Enter instance + token (e.g. from Preferences → Development → access token), then **Verify** / **Home timeline**.
