import Bun from "bun";

const [_exec, _script, format, input] = Bun.argv;

const sharedCallbacks = {
  text: (content) => content,
  strong: (content) => `**${content}**`,
  emphasis: (content) => `_${content}_`,
  list: (content, { depth }) =>
    depth === 0 ? content : `\n${content.trimEnd()}`,
  listItem: (content) => `- ${content.replace(/\n/g, "\n  ")}\n`,
};

const mozillaCallbacks = {
  ...sharedCallbacks,
  heading: (content) => `**${content}**\n\n`,
};

const modioCallbacks = {
  ...sharedCallbacks,
  heading: (content) => `${content}\n\n`,
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
  console.log(
    JSON.stringify({
      version: {
        release_notes: {
          "en-US": Bun.markdown.render(latestEntry, mozillaCallbacks).trim(),
        },
        approval_notes:
          "Source can be built by installing bun (https://bun.sh/) and running `bun install` followed by `bun run build`",
      },
    }),
  );
} else if (format === "modio") {
  console.log(Bun.markdown.render(latestEntry, modioCallbacks).trim());
}
