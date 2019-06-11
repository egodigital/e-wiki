[![npm](https://img.shields.io/npm/v/e-wiki.svg)](https://www.npmjs.com/package/e-wiki)

# e-wiki

Sets up one or more static [wikis](https://github.com/showdownjs/showdown) via [Express](https://expressjs.com/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save e-wiki
```

## Example

## Quick start

### Setup UI

```typescript
import * as express from 'express';
import { setupWiki } from 'e-wiki';

const app = express();

// create a '/swagger' endpoint ...
setupWiki(
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

### Create first page

Create a `index.md` inside the root of your wiki folder and fill it with [Markdown content](https://guides.github.com/features/mastering-markdown/).

You should now be able to access the (start) page with `/` url.

You also be able to define a directory structure and store any kind of files, like images or videos, which are handled like on a static HTTP server.

## Charts and diagrams

Markdown pages can also include diagrams and charts, using a language parsed and rendered by [mermaid](https://github.com/knsv/mermaid).

Those have to be put into a code block, which uses `mermaid` as language:

    Example graph:
    
    ```mermaid
    graph TD;
        A-->B;
        A-->C;
        B-->D;
        C-->D;
    ```

### Documentation

API documentation can be found [here](https://egodigital.github.io/e-wiki/).

## Resources

* [GitHub Markdown Language](https://guides.github.com/features/mastering-markdown/)
* [mermaid](https://github.com/knsv/mermaid)

## Copyright

That software makes use of free version of [MD Bootstrap](https://mdbootstrap.com/).
