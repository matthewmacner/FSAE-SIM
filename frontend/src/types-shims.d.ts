declare module "plotly.js-basic-dist-min" {
  // The basic dist re-exports the same shape as plotly.js but tree-shaken.
  // We pass it straight into react-plotly's factory and don't poke its API.
  const Plotly: object;
  export default Plotly;
}
