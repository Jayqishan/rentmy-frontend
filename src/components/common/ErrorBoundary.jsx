import React from "react";
import { Link } from "react-router-dom";

function ErrorFallback({ error }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-900)", color:"var(--text-100)", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <div style={{ width:"100%", maxWidth:720, background:"var(--bg-700)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", boxShadow:"var(--shadow)", padding:28 }}>
        <p style={{ color:"var(--red)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>Application Error</p>
        <h1 style={{ fontFamily:"var(--font-h)", fontSize:34, fontWeight:800, marginBottom:10 }}>Something went wrong</h1>
        <p style={{ color:"var(--text-300)", fontSize:15, marginBottom:20 }}>The page hit an unexpected problem. You can refresh and try again, or head back home.</p>

        <details style={{ marginBottom:20, background:"var(--bg-800)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"12px 14px" }}>
          <summary style={{ cursor:"pointer", fontSize:13, fontWeight:600, color:"var(--text-300)" }}>Show error details</summary>
          <pre style={{ marginTop:12, whiteSpace:"pre-wrap", wordBreak:"break-word", fontSize:12, color:"var(--text-300)" }}>
            {error?.stack || error?.message || "Unknown error"}
          </pre>
        </details>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Page</button>
          <Link to="/" className="btn btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) return <ErrorFallback error={this.state.error} />;
    return this.props.children;
  }
}
