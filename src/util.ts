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
import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as path from 'path';


/**
 * Checks if a path exists.
 *
 * @param {fs.PathLike} p The path to check.
 *
 * @return {Promise<boolean>} The promise, that indicates, if path exists or not.
 */
export function exists(p: fs.PathLike): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            fs.exists(p, (doesExist) => {
                resolve(doesExist);
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Returns the full path inside the 'res' folder.
 *
 * @param {any} p The relative path.
 *
 * @return {string} The full path.
 */
export function getResourcePath(p: any): string {
    p = toStringSafe(p)
        .trim();

    return path.resolve(
        path.join(
            __dirname, 'res', p
        )
    );
}

/**
 * Checks if a path exists and is a directory.
 *
 * @param {string | Buffer} p The path to check.
 * @param {boolean} [useLSTAT] Use 'lstat()' instead of 'stat()'.
 *
 * @return {Promise<boolean>} The promise, that indicates, if is a directory or not.
 */
export async function isFile(p: string | Buffer, useLSTAT = false) {
    if (await exists(p)) {
        const FUNC = useLSTAT ? fs.lstat : fs.stat;

        return (await FUNC(p)).isFile();
    }

    return false;
}

/**
 * Converts a value to a normalized string and checks if it is empty ('').
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is empty string ('') or not.
 */
export function isEmptyString(val: any): boolean {
    return '' === normalizeString(val);
}

/**
 * Loads an EJS template from 'res' folder.
 *
 * @param {any} p The relative path inside 'res/templates' without '.ejs' extension.
 * @param {ejs.Data} [data] The optional data.
 *
 * @return {Promise<string>} The promise with the rendered template.
 */
export async function loadEJS(p: any, data?: ejs.Data): Promise<string> {
    return ejs.render(
        (await loadResource('templates/' + toStringSafe(p).trim() + '.ejs'))
            .toString('utf8'),
        data,
    );
}

/**
 * Loads a file from 'res' folder.
 *
 * @param {æny} p The relative path of the resource.
 *
 * @return {Promise<Buffer>} The promise with the loaded data.
 */
export async function loadResource(p: any): Promise<Buffer> {
    return await fs.readFile(
        getResourcePath(p)
    );
}

/**
 * Converts a value to a lower case and trimmed string.
 *
 * @param {any} val The input value.
 *
 * @return {string} The output value.
 */
export function normalizeString(val: any): string {
    return toStringSafe(val)
        .toLowerCase()
        .trim();
}

/**
 * Converts a value to a string, if needed, that is not (null) and (undefined).
 *
 * @param {any} val The input value.
 *
 * @return {string} The output value.
 */
export function toStringSafe(val: any): string {
    if (_.isString(val)) {
        return val;
    }

    if (_.isNil(val)) {
        return '';
    }

    if (val instanceof Error) {
        return `[${val.name}] '${val.message}'

${val.stack}`;
    }

    if (_.isFunction(val['toString'])) {
        return String(
            val.toString()
        );
    }

    return String(val);
}
