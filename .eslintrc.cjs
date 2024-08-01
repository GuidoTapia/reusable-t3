/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  extends: [
    "@ravnhq/eslint-config",
    "@ravnhq/eslint-config/next",
    "@ravnhq/eslint-config/react",
  ],
  overrides: [
    {
      files: ["src/pages/**/*.@(ts|tsx)"],
      rules: {
        "filenames/match-regex": "off",
        "filenames/match-exported": "off",
      },
    },
  ],
  rules: {
    // We can turn this back on when we fix the prisma stuff
    "no-underscore-dangle": ["error", { allow: ["_count", "_sum"] }],
    "no-console": ["error", { allow: ["info", "warn", "error"] }],

    // Turn off for now, but we need to fix these and turn them on:
    "unicorn/no-array-reduce": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
  },
}
module.exports = config
