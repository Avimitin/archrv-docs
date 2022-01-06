# Arch RV Manual

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Local Development

```
$ npx docusaurus start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### About commit message

I am using my own commit convention, you can read it [here](https://commit-convention.sh1mar.in/).

TL;DR:
  - new means new update
  - rwt means rewrite, similar to refactor
  - fix means a fix commit
  - odd means this commit don’t affect the main project, like CI, build script or other stuff.
  - ! means breaking change

### File Structure

```text
.
├── blog                 <- Blog
├── docs
│  ├── asserts           <- Asserts for documents
│  ├── guide             <- Category guide
│  ├── intro.md          <- Index page
│  └── record            <- Category record
├── docusaurus.config.js <- Project config
├── sidebars.js          <- Sidebars config
├── src
│  ├── components        <- Partial pages
│  ├── css
│  └── pages             <- Webpage written in React
└── static
   └── img
```
