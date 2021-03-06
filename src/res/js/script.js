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

// default options for Markdown parser
jQuery(() => {
    showdown.setFlavor('github');

    showdown.setOption('completeHTMLDocument', false);
    showdown.setOption('encodeEmails', true);
    showdown.setOption('ghCodeBlocks', true);
    showdown.setOption('ghCompatibleHeaderId', true);
    showdown.setOption('headerLevelStart', 3);
    showdown.setOption('openLinksInNewWindow', true);
    showdown.setOption('simpleLineBreaks', true);
    showdown.setOption('simplifiedAutoLink', true);
    showdown.setOption('strikethrough', true);
    showdown.setOption('tables', true);
    showdown.setOption('tasklists', true);
});

// initialize page
jQuery(() => {
    const CONVERTER = new showdown.Converter();

    const HTML = CONVERTER.makeHtml(MARKDOWN_CONTENT);

    const CONTENT = jQuery(`<div class="ego-markdown" />`);
    CONTENT.html(HTML);

    // remove scripts
    CONTENT.find('script')
        .remove();

    // tables
    CONTENT.find('table')
        .addClass('table')
        .addClass('table-striped')
        .addClass('table-hover');

    // make images responsive
    CONTENT.find('img')
        .addClass('img-fluid');

    // update link handling
    CONTENT.find('a').each(function () {
        const A = jQuery(this);

        const HREF = A.attr('href');
        if (HREF) {
            const IS_HTTP_LINK = HREF.toLowerCase().trim().startsWith('http://')
                || HREF.toLowerCase().trim().startsWith('https://');

            if (IS_HTTP_LINK) {
                A.attr('target', '_blank');
            } else {
                A.removeAttr('target');
            }
        }
    });

    jQuery('#ego-content').append(
        CONTENT
    );

    // code blocks
    CONTENT.find('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

    // mermaid
    {
        CONTENT.find('pre code.language-mermaid').each(function (i, block) {
            const CODE_BLOCK = jQuery(block);
            const PRE_BLOCK = CODE_BLOCK.parent();

            const MERMAID_DIV = jQuery('<div class="mermaid ego-mermaid" />');
            MERMAID_DIV.text(CODE_BLOCK.text());

            PRE_BLOCK.replaceWith(MERMAID_DIV);
        });

        mermaid.init(undefined,
            CONTENT.find('.ego-mermaid'));
    }
});
