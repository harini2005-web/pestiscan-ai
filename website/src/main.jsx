import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Leaf, LayoutDashboard, ScanSearch, Waves, FlaskConical, ShieldCheck, Menu, X, UploadCloud, Image as ImageIcon, ChevronRight, CheckCircle2, AlertTriangle, Download, RotateCcw, Info, Activity, ArrowUpRight, Sprout, FileText } from "lucide-react";
import "./style.css";

const initialSpectra = [
  { wavelength: 400, absorbance: 0.18 }, { wavelength: 420, absorbance: 0.22 }, { wavelength: 440, absorbance: 0.25 },
  { wavelength: 460, absorbance: 0.31 }, { wavelength: 480, absorbance: 0.39 }, { wavelength: 500, absorbance: 0.44 },
  { wavelength: 520, absorbance: 0.36 }, { wavelength: 540, absorbance: 0.29 }, { wavelength: 560, absorbance: 0.34 },
  { wavelength: 580, absorbance: 0.49 }, { wavelength: 600, absorbance: 0.67 }, { wavelength: 620, absorbance: 0.72 },
  { wavelength: 640, absorbance: 0.56 }, { wavelength: 660, absorbance: 0.41 }, { wavelength: 680, absorbance: 0.32 },
  { wavelength: 700, absorbance: 0.28 }, { wavelength: 720, absorbance: 0.23 }, { wavelength: 740, absorbance: 0.19 },
  { wavelength: 760, absorbance: 0.16 }, { wavelength: 780, absorbance: 0.13 }
];
const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "image", label: "Image screening", icon: ScanSearch },
  { id: "spectral", label: "Spectroscopic analysis", icon: Waves },
  { id: "results", label: "Combined results", icon: FlaskConical }
];
const money = n => Number(n).toFixed(2);
function App() {
  const [page, setPage] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [fruit, setFruit] = useState("Apple");
  const [sampleId, setSampleId] = useState("PS-2026-1048");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spectralDone, setSpectralDone] = useState(false);
  const [threshold, setThreshold] = useState("standard");
  const [notice, setNotice] = useState("");
  const [spectra, setSpectra] = useState(initialSpectra);

  const handleFile = f => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setNotice("Please choose an image file (JPG, PNG or WEBP)."); return; }
    setFile(f); setNotice(""); setImageResult(null);
    const url = URL.createObjectURL(f); setPreview(url);
  };
  const analyzeImage = async () => {
    if (!file) { setNotice("Upload a fruit or vegetable image first."); return; }
    setIsAnalyzing(true);
    setImageResult(null);
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://pestiscan-ai.onrender.com/api/predict", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Image analysis failed. Check that the ML backend is running.");
      setImageResult(payload);
      setNotice("Image classification completed.");
    } catch (error) {
      setNotice(error.message || "Could not connect to the ML backend. Start the backend and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const doSpectral = () => {
    setSpectralDone(true);
    setSpectra(initialSpectra.map((d, i) => ({ ...d, absorbance: +(Math.min(.95, d.absorbance * (1 + ((i % 4) * .035) + (i > 8 && i < 14 ? .08 : 0)))).toFixed(3) })));
    setNotice("Spectral profile loaded.");
  };
  const go = id => { setPage(id); setMobileNav(false); setNotice(""); };
  const reset = () => { setFile(null); setPreview(""); setImageResult(null); setIsAnalyzing(false); setSpectralDone(false); setSpectra(initialSpectra); setNotice("Sample reset."); setPage("overview"); };
  const exportReport = () => {
    const lines = ["PestiScan AI — ML Classification Report", `Sample: ${sampleId}`, `Produce selected: ${fruit}`, `Predicted category: ${imageResult?.class_label || "Not run"}`, `Model confidence (%): ${imageResult ? Number(imageResult.confidence).toFixed(2) : "Not available"}`, `Spectral profile: ${spectralDone ? "Loaded" : "Not run"}`];
    if (imageResult?.probabilities) {
      lines.push("", "Class,Confidence (%)", ...imageResult.probabilities.map(r => `"${r.class_label}",${Number(r.confidence).toFixed(2)}`));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${sampleId}-report.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const title = nav.find(n => n.id === page)?.label || "Overview";
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Leaf size={22}/></div><div><strong>PestiScan<span> AI</span></strong><small>SMART PRODUCE LAB</small></div><button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => go(item.id)}><Icon size={18}/><span>{item.label}</span>{page === item.id && <span className="nav-dot"/>}</button>; })}</nav>
      <div className="side-bottom"><div className="mini-leaf"><Sprout size={18}/></div><strong>Food transparency,<br/>from the first scan.</strong><p>Combining visual screening and spectral signals for a clearer picture.</p><div className="side-version">PestiScan AI <span>Smart Produce Lab</span></div></div>
    </aside>
    {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main">
      <header className="topbar"><div className="top-left"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{title}</b></div></div><div className="top-right"><span className="demo-pill"><span/> SMART PRODUCE LAB</span><div className="avatar">PS</div></div></header>
      <div className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{page === "overview" ? "PRECISION SCREENING PLATFORM" : "SAMPLE WORKSPACE"}</div><h1>{page === "overview" ? "Good produce starts with insight." : title}</h1><p>{page === "overview" ? "A dual-method workflow for produce screening and analysis." : page === "image" ? "Upload a produce photo to begin visual screening." : page === "spectral" ? "Explore wavelength–absorbance profiles." : "Bring visual and spectral indicators together in one sample report."}</p></div><button className="outline-button reset-button" onClick={reset}><RotateCcw size={15}/> Reset sample</button></div>
        {notice && <div className="toast"><Info size={16}/>{notice}<button onClick={() => setNotice("")}><X size={14}/></button></div>}
        {page === "overview" && <Overview go={go} imageResult={imageResult} spectralDone={spectralDone} sampleId={sampleId} setSampleId={setSampleId} fruit={fruit} setFruit={setFruit} />}
        {page === "image" && <ImagePage file={file} preview={preview} fruit={fruit} setFruit={setFruit} sampleId={sampleId} setSampleId={setSampleId} handleFile={handleFile} analyzeImage={analyzeImage} imageResult={imageResult} isAnalyzing={isAnalyzing} go={go}/>}
        {page === "spectral" && <SpectralPage spectra={spectra} spectralDone={spectralDone} doSpectral={doSpectral} threshold={threshold} setThreshold={setThreshold}/>}
        {page === "results" && <ResultsPage imageResult={imageResult} spectralDone={spectralDone} exportReport={exportReport} go={go} sampleId={sampleId} fruit={fruit}/>}
        <footer><div className="footer-brand"><Leaf size={15}/> PestiScan AI</div><span>Smart produce screening and analysis</span><span>© 2026</span></footer>
      </div>
    </main>
  </div>;
}
function Overview({go, imageResult, spectralDone, sampleId, setSampleId, fruit, setFruit}) {
  return <><div className="overview-grid">
    <div className="welcome-card"><div className="welcome-copy"><span className="soft-tag"><Activity size={13}/> DUAL-METHOD WORKFLOW</span><h2>From produce image<br/>to combined insight.</h2><p>Screen a produce image, inspect wavelength signatures, and bring both signals into one report.</p><button className="primary-button" onClick={() => go("image")}>Start a new scan <ArrowUpRight size={16}/></button></div><div className="fruit-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="fruit-emoji">🍎</div><div className="art-label"><span className="live-dot"/> SAMPLE READY <b>01</b></div></div></div>
    <div className="stat-grid"><Stat icon={ScanSearch} label="Image screening" value={imageResult ? "Complete" : "Not run"} detail={imageResult ? `${Number(imageResult.confidence).toFixed(1)}% model confidence` : "Ready for image screening"} color="mint"/><Stat icon={Waves} label="Spectral analysis" value={spectralDone ? "Complete" : "Pending"} detail={spectralDone ? "Spectral profile loaded" : "Profile ready to load"} color="blue"/><Stat icon={FlaskConical} label="ML classification" value={imageResult ? imageResult.class_label : "3 classes"} detail="Model prediction categories" color="peach"/></div>
  </div>
  <div className="section-title"><div><h2>Screening workflow</h2><p>Three connected steps, one sample record.</p></div><span className="subtle-id">{sampleId}</span></div>
  <div className="workflow-grid"><WorkflowCard n="01" icon={ImageIcon} title="Image screening" text="Upload a produce photo to begin visual screening." tag={imageResult ? "Completed" : "Start here"} done={!!imageResult} onClick={() => go("image")}/><WorkflowCard n="02" icon={Waves} title="Spectroscopic analysis" text="Review absorbance values across wavelengths." tag={spectralDone ? "Completed" : "Dataset ready"} done={spectralDone} onClick={() => go("spectral")}/><WorkflowCard n="03" icon={ShieldCheck} title="Combined results" text="Review the predicted category and model confidence." tag="View report" onClick={() => go("results")}/></div>
  <div className="sample-panel"><div className="sample-icon"><FileText size={19}/></div><div className="sample-text"><strong>Current sample details</strong><span>Personalize this sample before running analysis.</span></div><div className="sample-fields"><label>Sample ID<input value={sampleId} onChange={e => setSampleId(e.target.value)} /></label><label>Produce<select value={fruit} onChange={e => setFruit(e.target.value)}>{["Apple","Tomato","Grape","Strawberry","Spinach","Cucumber","Bell pepper","Other"].map(x => <option key={x}>{x}</option>)}</select></label></div></div>
  <div className="bottom-note"><Sprout size={17}/><p><b>Model-powered image classification.</b> The image prediction is generated by the trained MobileNetV2 model.</p></div>
  </>;
}
function Stat({icon:Icon,label,value,detail,color}) { return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={18}/></div><span className="stat-label">{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function WorkflowCard({n,icon:Icon,title,text,tag,done,onClick}) { return <button className="workflow-card" onClick={onClick}><div className="workflow-top"><span className="step-number">{n}</span><span className={`step-icon ${done ? "done" : ""}`}><Icon size={20}/></span></div><h3>{title}</h3><p>{text}</p><div className="workflow-bottom"><span className={done ? "completed-tag" : "workflow-tag"}>{done && <CheckCircle2 size={13}/>} {tag}</span><ChevronRight size={17}/></div></button>; }
function ImagePage({file,preview,fruit,setFruit,sampleId,setSampleId,handleFile,analyzeImage,imageResult,isAnalyzing,go}) {
  return <div className="content-grid"><section className="panel main-panel"><div className="panel-heading"><div><span className="panel-kicker">STEP 01 / VISUAL MODEL</span><h2>Upload produce image</h2><p>Use a clear, well-lit image with the fruit or vegetable centered.</p></div><span className="icon-bubble green"><ScanSearch size={19}/></span></div>
    <div className={`upload-zone ${preview ? "has-preview" : ""}`} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); handleFile(e.dataTransfer.files?.[0]);}}>
      {preview ? <><img src={preview} alt="Uploaded produce preview"/><div className="preview-overlay"><span><CheckCircle2 size={15}/> Image selected</span><label className="change-image">Change image<input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])}/></label></div></> : <><div className="upload-icon"><UploadCloud size={27}/></div><h3>Drop your image here</h3><p>or browse files from your device</p><label className="browse-button">Browse image<input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])}/></label><small>JPG, PNG or WEBP · up to 10 MB recommended</small></>}
    </div>
    <div className="form-row"><label>Produce type<select value={fruit} onChange={e => setFruit(e.target.value)}>{["Apple","Tomato","Grape","Strawberry","Spinach","Cucumber","Bell pepper","Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Sample reference<input value={sampleId} onChange={e => setSampleId(e.target.value)} /></label></div>
    <button className="primary-button full-button" onClick={analyzeImage} disabled={isAnalyzing}>{isAnalyzing ? <><Activity size={17}/> Analysing image...</> : <><ScanSearch size={17}/> Run visual screening <ChevronRight size={17}/></>}</button>
    {imageResult && <div className="result-inline"><div className="inline-check"><CheckCircle2 size={19}/></div><div><b>Predicted category: {imageResult.class_label}</b><p>Model confidence: {Number(imageResult.confidence).toFixed(2)}%</p></div><div className="score-badge">{Number(imageResult.confidence).toFixed(0)}<small>%</small></div></div>}
  </section><aside className="panel side-panel"><h3>How image screening works</h3><p className="side-intro">The image workflow processes a produce photo and generates a screening summary.</p><div className="mini-step"><span>1</span><div><b>Image input</b><small>Capture or upload produce photo</small></div></div><div className="mini-step"><span>2</span><div><b>Pre-processing</b><small>Resize, normalize and inspect image quality</small></div></div><div className="mini-step"><span>3</span><div><b>Screening summary</b><small>Review the generated results</small></div></div><button className="text-link" onClick={() => go("spectral")}>Continue to spectroscopy <ChevronRight size={15}/></button></aside></div>;
}
function SpectralPage({spectra,spectralDone,doSpectral,threshold,setThreshold}) {
  const peaks = [...spectra].sort((a,b) => b.absorbance-a.absorbance).slice(0,3);
  return <><div className="metric-strip"><div className="metric-box"><span>Wavelength range</span><strong>400–780 <small>nm</small></strong></div><div className="metric-box"><span>Data points</span><strong>{spectra.length} <small>samples</small></strong></div><div className="metric-box"><span>Peak absorbance</span><strong>{Math.max(...spectra.map(x=>x.absorbance)).toFixed(2)} <small>AU</small></strong></div><div className="metric-box"><span>Data source</span><strong className="source-value">Spectral <small>profile</small></strong></div></div>
  <div className="content-grid spectral-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">SPECTRAL SIGNATURE</span><h2>Wavelength vs. absorbance</h2><p>Visible-range wavelength profile.</p></div><span className="chart-legend"><i/> Absorbance</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={spectra} margin={{top:10,right:12,left:-18,bottom:4}}><defs><linearGradient id="absorbFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#378c69" stopOpacity={0.22}/><stop offset="100%" stopColor="#378c69" stopOpacity={0.015}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e8eee9"/><XAxis dataKey="wavelength" tickLine={false} axisLine={false} tick={{fill:"#829087",fontSize:11}} tickFormatter={v=>`${v}`} label={{value:"Wavelength (nm)",position:"insideBottom",offset:-1,fill:"#718078",fontSize:11}}/><YAxis domain={[0,1]} tickLine={false} axisLine={false} tick={{fill:"#829087",fontSize:11}}/><Tooltip contentStyle={{border:"1px solid #e3ebe5",borderRadius:12,fontSize:12}} formatter={v=>[`${v} AU`,"Absorbance"]} labelFormatter={v=>`${v} nm`}/><Area type="monotone" dataKey="absorbance" stroke="#32845f" strokeWidth={2.5} fill="url(#absorbFill)" activeDot={{r:5,strokeWidth:0}}/><ReferenceLine x={620} stroke="#d69b48" strokeDasharray="4 4" label={{value:"Peak region",fill:"#b17a2e",fontSize:10,position:"insideTopRight"}}/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><i className="legend-dot"/> Absorbance profile</span><span>Absorbance units (AU)</span></div></section>
  <aside className="panel spectral-side"><div className="panel-heading compact"><div><span className="panel-kicker">ANALYSIS CONTROLS</span><h2>Sample settings</h2></div><span className="icon-bubble blue"><Waves size={18}/></span></div><label className="field-label">Reference profile<select value={threshold} onChange={e=>setThreshold(e.target.value)}><option value="standard">Produce screening — standard</option><option value="high">Residue sensitivity — high</option><option value="research">Research comparison profile</option></select></label><div className="signal-summary"><span>Signal quality</span><strong><span className="quality-dot"/> Good</strong></div><div className="peak-list"><h3>Notable wavelength peaks</h3>{peaks.map((p,i)=><div className="peak-row" key={p.wavelength}><span className="peak-num">{String(i+1).padStart(2,"0")}</span><div><b>{p.wavelength} nm</b><small>{i===0?"Highest absorbance":i===1?"Secondary signal":"Additional signal"}</small></div><strong>{p.absorbance.toFixed(2)} <small>AU</small></strong></div>)}</div><button className="primary-button full-button" onClick={doSpectral}><Activity size={17}/> {spectralDone ? "Refresh spectrum" : "Load spectrum"}</button></aside></div>
  <div className="bottom-note"><Info size={17}/><p><b>Why wavelength matters:</b> spectroscopy compares how a sample interacts with light across different wavelengths.</p></div></>;
}
function ResultsPage({imageResult,spectralDone,exportReport,go,sampleId,fruit}) {
  return <><div className="results-hero"><div className="results-hero-copy"><span className="soft-tag"><FlaskConical size={13}/> SAMPLE REPORT</span><h2>{sampleId || "Untitled sample"}</h2><p>{fruit} · Image classification summary</p><div className="hero-pills"><span><ScanSearch size={13}/> Image: {imageResult ? "Complete" : "Pending"}</span><span><Waves size={13}/> Spectral: {spectralDone ? "Loaded" : "Pending"}</span></div></div><div className="report-status"><span className="status-symbol"><ScanSearch size={22}/></span><small>MODEL PREDICTION</small><strong>{imageResult ? imageResult.class_label : "Awaiting scan"}</strong><p>{imageResult ? `${Number(imageResult.confidence).toFixed(2)}% confidence` : "Run image screening to view result"}</p></div></div>
  <div className="results-cards"><div className="result-stat"><span>Predicted category</span><strong>{imageResult ? imageResult.class_label : "—"}</strong><small>Model classification</small></div><div className="result-stat"><span>Model confidence</span><strong>{imageResult ? `${Number(imageResult.confidence).toFixed(1)}%` : "—"}</strong><small>Top predicted class</small></div><div className="result-stat"><span>Spectral analysis</span><strong>{spectralDone ? "Loaded" : "Pending"}</strong><small>Profile status</small></div><div className="result-stat"><span>Model classes</span><strong>3</strong><small>Available categories</small></div></div>
  <section className="panel compound-panel"><div className="panel-heading"><div><span className="panel-kicker">CLASSIFICATION BREAKDOWN</span><h2>Prediction probabilities</h2><p>Confidence scores returned by the trained image-classification model.</p></div><button className="outline-button" onClick={exportReport}><Download size={15}/> Export CSV</button></div>{imageResult?.probabilities?.length ? <div className="table-scroll"><table><thead><tr><th>CLASS</th><th>MODEL CONFIDENCE</th><th>RESULT</th></tr></thead><tbody>{imageResult.probabilities.map(r=><tr key={r.class_label}><td><div className="compound-name"><span className="compound-dot"/><b>{r.class_label}</b></div></td><td><strong className="ppm-value">{Number(r.confidence).toFixed(2)}%</strong></td><td><span className={`table-status ${r.class_label === imageResult.class_label ? "okay" : ""}`}>{r.class_label === imageResult.class_label ? "Top prediction" : "Alternative class"}</span></td></tr>)}</tbody></table></div> : <div className="empty-results"><p>Run image screening to display the model's class probabilities here.</p><button className="primary-button" onClick={()=>go("image")}>Upload an image <ChevronRight size={15}/></button></div>}</section>
  <div className="results-bottom"><div className="panel interpretation"><div className="small-heading"><Activity size={17}/><h3>About this prediction</h3></div><ul><li>The model resizes the uploaded image to its expected input size.</li><li>It returns a probability for each of the three trained categories.</li><li>The category with the highest probability is shown as the prediction.</li><li>Model confidence is not the same as a measured pesticide concentration.</li></ul></div><div className="panel next-actions"><div className="small-heading"><Sprout size={17}/><h3>Next steps</h3></div><button onClick={()=>go("image")}>Run another image <ChevronRight size={15}/></button><button onClick={()=>go("spectral")}>Review spectral data <ChevronRight size={15}/></button><button onClick={exportReport}>Export report <Download size={15}/></button></div></div>
  </>;
}
createRoot(document.getElementById("root")).render(<App/>);
