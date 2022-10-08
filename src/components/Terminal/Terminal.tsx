import { useGlyphSize } from "~/src/contexts/glyphSizeContext";
import { changeDir } from "~/src/features/panels/panelsSlice";
import { useCommandBinding } from "~/src/hooks/useCommandBinding";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import { useFocused } from "~/src/hooks/useFocused";
import { useShell } from "~/src/hooks/useShell";
import { useTerminal } from "~/src/hooks/useTerminal";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiTerminal } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "~/src/store";
import useResizeObserver from "use-resize-observer";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { WebLinksAddon } from "xterm-addon-web-links";
import { WebglAddon } from "xterm-addon-webgl";

type TerminalProps = {
  fullScreen?: boolean;
  onRunStart?: () => void;
  onRunEnd?: () => void;
};

export default function Terminal({ fullScreen, onRunStart, onRunEnd }: TerminalProps) {
  const shell = useShell();
  const dispatch = useAppDispatch();
  const { height: glyphHeight } = useGlyphSize();
  const { ref: rootRef, width, height = 0 } = useResizeObserver();
  const [xtermElement, setXtermElement] = useState<HTMLElement>();
  const { path } = useAppSelector((state) => state.panels.states[state.panels.active]);
  const focused = useFocused(xtermElement);
  const ref = useRef<HTMLDivElement>(null);
  const fitAddon = useMemo(() => new FitAddon(), []);
  const [command, setCommand] = useState("");
  const t = useTerminal();
  const xterm = useMemo(() => {
    const term = new XTerm();
    term.options.fontSize = 14;
    term.options.fontFamily = "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace";
    term.options.cursorBlink = true;
    term.options.cursorStyle = "bar";
    // term.options.rendererType = "dom";
    term.options.allowTransparency = true;
    // term.unicode.activeVersion = "11";
    term.options.convertEol = true;
    term.options.windowOptions = { getScreenSizeChars: true, getWinSizeChars: true, getWinSizePixels: true, getCellSizePixels: true };
    term.options.theme = {
      background: "transparent",
      selectionBackground: "rgba(0, 67, 128, 0.4)",
    };
    term.parser.registerOscHandler(133, (data) => {
      if (data.startsWith("C")) {
        console.error("START");
        onRunStart?.();
        return true;
      }
      if (data.startsWith("B")) {
        console.error("END");
        onRunEnd?.();
        return true;
      }
      return false;
    });
    term.parser.registerOscHandler(1337, (data) => {
      const [key, value] = data.split("=");
      if (key === "CurrentDir") {
        dispatch(changeDir(value));
        return true;
      }
      return false;
    });
    term.loadAddon(fitAddon);
    term.loadAddon(new Unicode11Addon());
    term.loadAddon(
      new WebLinksAddon((e, uri) => {
        shell.open(uri);
      })
    );
    return term;
  }, [dispatch, fitAddon, onRunEnd, onRunStart, shell]);

  useEffect(() => {
    console.error("PATH:", path);
    // t.send(`\u{1b}1337;CurrentDir=${path}\u{7}`);
    // t.send(`\u{1b}]7;file://Users/mike/github\u{7}`);
  }, [path, t]);

  useEffect(() => {
    t.onData((data) => {
      xterm.write(data);
    });
  }, [t, xterm]);

  // useEffect(() => {
  //   if (fullScreen) {
  //     xterm.focus();
  //   }
  // }, [fullScreen, xterm]);

  useEffect(() => {
    const gh = Math.ceil(glyphHeight);
    const lines = Math.floor(height / gh);

    if (ref.current && height > 0) {
      ref.current.style.height = `${lines * gh}px`;
    }
    console.error("!!!", fitAddon.proposeDimensions());
    xterm.resize(fitAddon.proposeDimensions()?.cols ?? 1, lines);
  }, [fitAddon, glyphHeight, width, height, xterm]);

  useEffect(() => {
    if (ref.current) {
      xterm.onBinary((e) => {
        console.error("BIN: ", e);
        t.send(e);
      });
      xterm.onData((data) => {
        console.error("DATA: ", data);
        t.send(data);
      });
      xterm.onResize(({ cols, rows }) => {
        t.resize(cols, rows);
      });
      for (let i = 0; i < 100; i += 1) xterm.writeln("");
      xterm.open(ref.current);
      fitAddon.fit();
      xterm.resize(fitAddon.proposeDimensions()?.cols ?? 1, 1);
      xterm.loadAddon(new WebglAddon());
      setXtermElement(xterm.textarea);
      return () => {
        xterm.dispose();
      };
    }
    return undefined;
  }, [fitAddon, t, xterm]);

  // useEffect(() => {
  //   const d = xterm.onLineFeed(() => {
  //     const gh = Math.ceil(glyphHeight);
  //     const lines = Math.min(xterm.buffer.active.length, Math.floor(height / gh));

  //     if (ref.current && height > 0) {
  //       ref.current.style.height = `${lines * gh}px`;
  //     }
  //     xterm.resize(fitAddon.proposeDimensions()?.cols ?? 1, lines);
  //   });
  //   return () => d.dispose();
  // }, [fitAddon, glyphHeight, height, xterm]);

  useCommandContext("terminal.focus", focused);
  useCommandBinding("focusTerminal", () => {
    xterm?.focus();
    console.error("FOCUS");
  });

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "1fr auto" }}>
      <div ref={rootRef} style={{ position: "relative", overflow: "hidden" }}>
        <div ref={ref} style={{ height: "100%", position: "absolute", bottom: 0, left: 0, right: 0 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <HiTerminal />
        {path}
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (command.startsWith("cd ")) {
                dispatch(changeDir(command.substring(3)));
                setCommand("");
              } else if (command.trim() !== "") {
                onRunStart?.();
                xterm.writeln(command);
                t.send(command).then(() => onRunEnd?.());
                setCommand("");
              } else {
                xterm.writeln(command);
                setCommand("");
              }
            }
          }}
        />
      </div>
    </div>
  );
  // return <input ref={inputRef} type="text" className={classes.terminal} spellCheck={false} autoComplete="off" tabIndex={-1} />;
}
