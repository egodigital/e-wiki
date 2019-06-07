/**
 * This file is part of the e-wiki distribution.
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany (https://www.e-go-digital.com/)
 *
 * e-wiki is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * e-wiki is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as _ from 'lodash';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as htmlEntities from 'html-entities';
import * as mimeTypes from 'mime-types';
import * as path from 'path';
import { exists, getResourcePath, isEmptyString, loadEJS, toStringSafe } from './util';


/**
 * A possible value for an express app.
 */
export type ExpressApp = express.Express | express.Router;

/**
 * Options for 'setupWikiUI()' function.
 */
export interface SetupWikiUIOptions {
    /**
     * The underlying Express host or router.
     */
    app: ExpressApp;
    /**
     * The custom CSS code or the function that provides it.
     */
    css?: string | ((file: string) => any);
    /**
     * The path to the FavIcon or the function that provides it.
     */
    favIcon?: string | ((file: string) => any);
    /**
     * The path to the page logo or a function that provides it.
     */
    logo?: string | ((file: string) => any);
    /**
     * The custom root endpoint (name). Default: '/wiki'
     */
    root?: string;
    /**
     * The custom current source directory. Default: '{PROCESS}/controllers'
     */
    source?: string;
    /**
     * The function that generates the sub title.
     *
     * @return {any} The value for the subtitle.
     */
    subTitle?: (file: string) => any;
    /**
     * The page title.
     */
    title?: string;
}


const DEFAULT_FILENAME = 'index.md';


/**
 * Initializes wiki UI.
 *
 * @param {InitControllersOptions} opts The options.
 */
