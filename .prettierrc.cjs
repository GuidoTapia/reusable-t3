module.exports = {
  semi: false,
  printWidth: 80,
  tabWidth: 2,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^~/client/(.*)$",
    "^~/emails/(.*)$",
    "^~/env/(.*)$",
    "^~/server/(.*)$",
    "^~/types/(.*)$",
    "^~/utils/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
