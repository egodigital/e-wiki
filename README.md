[![npm](https://img.shields.io/npm/v/e-wiki.svg)](https://www.npmjs.com/package/e-wiki)

# e-wiki

Sets up one or more [wikis](https://github.com/showdownjs/showdown) via [Express](https://expressjs.com/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save e-wiki
```

## Example

### Setup UI

```typescript
import * as express from 'express';
import { setupWikiUI } from 'e-wiki';

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

You should now be able to access the (start) page with `/` url.

You also able to define a directory structure and store any kind of files, like images or videos, which are handled like on a static HTTP server.

## Resources

* [GitHub Markdown Language](https://guides.github.com/features/mastering-markdown/)
