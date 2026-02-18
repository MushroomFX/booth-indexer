const nodeDOM = {
    praseHTML: (html) => {
        const stack = [];
        const root = { type: "root", attributes: {}, children: [] };
        stack.push(root);

        const tagRegex = /<\/?[^>]+>/g;
        let lastIndex = 0;
        let match;

        while ((match = tagRegex.exec(html)) !== null) {

            if (match.index > lastIndex) {
                const text = html.slice(lastIndex, match.index).trim();
                if (text) {
                    stack[stack.length - 1].children.push({
                        type: "text",
                        content: text
                    });
                }
            }

            const tag = match[0];

            if (tag.startsWith("</")) {
                stack.pop();
            } else {
                const isSelfClosing = tag.endsWith("/>");
                const tagContent = tag
                    .replace("<", "")
                    .replace(">", "")
                    .replace("/", "")
                    .trim();

                const [tagName, ...attrParts] = tagContent.split(/\s+/);

                const attributes = {};
                attrParts.forEach(part => {
                    const [key, value] = part.split("=");
                    if (key) {
                        attributes[key] = value
                            ? value.replace(/['"]/g, "")
                            : "";
                    }
                });

                const element = {
                    type: tagName.toLowerCase(),
                    attributes,
                    children: []
                };

                stack[stack.length - 1].children.push(element);

                if (!isSelfClosing) {
                    stack.push(element);
                }
            }

            lastIndex = tagRegex.lastIndex;
        }

        return root.children.length === 1
            ? root.children[0]
            : root.children;
    },

    stringifyHTML: (htmlJSON) => {
        if (!htmlJSON) return "";

        if (Array.isArray(htmlJSON)) {
            return htmlJSON.map(nodeDOM.stringifyHTML).join("");
        }

        if (htmlJSON.type === "text") {
            return htmlJSON.content;
        }

        const attrs = Object.entries(htmlJSON.attributes || {})
            .map(([k, v]) => `${k}="${v}"`)
            .join(" ");

        const open = attrs
            ? `<${htmlJSON.type} ${attrs}>`
            : `<${htmlJSON.type}>`;

        const children = (htmlJSON.children || [])
            .map(nodeDOM.stringifyHTML)
            .join("");

        const close = `</${htmlJSON.type}>`;

        return open + children + close;
    },

    getElementById: (htmlJSON, id) => {
        let found = null;

        const walk = (node) => {
            if (!node || found) return;

            if (node.attributes && node.attributes.id === id) {
                found = node;
                return;
            }

            (node.children || []).forEach(child => walk(child));
        };

        walk(htmlJSON);
        return found;
    },

    getElementsByClassName: (htmlJSON, className) => {
        const results = [];

        const walk = (node) => {
            if (!node) return;

            if (
                node.attributes &&
                node.attributes.class &&
                node.attributes.class.split(" ").includes(className)
            ) {
                results.push(node);
            }

            (node.children || []).forEach(child => walk(child));
        };

        walk(htmlJSON);
        return results;
    },

    getElementsByTagName: (htmlJSON, tagName) => {
        const results = [];

        const walk = (node) => {
            if (!node) return;

            if (node.type === tagName.toLowerCase()) {
                results.push(node);
            }

            (node.children || []).forEach(child => walk(child));
        };

        walk(htmlJSON);
        return results;
    },

    getElementsByName: (htmlJSON, name) => {
        const results = [];

        const walk = (node) => {
            if (!node) return;

            if (node.attributes && node.attributes.name === name) {
                results.push(node);
            }

            (node.children || []).forEach(child => walk(child));
        };

        walk(htmlJSON);
        return results;
    },

    querySelector: (htmlJSON, selector) => {
        return nodeDOM.querySelectorAll(htmlJSON, selector)[0] || null;
    },

    querySelectorAll: (htmlJSON, selector) => {
        if (!selector) return [];

        if (selector.startsWith("#")) {
            const el = nodeDOM.getElementById(htmlJSON, selector.slice(1));
            return el ? [el] : [];
        }

        if (selector.startsWith(".")) {
            return nodeDOM.getElementsByClassName(htmlJSON, selector.slice(1));
        }

        if (selector.startsWith("[") && selector.endsWith("]")) {
            const results = [];
            const content = selector.slice(1, -1);
            const [attr, value] = content.split("=");

            const walk = (node) => {
                if (!node) return;

                if (node.attributes && node.attributes[attr]) {
                    if (!value || node.attributes[attr] === value.replace(/['"]/g, "")) {
                        results.push(node);
                    }
                }

                (node.children || []).forEach(child => walk(child));
            };

            walk(htmlJSON);
            return results;
        }

        return nodeDOM.getElementsByTagName(htmlJSON, selector);
    }
};

module.exports = nodeDOM