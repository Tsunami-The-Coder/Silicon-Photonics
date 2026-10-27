'use client';

import { Component, Suspense, createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { channels, type PartId, type ViewMode } from '@/lib/content';

type V3 = [number,number,number];
export type SceneProps = {
  mode:ViewMode; selected?:PartId; onSelect?:(id:PartId)=>void;
  explode?:number; lift?:number; hidden?:PartId[]; activeChannels?:boolean[];
  labels?:boolean; playing?:boolean; autoRotate?:boolean; resetToken?:number;
  top?:boolean; storyProgress?:number; reducedMotion?:boolean;
};
const mint='#70d8bd', gold='#d6ad70';
const clamp=(v:number)=>THREE.MathUtils.clamp(v,0,1);
const LabelLayer=createContext<RefObject<HTMLDivElement|null>|null>(null);

function Slab({at=[0,0,0],size,color,selected=false,metal=.45,children}:{at?:V3;size:V3;color:string;selected?:boolean;metal?:number;children?:ReactNode}) {
  return <mesh position={at} castShadow receiveShadow>
    <boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.4} metalness={metal}/>
    <Edges threshold={20} color={selected?'#ffda97':color==='#164d43'?'#4e8c73':'#67828c'} opacity={selected?1:.4} transparent/>{children}
  </mesh>;
}
function Label({at,id,children,selected,onSelect}:{at:V3;id:PartId;children:ReactNode;selected?:PartId;onSelect?:SceneProps['onSelect']}) {
  const layer=useContext(LabelLayer); const anchor=useRef<THREE.Group>(null); const element=useRef<HTMLElement|null>(null);
  const {camera,size}=useThree(); const position=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{
    if(!layer?.current)return;
    const el=document.createElement(onSelect?'button':'span');
    el.className=`model-label ${selected===id?'selected':''}`;el.textContent=String(children);
    const click=()=>onSelect?.(id);el.addEventListener('click',click);layer.current.appendChild(el);element.current=el;
    return()=>{el.removeEventListener('click',click);el.remove();element.current=null;};
  },[layer,id,children,selected,onSelect]);
  useFrame(()=>{
    if(!anchor.current||!element.current)return;
    anchor.current.getWorldPosition(position);position.project(camera);
    element.current.style.display=position.z>1||Math.abs(position.x)>1.1||Math.abs(position.y)>1.1?'none':'block';
    element.current.style.left=`${(position.x*.5+.5)*size.width}px`;element.current.style.top=`${(-position.y*.5+.5)*size.height}px`;
  });
  return <group ref={anchor} position={at}/>;
}
function Clickable({id,onSelect,hidden,children}:{id:PartId;onSelect?:SceneProps['onSelect'];hidden?:PartId[];children:ReactNode}) {
  const interactive=!!onSelect;
  const over=(e:ThreeEvent<PointerEvent>)=>{if(interactive){e.stopPropagation();document.body.style.cursor='pointer';}};
  return <group visible={!hidden?.includes(id)} onClick={e=>{if(interactive){e.stopPropagation();onSelect(id);}}} onPointerOver={over} onPointerOut={()=>{if(interactive)document.body.style.cursor='auto';}}>{children}</group>;
}
function Contacts({at,cols=12,rows=10,spacing=.38,radius=.075}:{at:V3;cols?:number;rows?:number;spacing?:number;radius?:number}) {
  const ref=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{
    if(!ref.current)return;
    const matrix=new THREE.Matrix4();
    for(let x=0;x<cols;x++)for(let z=0;z<rows;z++){
      matrix.makeTranslation((x-(cols-1)/2)*spacing,0,(z-(rows-1)/2)*spacing);
      ref.current.setMatrixAt(x*rows+z,matrix);
    }
    ref.current.instanceMatrix.needsUpdate=true;
  },[cols,rows,spacing]);
  return <instancedMesh ref={ref} args={[undefined,undefined,cols*rows]} position={at} castShadow>
    <sphereGeometry args={[radius,8,6]}/><meshStandardMaterial color={gold} metalness={.9} roughness={.3}/>
  </instancedMesh>;
}
function Curve({points,color,radius=.035,opacity=1,animated=false,playing=true,channel=0}:{points:V3[];color:string;radius?:number;opacity?:number;animated?:boolean;playing?:boolean;channel?:number}) {
  const pointKey=points.flat().join(',');
  // Preserve geometry across camera/selection updates; rebuild only when the path changes.
  const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[pointKey]);
  const geometry=useMemo(()=>new THREE.TubeGeometry(curve,48,radius,5,false),[curve,radius]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const ref=useRef<THREE.Group>(null); const t=useRef(0);
  useFrame((_,delta)=>{
    if(playing)t.current+=Math.min(delta,.05)*.12;
    if(ref.current)ref.current.children.forEach((child,i)=>child.position.copy(curve.getPoint((t.current+i/5+channel*.13)%1)));
  });
  return <group>
    <mesh geometry={geometry}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.35} transparent opacity={opacity} roughness={.4}/></mesh>
    {animated&&<group ref={ref}>{Array.from({length:5},(_,i)=><mesh key={i}><sphereGeometry args={[radius*2.1,7,6]}/><meshBasicMaterial color={color}/></mesh>)}</group>}
  </group>;
}
function SurfaceText({text,at,size=.28,color='#b9d2ce'}:{text:string;at:V3;size?:number;color?:string}) {
  const tex=useMemo(()=>{
    const c=document.createElement('canvas');c.width=1024;c.height=128;
    const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.font='500 58px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  },[text,color]);
  useEffect(()=>()=>tex.dispose(),[tex]);
  return <mesh position={at} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[size*8,size]}/><meshBasicMaterial map={tex} transparent depthWrite={false}/></mesh>;
}
function PackageModel(props:SceneProps) {
  const {selected,onSelect,hidden,labels,playing,activeChannels=channels.map(()=>true),lift=0}=props;
  const e=props.explode??0;
  const raised=(id:PartId)=>selected===id?lift:0;
  const substrateY=raised('substrate'), interY=.55+e*1.9+raised('interposer'), dieY=1.15+e*4.4;
  const bumpY=.95+e*3.2+raised('bumps');
  const opticalY=dieY+raised('engine');
  const show=(id:PartId)=>!hidden?.includes(id);
  const tracePoints=useMemo(()=>Array.from({length:15},(_,i)=>{
    const z=-3.9+i*.55;
    return [[-6.6,0,z],[-4,0,z],[-3.5,0,z*.75],[-2.1,0,z*.75]] as V3[];
  }),[]);
  return <group>
    <Clickable id="substrate" {...{onSelect,hidden}}><group position={[0,substrateY,0]}>
      <Slab size={[17,.48,11.5]} color="#164d43" selected={selected==='substrate'}/>
      <Slab at={[0,-.28,0]} size={[16.8,.08,11.3]} color="#263c32"/>
      <Contacts at={[0,-.42,0]} cols={21} rows={14} spacing={.7} radius={.095}/>
      {[-1,1].map(s=><group key={s}>{Array.from({length:24},(_,i)=><Slab key={i} at={[s*8.15,.26,-5+i*.43]} size={[.3,.025,.13]} color={gold}/>)}</group>)}
      <SurfaceText text="3D VISUAL  /  CPO CONCEPT  /  REV.01" at={[0,.255,5.2]} size={.27}/>
    </group></Clickable>
    <Clickable id="interposer" {...{onSelect,hidden}}><group position={[0,interY,0]}>
      <Slab size={[14.5,.28,9.3]} color="#233a46" selected={selected==='interposer'}/>
      <Slab at={[0,.16,0]} size={[14.3,.025,9.1]} color="#1d303b"/>
      {tracePoints.map((ps,i)=><group key={i}>{[-1,1].map(s=><Curve key={s} points={ps.map(([x,y,z])=>[x*s,y+.19,z])} color={i%3===0?gold:'#5c7775'} radius={.018} opacity={.75}/>)}</group>)}
      {[-1,1].map(s=><group key={s}>{Array.from({length:12},(_,i)=><Slab key={i} at={[-3+i*.55,.2,s*3.8]} size={[.32,.1,.18]} color={i%3===0?'#ad956c':'#44545a'}/>)}</group>)}
    </group></Clickable>
    <Clickable id="bumps" {...{onSelect,hidden}}><group position={[0,bumpY,0]}>
      <Contacts at={[0,0,0]} cols={13} rows={12} spacing={.38}/>
      {[-1,1].map(s=><Contacts key={s} at={[s*5.2,0,0]} cols={5} rows={11} spacing={.4}/>) }
    </group></Clickable>
    <Clickable id="gpu" {...{onSelect,hidden}}><group position={[0,dieY+raised('gpu'),0]}>
      <Slab size={[5.7,.48,5.8]} color="#717b78" selected={selected==='gpu'}/>
      <Slab at={[0,.27,0]} size={[5.45,.07,5.55]} color={gold}/>
      <Slab at={[0,.33,0]} size={[5.24,.06,5.32]} color="#253e48"/>
      {Array.from({length:8},(_,i)=><group key={i}>{Array.from({length:8},(_,j)=><Slab at={[-2.2+i*.62,.38,-2.2+j*.62]} key={j} size={[.55,.018,.55]} color={(i+j)%3===0?'#45666e':'#304e5c'} />)}</group>)}
      <Slab at={[0,.405,0]} size={[3.4,.03,1.2]} color="#18333f"/>
      <SurfaceText text="COMPUTE DIE" at={[0,.428,0]} size={.38} color="#e4d7bc"/>
    </group></Clickable>
    {[-1,1].map(s=><group key={s} position={[0,dieY+raised('engine'),0]} visible={show('engine')}>
      <Clickable id="engine" {...{onSelect,hidden}}><group position={[s*5.5,0,0]}>
        <Slab size={[2.25,.3,5.3]} color="#153c3f" selected={selected==='engine'}/>
        <Slab at={[0,.16,0]} size={[2.05,.025,5.05]} color="#244e50"/>
        {channels.map((ch,i)=><group key={i}>
          <Curve points={[[-.65,.2,-2.3],[-.65,.2,0],[-.65,.2,2.3]]} color={ch.color} radius={.025} opacity={activeChannels[i]?.7:.12}/>
          <mesh position={[.1,.21,-1.5+i*.9]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.24,.035,6,24]}/><meshStandardMaterial color={ch.color} emissive={ch.color} emissiveIntensity={activeChannels[i]?.45:0}/></mesh>
          <Slab at={[.68,.23,-1.5+i*.9]} size={[.3,.07,.3]} color="#877399"/>
        </group>)}
        <SurfaceText text="PIC" at={[.25,.25,2.2]} size={.2}/>
      </group></Clickable>
      <Clickable id="eic" {...{onSelect,hidden}}><group position={[s*3.75,raised('eic'),0]}>
        <Slab size={[.9,.35,4.4]} color="#62646a" selected={selected==='eic'}/>
        <Slab at={[0,.2,0]} size={[.75,.06,4.2]} color="#39434f"/>
        <SurfaceText text="EIC" at={[0,.24,0]} size={.13}/>
      </group></Clickable>
    </group>)}
    <Clickable id="laser" {...{onSelect,hidden}}><group position={[-11.8,.4,-3.8]}>
      <Slab size={[3.7,.8,2.5]} color="#647078" selected={selected==='laser'}/>
      <Slab at={[0,.48,0]} size={[3.4,.12,2.25]} color="#293f4a"/>
      {Array.from({length:9},(_,i)=><Slab key={i} at={[-1.4+i*.35,.65,0]} size={[.1,.25,2.1]} color="#526672"/>)}
      <Slab at={[1.9,.1,0]} size={[.3,.4,.6]} color={gold}/>
      <mesh position={[-1.4,.85,-.8]}><sphereGeometry args={[.08,8,8]}/><meshBasicMaterial color={mint}/></mesh>
    </group></Clickable>
    <Clickable id="fibers" {...{onSelect,hidden}}>
      <Curve points={[[-9.8,.5,-3.8],[-8,.8,-4.4],[-7,opticalY+.3,-4.4],[-5.9,opticalY+.2,-2.8]]} color="#b6bcaf" radius={.095} opacity={.6}/>
      {channels.map((ch,i)=><group key={i}>
        <Curve points={[[-9.8,.5+i*.018,-3.8],[-8,1+i*.025,-4.4],[-7,opticalY+.3+i*.025,-4.4],[-5.9,opticalY+.2+i*.025,-2.8]]} color={activeChannels[i]?ch.color:'#26373f'} radius={.018} animated={activeChannels[i]} playing={playing} channel={i}/>
      </group>)}
      {[-1,1].map(s=><group key={s}>
        <Curve points={[[s*5.5,opticalY+.1,2.8],[s*7,opticalY+.5,4.4],[s*10,1.1,5],[s*11.8,.8,5.8]]} color="#829ba3" radius={.09} opacity={.6}/>
        {channels.map((ch,i)=><Curve key={i} points={s<0?[[s*5.5,opticalY+.15+i*.02,2.8],[s*7,opticalY+.5+i*.02,4.4],[s*10,1.1+i*.02,5],[s*11.8,.8+i*.02,5.8]]:[[s*11.8,.8+i*.02,5.8],[s*10,1.1+i*.02,5],[s*7,opticalY+.5+i*.02,4.4],[s*5.5,opticalY+.15+i*.02,2.8]]} color={activeChannels[i]?ch.color:'#26373f'} radius={.018} animated={activeChannels[i]} playing={playing} channel={i}/>)}
        <Slab at={[s*12.2,.65,6.1]} size={[2,.8,1.4]} color="#304350"/>
        <SurfaceText text={s<0?'REMOTE RX':'REMOTE TX'} at={[s*12.2,1.07,6.1]} size={.18}/>
      </group>)}
    </Clickable>
    {labels&&<group>
      {show('gpu')&&<Label at={[0,dieY+raised('gpu')+1,0]} id="gpu" {...{selected,onSelect}}>COMPUTE DIE</Label>}
      {show('engine')&&<Label at={[5.5,opticalY+.5,-3.3]} id="engine" {...{selected,onSelect}}>OPTICAL ENGINE</Label>}
      {show('laser')&&<Label at={[-11.8,1.7,-4.1]} id="laser" {...{selected,onSelect}}>CW LASER SUPPLY</Label>}
      {show('interposer')&&<Label at={[6.5,interY+.25,4.1]} id="interposer" {...{selected,onSelect}}>ELECTRICAL INTERPOSER</Label>}
      {show('substrate')&&<Label at={[-5,substrateY+.1,5.7]} id="substrate" {...{selected,onSelect}}>PACKAGE SUBSTRATE</Label>}
    </group>}
  </group>;
}

