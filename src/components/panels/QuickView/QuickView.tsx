import { Border } from "@components/Border/Border";
import { setActivePanel, setPanelState } from "@features/panels/panelsSlice";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFocused } from "@hooks/useFocused";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useAppDispatch, useAppSelector } from "@store";
import { QuickViewLayout } from "@types";
import { useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import useResizeObserver from "use-resize-observer";

const Root = styled.div`
  position: relative;
  width: 100%;
  background-color: ${(p) => p.theme.filePanel.bg};
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  user-select: initial;
  -webkit-user-select: initial;
  & div {
    cursor: initial;
  }
`;

const HeaderText = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 2rem);
  text-align: left;
  color: ${(p) => (p.isActive ? p.theme.filePanel.header.activeColor : p.theme.filePanel.header.inactiveColor)};
  background-color: ${(p) => (p.isActive ? p.theme.filePanel.header.activeBg : p.theme.filePanel.header.inactiveBg)};
`;

const Content = styled.div`
  display: grid;
  margin: calc(0.5rem) calc(0.25rem - 1px);
  border: 1px solid var(--color-11);
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 1px 1px;
  overflow: hidden;
`;

const EditorDiv = styled.div`
  display: grid;
  padding-top: calc(0.5rem);
  border: 1px solid var(--color-11);
  overflow: hidden;
