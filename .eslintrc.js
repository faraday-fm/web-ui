module.exports = {
  extends: "airbnb-typescript-prettier",
  rules: {
    "default-case": "off",
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "import/no-unresolved": [2, { ignore: ["^~/"] }],
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "no-param-reassign": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