function CircuitModel(props:SceneProps) {
  const {selected,onSelect,hidden,labels,playing,activeChannels=channels.map(()=>true),lift=0}=props;
  const e=props.explode??0;
  const top=.7+e*1.7;
  const raise=selected==='soi'?lift:0;
  return <group position={[0,raise,0]}>
    <Clickable id="soi" {...{onSelect,hidden}}><group>
      <Slab at={[0,-.4,0]} size={[18,.6,12]} color="#344751" selected={selected==='soi'}/>
      <Slab at={[0,.02+e*.7,0]} size={[17.9,.2,11.9]} color="#b2c5c5" metal={.08}/>
      <Slab at={[0,top-.23,0]} size={[17.8,.12,11.8]} color="#183b46"/>
      <SurfaceText text="SILICON HANDLE" at={[0,-.085,5.5]} size={.29}/>
      <SurfaceText text="BURIED OXIDE / SiO2" at={[0,.14+e*.7,5.2]} size={.28} color="#223d47"/>
    </group></Clickable>
    <group position={[0,top,0]}>
      <Clickable id="waveguide" {...{onSelect,hidden}}>
        <Slab at={[-1,0,-2]} size={[13,.07,.2]} color="#8eacb3" selected={selected==='waveguide'}/>
        <Slab at={[-1,0,2.3]} size={[13,.07,.2]} color="#8eacb3" selected={selected==='waveguide'}/>
      </Clickable>
      {channels.map((ch,i)=>{
        const x=-4.5+i*2.8;
        return <group key={i}>
          <Clickable id="ring" {...{onSelect,hidden}}><group position={[x,0,-1.26]}>
            <mesh rotation={[-Math.PI/2,0,0]} castShadow><torusGeometry args={[.62,.065,8,48]}/><meshStandardMaterial color={ch.color} emissive={ch.color} emissiveIntensity={activeChannels[i]?.5:.04} metalness={.45}/></mesh>
            <mesh rotation={[-Math.PI/2,0,0]} position={[0,.03,0]}><torusGeometry args={[.85,.045,6,40,Math.PI*1.55]}/><meshStandardMaterial color={gold} metalness={.9} roughness={.3}/></mesh>
            <Slab at={[0,.05,1.35]} size={[1.1,.18,.55]} color="#6b6b73" selected={selected==='ring'}/>
            <Curve points={[[0,.1,.85],[0,.1,1.1]]} color={gold} radius={.035}/>
          </group></Clickable>
          <Clickable id="ring" {...{onSelect,hidden}}><group position={[x,0,3.05]}>
            <mesh rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.62,.065,8,48]}/><meshStandardMaterial color={ch.color} emissive={ch.color} emissiveIntensity={activeChannels[i]?.35:0}/></mesh>
            <Curve points={[[0,0,3.72-3.05],[.65,0,3.72-3.05],[.85,0,4.4-3.05]]} color={ch.color} radius={.05} opacity={activeChannels[i]?1:.1}/>
          </group></Clickable>
          <Clickable id="detector" {...{onSelect,hidden}}><group position={[x+.85,0,4.5]}>
            <Slab size={[.65,.22,.6]} color="#a386ba" selected={selected==='detector'}/>
            <Slab at={[0,.14,0]} size={[.45,.07,.42]} color={activeChannels[i]?ch.color:'#3d4251'}/>
            <Curve points={[[0,.05,.35],[0,.05,.6]]} color={gold} radius={.025}/>
            <Slab at={[0,.03,1]} size={[1.1,.15,.55]} color="#647481"/>
            <SurfaceText text="TIA" at={[0,.12,1]} size={.13}/>
          </group></Clickable>
          <Clickable id="wdm" {...{onSelect,hidden}}>
            <Curve points={[[-8.8,.13+i*.035,-2],[-4,.13+i*.035,-2],[1,.13+i*.035,-2],[8.8,.13+i*.035,-2]]} color={activeChannels[i]?ch.color:'#293e48'} radius={.022} animated={activeChannels[i]} playing={playing} channel={i}/>
            <Curve points={[[8.8,.13+i*.035,2.3],[x+1,.13+i*.035,2.3],[x,.13+i*.035,2.3],[x-.62,.13+i*.035,3.05],[x,.13+i*.035,3.67],[x+.65,.13+i*.035,3.72],[x+.85,.13+i*.035,4.5]]} color={activeChannels[i]?ch.color:'#293e48'} radius={.023} animated={activeChannels[i]} playing={playing} channel={i}/>
          </Clickable>
          <SurfaceText text={`${ch.name} / ${ch.wavelength} nm`} at={[x,.02,-3.2]} size={.19} color={ch.color}/>
        </group>;
      })}
      <SurfaceText text="TX  /  CARRIER IN  >>>  MODULATED DATA OUT" at={[0,.04,-4.5]} size={.35}/>
      <SurfaceText text="RX  /  INCOMING DATA  <<<  FILTER + DETECT" at={[0,.04,1.25]} size={.31}/>
      <SurfaceText text="ILLUSTRATIVE WAVELENGTHS / MICRON FEATURES ENLARGED" at={[0,.04,-5.3]} size={.22}/>
      {labels&&<group>
        {!hidden?.includes('ring')&&<Label at={[-5,.8,-1.1]} id="ring" {...{selected,onSelect}}>TX MICRORING + DRIVER</Label>}
        {!hidden?.includes('wdm')&&<Label at={[5.4,.9,-2.4]} id="wdm" {...{selected,onSelect}}>SHARED WDM BUS → FIBER</Label>}
        {!hidden?.includes('waveguide')&&<Label at={[-6,.8,2.2]} id="waveguide" {...{selected,onSelect}}>RX WAVEGUIDE ← REMOTE TX</Label>}
        {!hidden?.includes('detector')&&<Label at={[3.5,.8,4.8]} id="detector" {...{selected,onSelect}}>Ge DETECTOR → TIA</Label>}
      </group>}
    </group>
    {labels&&!hidden?.includes('soi')&&<Label at={[1,-.3,6.5]} id="soi" {...{selected,onSelect}}>SOI STACK · THICKNESS EXAGGERATED</Label>}
  </group>;
}