`;

const markdown = `
  # remark-frontmatter

  [![Build][build-badge]][build]
  [![Coverage][coverage-badge]][coverage]
  [![Downloads][downloads-badge]][downloads]
  [![Size][size-badge]][size]
  [![Sponsors][sponsors-badge]][collective]
  [![Backers][backers-badge]][collective]
  [![Chat][chat-badge]][chat]

  [**remark**][remark] plugin to support frontmatter (YAML, TOML, and more).

  ## Contents

  *   [What is this?](#what-is-this)
  *   [When should I use this?](#when-should-i-use-this)
  *   [Install](#install)
  *   [Use](#use)
  *   [API](#api)
      *   [\`unified().use(remarkFrontmatter[, options])\`](#unifieduseremarkfrontmatter-options)
  *   [Examples](#examples)
      *   [Example: custom marker](#example-custom-marker)
      *   [Example: custom fence](#example-custom-fence)
  *   [Syntax](#syntax)
  *   [Syntax tree](#syntax-tree)
  *   [Types](#types)
  *   [Compatibility](#compatibility)
  *   [Security](#security)
  *   [Related](#related)
  *   [Contribute](#contribute)
  *   [License](#license)

  ## What is this?

  This package is a [unified][] ([remark][]) plugin to add support for YAML, TOML,
  and other frontmatter.
  You can use this to add support for parsing and serializing this syntax
  extension.

  **unified** is a project that transforms content with abstract syntax trees
  (ASTs).
  **remark** adds support for markdown to unified.
  **mdast** is the markdown AST that remark uses.
  **micromark** is the markdown parser we use.
  This is a remark plugin that adds support for the frontmatter syntax and AST to
  remark.

  ## When should I use this?

  Frontmatter is a metadata format in front of content.
  It’s typically written in YAML and is often used with markdown.
  This mechanism works well when you want authors, that have some markup
  experience, to configure where or how the content is displayed or supply
  metadata about content.
  Frontmatter does not work everywhere so it makes markdown less portable.
  A good example use case is markdown being rendered by (static) site generators.

  ## Install

  This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
  In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

  \`\`\`sh
  npm install remark-frontmatter
  \`\`\`

  In Deno with [\`esm.sh\`][esmsh]:

  \`\`\`js
  import remarkFrontmatter from 'https://esm.sh/remark-frontmatter@4'
  \`\`\`

  In browsers with [\`esm.sh\`][esmsh]:

  \`\`\`html
  <script type="module">
    import remarkFrontmatter from 'https://esm.sh/remark-frontmatter@4?bundle'
  </script>
  \`\`\`

  ## Use

  Say we have the following file, \`example.md\`:

  \`\`\`markdown
  +++
  title = "New Website"
  +++

  # Other markdown
  \`\`\`

  And our module, \`example.js\`, looks as follows:

  \`\`\`js
  import {read} from 'to-vfile'
  import {unified} from 'unified'
  import remarkParse from 'remark-parse'
  import remarkFrontmatter from 'remark-frontmatter'
  import remarkStringify from 'remark-stringify'

  main()

  async function main() {
    const file = await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(() => (tree) => {
        console.dir(tree)
      })
      .process(await read('example.md'))

    console.log(String(file))
  }
  \`\`\`

  Now, running \`node example\` yields:

  \`\`\`js
  {
    type: 'root',
    children: [
      {type: 'toml', value: 'title = "New Website"', position: [Object]},
      {type: 'heading', depth: 1, children: [Array], position: [Object]}
    ],
    position: {
      start: {line: 1, column: 1, offset: 0},
      end: {line: 6, column: 1, offset: 48}
    }
  }
  \`\`\`

  \`\`\`markdown
  +++
  title = "New Website"
  +++

  # Other markdown
  \`\`\`

  ## API

  This package exports no identifiers.
  The default export is \`remarkFrontmatter\`.

  ### \`unified().use(remarkFrontmatter[, options])\`

  Configures remark so that it can parse and serialize frontmatter (YAML, TOML,
  and more).
  Doesn’t parse the data inside them: [create your own plugin][create-plugin] to
  do that.

  ##### \`options\`

  One \`preset\` or \`Matter\`, or an array of them, defining all the supported
  frontmatters (default: \`'yaml'\`).

  ##### \`preset\`

  Either \`'yaml'\` or \`'toml'\`:

  *   \`'yaml'\` — \`Matter\` defined as \`{type: 'yaml', marker: '-'}\`
  *   \`'toml'\` — \`Matter\` defined as \`{type: 'toml', marker: '+'}\`


  ## Compatibility

  Projects maintained by the unified collective are compatible with all maintained
  versions of Node.js.
  As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
  Our projects sometimes work with older versions, but this is not guaranteed.

  This plugin works with unified version 6+ and remark version 13+.

  ## Security

  Use of \`remark-frontmatter\` does not involve [**rehype**][rehype]
  ([**hast**][hast]) or user content so there are no openings for
  [cross-site scripting (XSS)][xss] attacks.

  ## Related

  *   [\`remark-yaml-config\`](https://github.com/remarkjs/remark-yaml-config)
      — configure remark from YAML configuration
  *   [\`remark-gfm\`](https://github.com/remarkjs/remark-gfm)
      — support GFM (autolink literals, footnotes, strikethrough, tables,
      tasklists)
  *   [\`remark-mdx\`](https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx)
      — support MDX (JSX, expressions, ESM)
  *   [\`remark-directive\`](https://github.com/remarkjs/remark-directive)
      — support directives
  *   [\`remark-math\`](https://github.com/remarkjs/remark-math)
      — support math

  ## Contribute

  See [\`contributing.md\`][contributing] in [\`remarkjs/.github\`][health] for ways
  to get started.
  See [\`support.md\`][support] for ways to get help.

  This project has a [code of conduct][coc].
  By interacting with this repository, organization, or community you agree to
  abide by its terms.

  ## License

  [MIT][license] © [Titus Wormer][author]

  <!-- Definitions -->

  [build-badge]: https://github.com/remarkjs/remark-frontmatter/workflows/main/badge.svg

  [build]: https://github.com/remarkjs/remark-frontmatter/actions

  [coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-frontmatter.svg

  [coverage]: https://codecov.io/github/remarkjs/remark-frontmatter

  [downloads-badge]: https://img.shields.io/npm/dm/remark-frontmatter.svg

  [downloads]: https://www.npmjs.com/package/remark-frontmatter

  [size-badge]: https://img.shields.io/bundlephobia/minzip/remark-frontmatter.svg

  [size]: https://bundlephobia.com/result?p=remark-frontmatter

  [sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

  [backers-badge]: https://opencollective.com/unified/backers/badge.svg

  [collective]: https://opencollective.com/unified

  [chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

  [chat]: https://github.com/remarkjs/remark/discussions

  [npm]: https://docs.npmjs.com/cli/install

  [esmsh]: https://esm.sh

  [health]: https://github.com/remarkjs/.github

  [contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

  [support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

  [coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

  [license]: license

  [author]: https://wooorm.com

  [unified]: https://github.com/unifiedjs/unified

  [remark]: https://github.com/remarkjs/remark

  [xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

  [typescript]: https://www.typescriptlang.org

  [rehype]: https://github.com/rehypejs/rehype

  [hast]: https://github.com/syntax-tree/hast

  [create-plugin]: https://unifiedjs.com/learn/guide/create-a-plugin/
`;

type QuickViewPanelProps = { layout: QuickViewLayout & { id: string } };

export function QuickView({ layout }: QuickViewPanelProps) {
  const dispatch = useAppDispatch();
  const { id } = layout;
  const monaco = useMonaco();
  const theme = useTheme();
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("far-more", {
        inherit: true,
        base: "vs-dark",
        rules: [
          {
            token: "comment",
            foreground: "ffa500",
            fontStyle: "italic underline",
          },
          { token: "comment.js", foreground: "008800", fontStyle: "bold" },
          { token: "comment.css", foreground: "0000ff" }, // will inherit fontStyle from `comment` above
        ],
        colors: {
          "editor.foreground": theme.filePanel.color, // "#2aa198",
          "editor.background": theme.filePanel.bg, // "#073642",
        },
      });
    }
  }, [monaco, theme.filePanel]);

  useEffect(() => {
    dispatch(
      setPanelState({
        id,
        state: {
          items: [],
          path: "",
          cursorPos: { selected: 0, topmost: 0 },
          view: { type: "condensed", columnDef: { name: "a", field: "a" }, columnsCount: 1 },
        },
      })
    );
  }, [dispatch, id]);

  useCommandContext("quickView.focus", focused);

  useEffect(() => {
    if (focused) {
      dispatch(setActivePanel(id));
    }
  }, [dispatch, id, focused]);

  useEffect(() => {
    if (isActive) {
      panelRootRef.current?.focus();
    }
  }, [dispatch, isActive]);

  return (
    <Root ref={panelRootRef} tabIndex={0}>
      <Border {...theme.filePanel.border}>
        <HeaderText isActive={isActive}>Quick View</HeaderText>
        <Content>
          <EditorDiv ref={ref}>
            {monaco && <Editor theme="far-more" width={width} height={height} defaultLanguage="markdown" defaultValue={markdown} />}
          </EditorDiv>
          {/* <div className={classes.footerPanel}>123</div> */}
        </Content>
      </Border>
    </Root>
  );
}
