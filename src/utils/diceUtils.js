export function doubleDiceExpression(dice) {
  return dice.replace(/(\d+)d(\d+)/g, (_, count, sides) => {
    return `${Number.parseInt(count) * 2}d${sides}`;
  });
}
