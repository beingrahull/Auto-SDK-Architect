The free fake REST API, since 2013

# Fake data you can rely on.

JSONPlaceholder is a free online REST API that you can use whenever you
need some fake data: in documentation and tutorials, in code examples, in
a quick prototype, or simply to test things locally.


120 billion requests / monthFree for everyone, and it stays that way. **No signup, no API key.**

Since 2013Same routes, same responses. **Code written against it a decade ago still works.**

https://jsonplaceholder.typicode.com

Powered by [json-server★ 75.7k](https://github.com/typicode/json-server) [lowdb★ 22.6k](https://github.com/typicode/lowdb)

## Sponsors

JSONPlaceholder is supported by the following companies and
[sponsors](https://github.com/sponsors/typicode) on GitHub.


[![Mockend](https://jsonplaceholder.typicode.com/mockend.svg)](https://mockend.com/)[![Zuplo](https://github.com/user-attachments/assets/adfee31f-a8b6-4684-9a9b-af4f03ac5b75)](https://zuplo.link/json-server-web)[![SerpApi](https://github.com/user-attachments/assets/52b3039d-1e4c-4c68-951c-93f0f1e73611)](https://serpapi.com/?utm_source=typicode)[Your company logo here](https://github.com/sponsors/typicode)

## Guide

Examples use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),
but any HTTP client works.


GetListCreateUpdatePatchDeleteFilterNested

```
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

```
fetch('https://jsonplaceholder.typicode.com/posts')
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
[\
  { "userId": 1, "id": 1, "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", "body": "quia et suscipit…" },\
  { "userId": 1, "id": 2, "title": "qui est esse", "body": "est rerum tempore vitae…" },\
  // … 100 posts\
]
```

```
fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  body: JSON.stringify({
    title: 'foo',
    body: 'bar',
    userId: 1,
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
{
  "title": "foo",
  "body": "bar",
  "userId": 1,
  "id": 101
}
```

The resource is not really created on the server, but the response is faked as if.

```
fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'PUT',
  body: JSON.stringify({
    id: 1,
    title: 'foo',
    body: 'bar',
    userId: 1,
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
{
  "id": 1,
  "title": "foo",
  "body": "bar",
  "userId": 1
}
```

The resource is not really updated on the server, but the response is faked as if.

```
fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'PATCH',
  body: JSON.stringify({
    title: 'foo',
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
{
  "userId": 1,
  "id": 1,
  "title": "foo",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

The resource is not really patched on the server, but the response is faked as if.

```
fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'DELETE',
})
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
{}
```

The resource is not really deleted on the server, but the response is faked as if.

```
// All the posts that belong to the first user
fetch('https://jsonplaceholder.typicode.com/posts?userId=1')
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
[\
  { "userId": 1, "id": 1, "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", "body": "quia et suscipit…" },\
  { "userId": 1, "id": 2, "title": "qui est esse", "body": "est rerum tempore vitae…" },\
  // … 10 posts\
]
```

Basic filtering is supported through query parameters.

```
// Equivalent to /comments?postId=1
fetch('https://jsonplaceholder.typicode.com/posts/1/comments')
  .then(response => response.json())
  .then(json => console.log(json))
```

Response

```
[\
  { "postId": 1, "id": 1, "name": "id labore ex et quam laborum", "email": "Eliseo@gardner.biz", "body": "laudantium enim quasi…" },\
  { "postId": 1, "id": 2, "name": "quo vero reiciendis velit similique earum", "email": "Jayne_Kuhic@sydney.com", "body": "est natus enim nihil…" },\
  // … 5 comments\
]
```

One level of nested route is available: /posts/1/comments, /albums/1/photos, /users/1/albums, /users/1/todos and /users/1/posts.

## Resources

JSONPlaceholder comes with a set of 6 common resources.

|     |     |
| --- | --- |
| [/posts](https://jsonplaceholder.typicode.com/posts) | 100 posts |
| [/comments](https://jsonplaceholder.typicode.com/comments) | 500 comments |
| [/albums](https://jsonplaceholder.typicode.com/albums) | 100 albums |
| [/photos](https://jsonplaceholder.typicode.com/photos) | 5000 photos |
| [/todos](https://jsonplaceholder.typicode.com/todos) | 200 todos |
| [/users](https://jsonplaceholder.typicode.com/users) | 10 users |

Resources have relations. For example: posts have many comments, albums have
many photos. See [nested routes](https://jsonplaceholder.typicode.com/#nested) for the full list.


## Routes

All HTTP methods are supported. You can use http or https for your requests.

|     |     |
| --- | --- |
| GET | [/posts](https://jsonplaceholder.typicode.com/posts) |
| GET | [/posts/1](https://jsonplaceholder.typicode.com/posts/1) |
| GET | [/posts/1/comments](https://jsonplaceholder.typicode.com/posts/1/comments) |
| GET | [/comments?postId=1](https://jsonplaceholder.typicode.com/comments?postId=1) |
| POST | /posts |
| PUT | /posts/1 |
| PATCH | /posts/1 |
| DELETE | /posts/1 |

## Need your own data?

[Mockend](https://mockend.com/) gives you a fake API per
developer, agent or feature, from a single file in your GitHub repo.