import React, { useEffect } from "react"
const mermaid = require("mermaid")

const DEFAULT_CONFIG = {
  startOnLoad: true,
  theme: "forest",
  logLevel: "fatal",
  securityLevel: "strict",
  arrowMarkerAbsolute: false,
  flowchart: {
    htmlLabels: true,
    curve: "linear",
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 100,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: false,
    rightAngles: false,
    showSequenceNumbers: false,
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    fontFamily: '"Open-Sans", "sans-serif"',
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
  },
}

type MermaidProps = {
    name?: string;
    chart: string;
    config?: any;
}


export const Mermaid: React.FC<MermaidProps> = ({ name, chart, config }) => {  
  // Mermaid initilize its config
  mermaid.initialize({...DEFAULT_CONFIG, ...config})

  useEffect(() => {
    mermaid.contentLoaded()
  }, [config])

  useEffect(() => {
    const output = document.querySelector(".mermaid");
    if (!output) {
      return
    }
    if (output.firstChild !== null) {
      output.innerHTML = "";
    }
    const code = chart
    let insert = function (code: string) {
      output.innerHTML = code;
    };
    mermaid.render("preparedScheme", code, insert);
  }, [chart])

  if (!chart) return null
  return (
    <div className="mermaid" id={name}> 
      {chart}
    </div>
  )  
}