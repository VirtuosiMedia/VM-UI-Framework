/*
---
description: PHP language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.3
  - Fuel

provides: [Fuel.php]
...
*/
Fuel.html = new Class({
    
    Extends: Fuel,
    language: 'html',
    
    initialize: function(options)
    {
        this.keywords = {
            keywords: {
                csv: "a, abbr, address, article, aside, audio, b, bdi, bdo, blockquote, body, br, button, canvas, caption, cite, code, col, colgroup, command, datalist, dd, del, details, dfn, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, html, i, iframe, img, input, ins, keygen, kbd, label, legend, li, link, map, mark, menu, meter, nav, object, ol, optgroup, option, output, p, param, pre, progress, q, rp, rt, ruby, s, samp, script, section, select, small, source, span, strong, sub, summary, sup, table, tbody, td, textarea, tfoot, th, thead, time, tr, track, u, ul, var, video, wbr",
                alias: 'kw1'
            },
            attributes: {
                csv: "accept, accesskey, action, align, alt, aria-, async, autocomplete, autofocus, background, bgcolor, border, checked, cellpadding, cellspacing, charset, class, cols, colspan contenteditable, contextmenu, coords, crossorigin, data-, data, defer, dir, dirname, disabled, download, draggable, dropzone, enctype, for, formaction, formenctype, formmethod, formnovalidate, formtarget, height, hidden, href, hreflang, hspace, http-equiv, id, ismap, item, itemprop, label, lang, language, list, longdesc, lowsrc, manifest, max, maxlength, media, method, min, multiple, name, novalidate, nowrap, pattern, ping, placeholder, readonly, rel, required, role, rows, rowspan, sandbox, scoped, seamless, selected, size, sizes, spellcheck, src, srcdoc, step, style, summary, tabindex, target, title, translate, type, typemustmatch, usemap, valign, value, vspace, width, wrap",
                alias: 'kw2'
            },
            events: {
                csv: "onabort, onblur, oncanplay, oncanplaythrough, onchange, onclick, oncentextmenu, ondblclick, ondrag, ondragend, ondragenter, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onerror, onfocus, onkeydown, onformchange, onforminput, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadstart, onmousedown, onmousemove, onmouseout, onmouseover, onmouseup, onmousewheel, onpause, onplay, onplaying, onprogress, onratechange, onreadystatechange, onreset, onscroll, onseeked, onseeking, onselect, onshow, onstalled, onsubmit, onsuspend, ontimeupdate, onvolumechange, onwaiting",
                alias: 'kw2'
            }            
        };
        
        this.patterns = {
            'slashComments': { pattern: this.common.slashComments, alias: 'co1' },
            'multiComments': { pattern: this.common.multiComments, alias: 'co2' },
            'comments': 	 { pattern: /(?:\&lt;|<)!--[\s\S]*?--(?:\&gt;|>)/gim, alias: 'co1' },
            'strings':       { pattern: this.common.strings,       alias: 'st0' },
            'numbers':       { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][\-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,       alias: 'nu0' },
            'variables':     { pattern: /[\$]{1,2}[A-Z_][\w]*/gim, alias: 'kw3' },
            'functions':     { pattern: this.common.functionCalls, alias: 'me1' },
            'methods':       { pattern: /->([\w]+)/gim,            alias: 'kw3' },
            'brackets':      { pattern: this.common.brackets,      alias: 'br0' },
            'symbols':     { pattern: /!|@|%|&|\||\/|<|>|=|-|\+|\*|\.|:|,|;/g, alias: 'sy0' }
        };
        
        // Delimiters
        this.delimiters = {};
        
        this.parent(options);
    }
});
