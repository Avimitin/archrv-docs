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