export function setupWikiUI(opts: SetupWikiUIOptions) {
    let srcDir = toStringSafe(opts.source);
    if (isEmptyString(srcDir)) {
        srcDir = path.join(
            process.cwd(), 'wiki'
        );
    }
    if (!path.isAbsolute(srcDir)) {
        srcDir = path.join(
            process.cwd(), srcDir
        );
    }
    srcDir = path.resolve(srcDir);

    let subTitleGenerator = opts.subTitle;
    if (!subTitleGenerator) {
        // default

        subTitleGenerator = (file) => {
            const REL_PATH = path.relative(
                srcDir, file
            );

            return (
                path.dirname(REL_PATH) + '/' + path.basename(
                    file, path.extname(file)
                )
            ).substr(2);
        };
    }

    let favIconProvider: (file: string) => any;
    if (opts.favIcon) {
        if (_.isFunction(opts.favIcon)) {
            favIconProvider = opts.favIcon as any;
        } else {
            favIconProvider = () => toStringSafe(opts.favIcon);
        }
    } else {
        favIconProvider = () => '/img/favicon.ico';
    }

    let logoProvider: (file: string) => any;
    if (opts.logo) {
        if (_.isFunction(opts.logo)) {
            logoProvider = opts.logo as any;
        } else {
            logoProvider = () => toStringSafe(opts.logo);
        }
    } else {
        logoProvider = () => '/img/ego-logo.svg';
    }

    let cssGenerator: (file: string) => any;
    if (opts.css) {
        if (_.isFunction(opts.css)) {
            cssGenerator = opts.css as any;
        } else {
            cssGenerator = () => toStringSafe(opts.css);
        }
    } else {
        cssGenerator = () => '';
    }

    // static resources
    opts.app.use('/css', express.static(getResourcePath('css')));
    opts.app.use('/font', express.static(getResourcePath('font')));
    opts.app.use('/fonts', express.static(getResourcePath('fonts')));
    opts.app.use('/img', express.static(getResourcePath('img')));
    opts.app.use('/js', express.static(getResourcePath('js')));

    opts.app.get('*', async (req, res) => {
        try {
            let currentDir = toStringSafe(req.path)
                .trim()
                .split(path.sep).join('/');
            if (currentDir.startsWith('/')) {
                currentDir = currentDir.substr(1)
                    .trim();
            }

            const FILE_OR_FOLDER_PATH = path.resolve(
                path.join(
                    srcDir, currentDir
                )
            );

            if (
                FILE_OR_FOLDER_PATH === srcDir ||
                FILE_OR_FOLDER_PATH.startsWith(srcDir + path.sep)
            ) {
                if (
                    !FILE_OR_FOLDER_PATH.split(path.sep)
                        .some(x => x.trim().startsWith('.'))  // any part must not start with '.'
                ) {
                    const STAT = await fs.stat(FILE_OR_FOLDER_PATH);

                    let filePath: string;
                    if (STAT.isDirectory()) {
                        filePath = path.resolve(
                            path.join(FILE_OR_FOLDER_PATH, DEFAULT_FILENAME),
                        );
                    } else if (STAT.isFile()) {
                        filePath = FILE_OR_FOLDER_PATH;
                    }

                    if (filePath && (await exists(filePath))) {
                        let mimeType = mimeTypes.lookup(filePath);
                        if (false === mimeType) {
                            mimeType = 'application/octet-stream';
                        }

                        if (
                            !mimeType.startsWith('image/') &&
                            !mimeType.startsWith('video/') &&
                            !mimeType.endsWith('/json')
                        ) {
                            // handle as markdown file
                            const HTML_ENC = new htmlEntities.AllHtmlEntities();

                            const RELATIVE_PATH = path.relative(
                                srcDir, filePath
                            );

                            let title = toStringSafe(opts.title)
                                .trim();
                            if ('' === title) {
                                title = 'e-wiki';
                            }

                            let subTitle = toStringSafe(
                                await Promise.resolve(
                                    subTitleGenerator(filePath)
                                )
                            ).trim();
                            if ('' !== subTitle) {
                                subTitle = ' :: ' + subTitle;
                            }

                            const LOGO = toStringSafe(
                                await Promise.resolve(
                                    logoProvider(filePath)
                                )
                            ).trim();

                            const FAV_ICON = toStringSafe(
                                await Promise.resolve(
                                    favIconProvider(filePath)
                                )
                            ).trim();

                            const CUSTOM_CSS = toStringSafe(
                                await Promise.resolve(
                                    cssGenerator(filePath)
                                )
                            ).trim();

                            const TEMPLATE_DATA: any = {
                                fav_icon: FAV_ICON,
                                page_logo: LOGO,
                                page_title: title,
                                page_sub_title: subTitle,
                            };

                            // header and footer
                            const HEADER = await loadEJS('header', TEMPLATE_DATA);
                            const FOOTER = await loadEJS('footer', TEMPLATE_DATA);

                            let content = `
    <script type="text/javascript">
    const MARKDOWN_CONTENT = ${JSON.stringify(
                                await fs.readFile(filePath, 'utf8')
                            )};
    </script>
    `;

                            // Breadcrumb
                            content += `<nav aria-label="breadcrumb">`;
                            content += `<ol class="breadcrumb">`;
                            {
                                const PARTS = RELATIVE_PATH.split('/')
                                    .filter(x => '' !== x.trim());

                                if (PARTS.length) {
                                    content += `<li class="breadcrumb-item active">
<a href="/">
    <i class="fa fa-home"></i>
</a>`;

                                    for (let i = 0; i < PARTS.length; i++) {
                                        const P = PARTS[i];
                                        const IS_ACTIVE = i === (PARTS.length - 1);

                                        content += `<li class="breadcrumb-item${IS_ACTIVE ? ' active' : ''}">${
                                            IS_ACTIVE ? '' : `<a href="/${
                                                encodeURIComponent(
                                                    PARTS.slice(0, i + 1)
                                                        .join('/')
                                                )
                                                }">`
                                            }${
                                            HTML_ENC.encode(P.trim())
                                            }${
                                            IS_ACTIVE ? '' : `</a>`
                                            }</li>`;
                                    }
                                } else {
                                    content += `<li class="breadcrumb-item active">
    <i class="fa fa-home"></i>
</li>`;
                                }
                            }
                            content += `</ol>`;
                            content += `</navbar>`;

                            content += `<div id="ego-content"></div>`;

                            if ('' !== CUSTOM_CSS) {
                                content += `
<style type="text/css">

${ CUSTOM_CSS}

</style>
`;
                            }

                            return res.status(200)
                                .header('Content-type', 'text/html; charset=utf-8')
                                .send(
                                    Buffer.from(
                                        HEADER + content + FOOTER, 'utf8'
                                    )
                                );
                        } else {
                            // resource file.

                            res.status(200)
                                .header('Content-type', mimeType);

                            if (
                                !mimeType.startsWith('text/') &&
                                !mimeType.startsWith('image/') &&
                                !mimeType.startsWith('video/') &&
                                !mimeType.endsWith('/json')
                            ) {
                                res.header('Content-disposition', `attachment; filename="${path.basename(filePath)}"`);
                            }

                            fs.createReadStream(filePath)
                                .pipe(res);
                        }

                        return;
                    }
                }
            }

            return res.status(404)
                .send();
        } catch (e) {
            return res.status(500)
                .header('Content-type', 'text/plain; charset=utf-8')
                .send(Buffer.from(toStringSafe(e), 'utf8'));
        }
    });
}
