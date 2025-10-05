import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import "./Output.css";
const Output = ({ code, languageId }) => {
  const [output, setOutput] = useState("Click 'Run' to execute code");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    if (!code) {
      setOutput("No code to run");
      return;
    }

    setLoading(true);
    setOutput("Running...");

    try {
      // Step 1: Submit code to Judge0
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": "cdf92dea1fmshe182f201f67fcdbp151b71jsnc23829e516f8"
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: ""
          })
        }
      );

      const { token } = await response.json();
      if (!token) throw new Error("No token returned from Judge0");

      let result;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // wait 1.5s before polling

        const res = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`,
          {
            headers: {
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              "X-RapidAPI-Key": "cdf92dea1fmshe182f201f67fcdbp151b71jsnc23829e516f8"
            }
          }
        );

        result = await res.json();
        console.log(result);
      } while (result?.status?.id && result.status.id <= 2);

      // Show output or errors
      if (result?.compile_output) {
        setOutput("Compile Error:\n" + result.compile_output);
      } else if (result?.stderr) {
        setOutput("Runtime Error:\n" + result.stderr);
      } else {
        setOutput(result?.stdout || "No output");
      }
    } catch (err) {
      setOutput("Execution error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="output-box">
      <div className="output-feature">
         <button
        onClick={runCode}
        disabled={loading}
        className="run"
      >
        <FaPlay size={10} />
        <div>
           {loading ? "Running..." : "Run"}
        </div>
       
      </button>
      <div>
        <button className="run" onClick={()=>{setOutput("")}}>
          Clear
        </button>
      </div>
      </div>
     

      <div>
        <pre >{output}</pre>
      </div>
    </div>
  );
};

export default Output;
