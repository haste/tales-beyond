import Bun from "bun";
import { marked } from "marked";

const [_exec, _script, format, input] = Bun.argv;

const mozillaRenderer = {
  heading({ tokens }) {
    const text = this.parser.parseInline(tokens);

    return `<strong>${text}</strong>\n`;
  },
};

const modioRenderer = {
  heading({ tokens }) {
    return `${this.parser.parseInline(tokens)}\n\n`;
  },

  list({ items }) {
    const body = [];
    for (const item of items) {
      body.push(this.listitem(item));
    }
    return `${body.join("")}\n`;
  },

  listitem({ tokens }) {
    return ` - ${this.parser.parseInline(tokens)}\n`;
  },

  text(token) {
    return token.tokens ? this.parser.parseInline(token.tokens) : token.text;
  },
};

const md = await Bun.file(input).text();

const offsets = [...md.matchAll(/## (?<version>\S+) \((?<date>[^)]+)\)/g)].map(
  (match) => ({
    index: match.index,
    version: match.groups.version,
    date: match.groups.date,
  }),
);

const latestEntry = md.slice(
  md.indexOf("### ", offsets[0].index),
  offsets[1].index - 2,
);

if (format === "amo") {
  marked.use({ renderer: mozillaRenderer });

  console.log(
    JSON.stringify({
      version: {
        release_notes: {
          "en-US": marked.parse(latestEntry).trim(),
        },
      },
    }),
  );
} else if (format === "modio") {
  marked.use({ renderer: modioRenderer });
  console.log(marked.parse(latestEntry).trim());
}
