module.exports = {
  extends: "airbnb-typescript-prettier",
  plugins: ["import", "simple-import-sort"],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "default-case": "off",
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "no-param-reassign": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "jsx-a11y/no-static-element-interactions": "off",
    "no-restricted-syntax": "off",
    "react-hooks/exhaustive-deps": "error",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