function CameraRig({mode,top,resetToken,autoRotate,storyProgress,reducedMotion}:SceneProps) {
  const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
  const {camera}=useThree();
  const target=useRef(new THREE.Vector3(0,1.5,0));
  const destination=useRef(new THREE.Vector3(22,21,26));
  const transitioning=useRef(true);
  useEffect(()=>{
    destination.current.set(...(top?[0.1,36,.1] as V3:mode==='circuit'?[18,22,24] as V3:[22,21,26] as V3));
    target.current.set(0,mode==='circuit'?0:1.5,0);transitioning.current=true;
  },[mode,top,resetToken]);
  useFrame((_,delta)=>{
    if(storyProgress!==undefined){
      const p=storyProgress;
      if(p<.48){
        const t=clamp((p-.25)/.23);
        destination.current.set(THREE.MathUtils.lerp(23,15,t),THREE.MathUtils.lerp(21,14,t),THREE.MathUtils.lerp(27,18,t));
        target.current.set(THREE.MathUtils.lerp(-1,3.5,t),1.5+p*4,0);
      }else{
        const t=clamp((p-.5)/.5);
        destination.current.set(THREE.MathUtils.lerp(18,13,t),THREE.MathUtils.lerp(25,23,t),THREE.MathUtils.lerp(23,17,t));
        target.current.set(0,1,THREE.MathUtils.lerp(-1,1.5,t));
      }
      camera.position.lerp(destination.current,reducedMotion?1:1-Math.exp(-5*delta));
      camera.lookAt(target.current);return;
    }
    if(transitioning.current&&controls.current){
      const a=reducedMotion?1:1-Math.exp(-6*delta);
      camera.position.lerp(destination.current,a);controls.current.target.lerp(target.current,a);
      if(camera.position.distanceTo(destination.current)<.02)transitioning.current=false;
      controls.current.update();
    }
  });
  return storyProgress===undefined?<OrbitControls ref={controls} makeDefault minDistance={10} maxDistance={65} maxPolarAngle={Math.PI*.49} enableDamping autoRotate={autoRotate&&!reducedMotion} autoRotateSpeed={.45} onStart={()=>{transitioning.current=false;}}/>:null;
}

