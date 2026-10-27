'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from '@/lib/content';
import { Header, Footer, SourcesButton } from './chrome';
const Scene=dynamic(()=>import('./scene'),{ssr:false,loading:()=> <div className="scene-loading"><span/>Preparing the 3D view</div>});

export function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return reduced;
}
export function Story(){
  const area=useRef<HTMLDivElement>(null);const [progress,setProgress]=useState(0);const reduced=useReducedMotion();
  const index=Math.min(5,Math.floor(progress*6));const chapter=chapters[index];
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const trigger=ScrollTrigger.create({trigger:area.current,start:'top top+=72',end:'bottom bottom',onUpdate:self=>setProgress(self.progress)});
    return()=>trigger.kill();
  },[]);
  function goTo(i:number){
    if(!area.current)return;
    const distance=area.current.offsetHeight-window.innerHeight+72;
    const p=i===5?.96:(i+.12)/6;
    window.scrollTo({top:area.current.offsetTop-72+distance*p,behavior:reduced?'instant':'smooth'});
  }
  return <><Header/><main>
    <div ref={area} className="story-scroll" id="journey"><div className="story-sticky">
      <div className="story-grid" aria-hidden="true"/>
      <div className="story-scene"><Scene mode={progress<.5?'package':'circuit'} storyProgress={reduced?Math.round(progress*5)/5:progress} reducedMotion={reduced} playing={!reduced}/></div>
      <div className="scene-topline"><span><i/> INTERACTIVE ENGINEERING FIELD GUIDE</span><span>01 — CO-PACKAGED OPTICS</span></div>
      <section className={`story-copy ${index===0?'intro-copy':'chapter-copy'}`} aria-label="Current chapter">
        <div className="eyebrow">{String(index+1).padStart(2,'0')} / {chapter.label.toUpperCase()}</div>
        <h1 key={index}>{chapter.title[0]}<br/><em>{chapter.title[1]}</em></h1>
        <p>{chapter.body}</p>
        {index===0?<button className="primary-button" onClick={()=>goTo(1)}>Follow the light <ArrowDown size={15}/></button>:index===5?<Link className="primary-button" href="/explore">Explore it yourself <ArrowUpRight size={16}/></Link>:<button className="text-button chapter-next" onClick={()=>goTo(index+1)}>Continue the journey <ArrowDown size={15}/></button>}
      </section>
      <div className="story-model-note"><span className="crosshair">+</span>{chapter.note}</div>
      <div className="chapter-rail" aria-label="Jump to a chapter">{chapters.map((c,i)=><button key={c.label} title={c.label} aria-label={`Chapter ${i+1}: ${c.label}`} aria-current={i===index?'step':undefined} className={i===index?'current':''} onClick={()=>goTo(i)}><span>{String(i+1).padStart(2,'0')}</span><i/></button>)}</div>
      <div className="story-bottom"><span><ArrowDown size={14}/> SCROLL TO REVEAL <i>·</i> {Math.round(progress*100)}%</span><Link href="/explore">Skip to the explorer <MoveUpRight size={14}/></Link></div>
      <div className="journey-progress" style={{transform:`scaleX(${progress})`}}/>
    </div></div>
    <section className="story-end"><div><span className="eyebrow">NOW, TAKE THE CONTROLS</span><h2>Understanding starts<br/>with a closer look.</h2><p>Rotate the package. Pull apart its layers. Follow a wavelength from source to receiver.</p><Link className="primary-button" href="/explore">Open the explorer <ArrowUpRight size={17}/></Link></div><div className="end-path"><span>ELECTRICAL DATA</span><ArrowRight/><strong>MODULATION</strong><ArrowRight/><span>OPTICAL LINK</span><ArrowRight/><strong>DETECTION</strong><small>Source → encode → guide / select → detect → recover</small><SourcesButton/></div></section>
  </main><Footer/></>;
}
