'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight, Cpu, X, BookOpen } from 'lucide-react';
import { sources } from '@/lib/content';

export function SourcesButton({compact=false}:{compact?:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null);
  return <><button className="text-button sources-button" onClick={()=>dialog.current?.showModal()}><BookOpen size={14}/>{compact?'Sources':'Sources & model notes'}</button>
    <dialog ref={dialog} className="sources-dialog" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
      <button className="dialog-close icon-button" onClick={()=>dialog.current?.close()} aria-label="Close sources"><X size={20}/></button>
      <span className="eyebrow">THE SCIENCE BEHIND THE SCENE</span><h2>A model for understanding.</h2>
      <p>This is an original educational architecture, not a commercial chip reconstruction or an electromagnetic simulation. Dimensions, separation and device sizes are exaggerated.</p>
      <div className="notes-grid"><div><h3>What the colors mean</h3><p>Telecom light is invisible infrared. λ₁–λ₄ use false colors; separated strands make shared wavelength channels easier to follow. Pulses are slowed signal markers.</p></div><div><h3>Two different scales</h3><p>The package and magnified circuit have different scales. The PIC’s SOI stack is distinct from the interposer and package substrate.</p></div></div>
      <h3>Reference library</h3><ul className="source-list">{sources.map(s=><li key={s.id}>{s.url?<a href={s.url} target="_blank" rel="noreferrer">{s.title}<ArrowUpRight size={14}/></a>:<strong>{s.title}</strong>}<p>{s.detail}</p></li>)}</ul>
      <h3>Materials and simplifications</h3><p>Real systems include optical loss, thermal tuning, polarization effects, drivers, TIAs, power delivery and packaging tolerances. The four sample wavelengths and 25 Gb/s gross rate per lane are arithmetic teaching examples.</p>
      <h3>Code and attribution</h3><p>Original procedural geometry and app code, using Three.js, React Three Fiber, Drei and GSAP. The repository’s THIRD_PARTY_NOTICES.md documents licenses and reference projects. No application code or models were copied from the evaluated PC Digital Twin or 3D Product Explorer repositories.</p>
    </dialog>
  </>;
}
export function Header({explorer=false}:{explorer?:boolean}) {
  return <header className="site-header"><Link href="/" className="wordmark" aria-label="3D Visual home"><span className="logo-mark"><Cpu size={21} strokeWidth={1.3}/></span><b>3D</b><span>VISUAL</span><i> / SILICON PHOTONICS</i></Link><nav aria-label="Main navigation"><Link className={explorer?'':'nav-active'} href="/">The journey</Link><Link className={explorer?'nav-active':''} href="/explore">The explorer</Link><SourcesButton compact/></nav><span className="build-mark">TKS BUILD <i>01</i></span></header>;
}
export function Footer(){return <footer className="site-footer"><span>3D VISUAL <i> / </i> BUILT TO MAKE THE INVISIBLE UNDERSTANDABLE.</span><span>Conceptual model · Not to scale · False-color infrared</span></footer>;}
