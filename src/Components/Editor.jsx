import React, { useEffect, useRef, useState } from "react";
import { GrPowerReset } from "react-icons/gr";
import { FaCopy } from "react-icons/fa6";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag.js";
import "codemirror/addon/edit/closebrackets.js";
import "./Editor.css";
import ACTIONS from "../actions";
import Output from "./Output";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const [language, setLanguage] = useState(63); // default JavaScript
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const [codehere, setCode] = useState("");

  // 🧩 Templates with "Write your code here" and "Hello DevSync"
  const templates = {
    50: `#include <stdio.h>\n\nint main() {\n    printf("Hello DevSync\\n");\n    // Write your code here\n    return 0;\n}`,
    54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello DevSync" << endl;\n    // Write your code here\n    return 0;\n}`,
    62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevSync");\n        // Write your code here\n    }\n}`,
    71: `print("Hello DevSync")\n# Write your code here`,
    63: `console.log("Hello DevSync");\n// Write your code here`,
    74: `console.log("Hello DevSync");\n// Write your code here`,
    68: `<?php\n echo "Hello DevSync";\n // Write your code here\n?>`,
    46: `#!/bin/bash\n echo "Hello DevSync"\n # Write your code here`,
    51: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello DevSync");\n        // Write your code here\n    }\n}`,
    60: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello DevSync")\n    // Write your code here\n}`,
    78: `fun main() {\n    println("Hello DevSync")\n    // Write your code here\n}`,
    83: `import Foundation\n\nprint("Hello DevSync")\n// Write your code here`,
    72: `puts "Hello DevSync"\n# Write your code here`,
    73: `fn main() {\n    println!("Hello DevSync");\n    // Write your code here\n}`,
    80: `print("Hello DevSync")\n# Write your code here`,
    81: `object Main extends App {\n    println("Hello DevSync")\n    // Write your code here\n}`,
    82: `-- Write your SQL code here\nSELECT 'Hello DevSync';`,
    85: `void main() {\n  print("Hello DevSync");\n  // Write your code here\n}`,
    64: `print("Hello DevSync")\n-- Write your code here`,
    61: `main = do\n  putStrLn "Hello DevSync"\n  -- Write your code here`,
    45: `section .data\n    msg db 'Hello DevSync',0Ah\nsection .text\n    global _start\n_start:\n    ; Write your code here`,
  };

  // 🔹 Initialize CodeMirror
  useEffect(() => {
  if (socketRef.current) {
    socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
      setLanguage(language);
    });
  }

  return () => {
    socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
  };
}, [socketRef.current]);
  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "material-darker",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editorRef.current.setValue(templates[language] || "// Write your code here");

      editorRef.current.on("change", (instance, change) => {
        const { origin } = change;
        const code = instance.getValue();
        setCode(code);
        onCodeChange(code);

        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
  }, []);

  // 🔹 Update editor when language changes
  useEffect(() => {
    if (editorRef.current) {
      const newTemplate = templates[language] || "// Write your code here";
      editorRef.current.setValue(newTemplate);
    }
  }, [language]);

  // 🔹 Sync code in real time
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (editorRef.current && code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div className="component-container">
      <div className="navbar">
        <select
  id="language"
  name="language"
  value={language}
  onChange={(e) => {
    const newLanguage = parseInt(e.target.value, 10);
    setLanguage(newLanguage);

    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: newLanguage
    });
  }}
>
          <option value="50">C (11.1.0)</option>
          <option value="54">C++ (11.1.0)</option>
          <option value="62">Java (17.0.1)</option>
          <option value="71">Python (3.10.0)</option>
          <option value="63">JavaScript (16.9.0)</option>
          <option value="74">TypeScript (4.4.3)</option>
          <option value="51">C# (Mono 6.12.0)</option>
          <option value="60">Go (1.17.2)</option>
          <option value="78">Kotlin (1.5.31)</option>
          <option value="83">Swift (5.5)</option>
          <option value="68">PHP (8.0.10)</option>
          <option value="72">Ruby (3.0.2)</option>
          <option value="73">Rust (1.56.1)</option>
          <option value="80">R (4.1.1)</option>
          <option value="81">Scala (3.0.2)</option>
          <option value="82">SQL (3.31.1)</option>
          <option value="85">Dart (2.14.4)</option>
          <option value="64">Lua (5.4.3)</option>
          <option value="46">Bash (5.1.8)</option>
          <option value="45">Assembly (NASM 2.15.05)</option>
          <option value="61">Haskell (9.0.1)</option>
        </select>

        <div className="settings">
          <button
            className="navbutton"
            onClick={() => {
              navigator.clipboard.writeText(editorRef.current.getValue());
              alert("✅ Code copied to clipboard!");
            }}
          >
            <FaCopy size={20} />
          </button>

          <button
            className="navbutton"
            onClick={() => {
              const resetCode = templates[language] || "// Write your code here";
              editorRef.current.setValue(resetCode);
            }}
          >
            <GrPowerReset size={20} />
          </button>
        </div>
      </div>

      <textarea ref={textareaRef} id="realTimeCodeEditor"></textarea>
      <Output code={codehere} languageId={language} />
    </div>
  );
};

export default Editor;
