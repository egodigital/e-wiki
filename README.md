[![npm](https://img.shields.io/npm/v/swagger-jsdoc-express.svg)](https://www.npmjs.com/package/swagger-jsdoc-express)

# e-wiki

Sets up one or more [Wikis](https://github.com/showdownjs/showdown) via [Express](https://expressjs.com/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save e-wiki
```

## Example

### Setup UI

```typescript
import * as express from 'express';
import { setupWikiUI } from 'swagger-jsdoc-express';

const app = express();

// create a '/swagger' endpoint ...
setupWikiUI(
    {
        cwd: '/root/path/to/wiki/files',
        title: 'My wiki',
    },

    // ... and directly register it
    // in 'app'
    app
);

app.listen(8080, () => {
    // should be available via
    // http://localhost:8080/wiki
    // now
});
```

### Document API

Create a `index.md` inside the root of your wiki folder and fill it with markdown content.

You also able to define a directory structure and store any kind of files, like images or videos, which are handled like on a static HTTP server.

## Resources

* [GitHub Markdown Language](https://guides.github.com/features/mastering-markdown/)
