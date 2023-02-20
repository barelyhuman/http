# @barelyhuman/http

> Tiny composable utils for node http

Most of these are already being solved by much larger libraries so I won't
promise the most well maintained library. There's better libs out there.

As to why I'm building these again. A few of them have a few issues that I wish
to be fix but instead, I felt like also learning about them from the base up.
Most of these I've built a few times and this is probably the 2nd or 3rd
iteration over them.

A few of them are already in use in production at work and are just copied here
with a few details stripped out.

## Contributing

### Workflow

- Check if there's any issues that you'd like to pick up
- Consult with the maintainer that no one else is working on that issue.
- Fork the repo
- Add in tests with the fixes where apt
- Raise a PR with the fix and wait for a review / merge

### Development

The package is straightforward and built on small individual modules.

**Prerequisite**

1. Node >= v14
2. Basic understanding of Git

**Setup**

1. Clone the repo

```sh
git clone git@github.com:barelyhuman/http
```

2. Install dependencies

```sh
yarn install
```

3. Run a dev watcher

```sh
yarn dev
```

## License

[MIT](/license)

## Goals

- [ ] Engine

  - [x] Simple module loader
  - [ ] Auto loading

- [ ] Router

  - [x] Direct path matching
  - [x] Dynamic path matching
  - [x] Avoid Regex conflicting paths
  - [ ] add a radix trie/tree for longer paths

- [ ] Static

  - [x] Stream Serve file
  - [ ] Send through valid headers (size,mime, etc)
  - [ ] Handle cases for all methods (HEAD, OPTIONS)
  - [ ] Range Request handling

- [ ] Tests
