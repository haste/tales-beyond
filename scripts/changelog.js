import Bun from "bun";
import { marked } from "marked";

const [_exec, _script, format, input] = Bun.argv;

const sharedRenderer = {
  // Block-level
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

  // Inline-level
  strong({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `**${text}**`;
  },

  em({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `_${text}_`;
  },

  text(token) {
    return token.tokens ? this.parser.parseInline(token.tokens) : token.text;
  },
};

const mozillaRenderer = {
  ...sharedRenderer,
  heading({ tokens }) {
    return `**${this.parser.parseInline(tokens)}**\n\n`;
  },
};

const modioRenderer = {
  ...sharedRenderer,
  heading({ tokens }) {
    return `${this.parser.parseInline(tokens)}\n\n`;
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
        approval_notes:
          "Source can be built by installing bun (https://bun.sh/) and running `bun install` followed by `bun run build`",
      },
    }),
  );
} else if (format === "modio") {
  marked.use({ renderer: modioRenderer });
  console.log(marked.parse(latestEntry).trim());
}