function World(props:SceneProps) {
  const story=props.storyProgress!==undefined;
  const mode=story?(props.storyProgress!<.5?'package':'circuit'):props.mode;
  const explode=story?(mode==='package'?clamp((props.storyProgress!-.1)/.18)*.65:Math.max(.08,.75-clamp((props.storyProgress!-.55)/.2)*.65)):props.explode;
  return <>
    <ambientLight intensity={.8}/><hemisphereLight args={['#b4d5dd','#101b20',1.6]}/>
    <directionalLight position={[8,22,10]} intensity={3} color="#fff0d4" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-.001}/>
    <directionalLight position={[-15,10,-12]} intensity={2.7} color="#5ebfbf"/>
    <pointLight position={[-10,5,5]} intensity={30} color="#ffd18a"/>
    <group position={[0,mode==='circuit'?.2:0,0]}>{mode==='package'?<PackageModel {...props} explode={explode} labels={story?props.storyProgress!>.14:props.labels}/>:<CircuitModel {...props} explode={explode} labels={story?props.storyProgress!>.67:props.labels}/>}</group>
    <mesh position={[0,-1.1,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[180,180]}/><meshStandardMaterial color="#10232b" roughness={.6} metalness={.2}/></mesh>
    <gridHelper args={[100,50,'#26434b','#1a333c']} position={[0,-1.08,0]}/>
    <fog attach="fog" args={['#0b1b24',45,100]}/>
    <CameraRig {...props} mode={mode}/>
  </>;
}
export function SceneFallback() {
  return <div className="scene-fallback"><div className="fallback-stack"><i/><i/><i/></div><strong>Explore the architecture</strong><p>The 3D view needs WebGL. Component explanations and the signal-path diagram are available below.</p><span>GPU → DRIVER → MODULATOR → FIBER → Ge DETECTOR → TIA</span></div>;
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<SceneFallback/>:this.props.children;}
}
export default function Scene(props:SceneProps) {
  const [ready,setReady]=useState(false);
  const labelLayer=useRef<HTMLDivElement>(null);
  return <SceneBoundary><div className="three-stage" aria-label={`${props.mode==='circuit'?'Magnified photonic circuit':'Co-packaged optics assembly'}; illustrative and not to scale`}>
    {!ready&&<div className="scene-loading"><span/>Preparing the 3D view</div>}
    <Canvas shadows={{type:THREE.PCFShadowMap}} camera={{position:[23,21,27],fov:40,near:.1,far:180}} dpr={[1,1.5]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} fallback={<SceneFallback/>} onCreated={({gl})=>{gl.setClearColor('#0b1b24',0);setReady(true);}}>
      <LabelLayer.Provider value={labelLayer}><Suspense fallback={null}><World {...props}/></Suspense></LabelLayer.Provider>
    </Canvas>
    <div ref={labelLayer} className="scene-label-layer"/>
  </div></SceneBoundary>;
}
