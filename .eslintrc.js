module.exports = {
  "env": {
    "node": true,
    "mocha": true,
  },
  "rules": {
    "prettier/prettier": ["error", {"singleQuote": true}],
    "no-console": 0
  },
  "globals": {},
  "extends": ["airbnb", "plugin:prettier/recommended"],
  "plugins": [
    "json", "import", "import-order-autofix"
  ]
}