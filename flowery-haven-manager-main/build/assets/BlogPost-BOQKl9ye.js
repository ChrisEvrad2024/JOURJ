import{i as w,b as O,c as Y,r as n,af as _,aa as G,j as e,N as v,F as b,B as c,A as K,Y as Q,O as W,$ as E,g as X,T as ee,P as se,I as F,J as m,H as L}from"./index-D2Ipw2YP.js";import{T as te}from"./textarea-BXYulBZ9.js";import{S as ae}from"./separator-B4UgFw64.js";import{b as re,c as y,d as le,e as ne}from"./blog-DN9nGdDB.js";import{C as ie}from"./calendar-DcxNRdDE.js";import{L as ce}from"./linkedin-DYpH3Lrh.js";import{T as oe}from"./tag-kkqM9wwa.js";import{S as M}from"./smile-D01J8cBb.js";import{f as me}from"./format-BxPkkDNt.js";import{f as de}from"./fr-BSv8k3uD.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=w("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=w("Reply",[["polyline",{points:"9 17 4 12 9 7",key:"hvgpf2"}],["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=w("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",key:"emmmcr"}]]),Ce=()=>{const{id:l}=O(),x=Y(),[r,A]=n.useState(null),[V,$]=n.useState(!0),[u,C]=n.useState(""),[k,z]=n.useState(""),[h,P]=n.useState(""),[S,R]=n.useState(!1),[d,p]=n.useState(null),[j,f]=n.useState([]),[T,D]=n.useState([]);n.useEffect(()=>{if(l){const s=re(Number(l));if(s){A(s),f(y(Number(l))),document.title=`${s.title} | Floral Paradise Blog`;const t=s.category==="conseils"?_("plantes"):G().slice(0,3);D(t)}else x("/blog")}$(!1)},[l,x]);const B=()=>{x("/blog")},g=s=>{try{return me(new Date(s),"dd MMMM yyyy",{locale:de})}catch{return s}},N=s=>{if(!r)return;const t=window.location.href,a=r.title;let i="";switch(s){case"facebook":i=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(t)}`;break;case"twitter":i=`https://twitter.com/intent/tweet?url=${encodeURIComponent(t)}&text=${encodeURIComponent(a)}`;break;case"linkedin":i=`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(t)}`;break}window.open(i,"_blank","width=600,height=400")},q=s=>{if(s.preventDefault(),!u.trim()||!h.trim()||!l){m.error("Veuillez remplir tous les champs obligatoires.");return}R(!0);try{le(Number(l),u,h,d||void 0,k||void 0)?(f(y(Number(l))),C(""),z(""),P(""),p(null),m.success("Votre commentaire a été ajouté avec succès !")):m.error("Une erreur est survenue lors de l'ajout du commentaire.")}catch(t){console.error("Error adding comment:",t),m.error("Une erreur est survenue lors de l'ajout du commentaire.")}finally{R(!1)}},I=(s,t)=>{if(!l)return;ne(Number(l),s,t)&&(f(y(Number(l))),m.success("Merci pour votre réaction !"))},H=s=>{p(s);const t=document.getElementById("comment-form");t&&t.scrollIntoView({behavior:"smooth"})},J=()=>{p(null)},Z=s=>{var t;return e.jsxs("div",{className:"p-4 bg-muted/20 rounded-lg border border-border/50",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("h4",{className:"font-medium",children:s.author}),e.jsx("span",{className:"text-xs text-muted-foreground",children:g(s.date)})]}),e.jsx("p",{className:"text-sm mb-3",children:s.content}),e.jsxs("div",{className:"flex items-center gap-4 mt-2",children:[e.jsx("div",{className:"flex gap-3",children:(t=s.reactions)==null?void 0:t.map(a=>e.jsxs("button",{onClick:()=>I(s.id,a.type),className:"flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",children:[a.type==="like"&&e.jsx(U,{size:14}),a.type==="love"&&e.jsx(L,{size:14}),a.type==="laugh"&&e.jsx(M,{size:14}),e.jsx("span",{children:a.count})]},a.type))}),e.jsxs("button",{onClick:()=>H(s.id),className:"flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",children:[e.jsx(ue,{size:14}),e.jsx("span",{children:"Répondre"})]})]}),s.replies&&s.replies.length>0&&e.jsx("div",{className:"pl-4 mt-4 border-l-2 border-border/50 space-y-4",children:s.replies.map(a=>{var i;return e.jsxs("div",{className:"p-3 bg-background rounded-md",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("h5",{className:"font-medium text-sm",children:a.author}),e.jsx("span",{className:"text-xs text-muted-foreground",children:g(a.date)})]}),e.jsx("p",{className:"text-sm",children:a.content}),e.jsx("div",{className:"flex items-center gap-4 mt-2",children:e.jsx("div",{className:"flex gap-3",children:(i=a.reactions)==null?void 0:i.map(o=>e.jsxs("button",{onClick:()=>I(a.id,o.type),className:"flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",children:[o.type==="like"&&e.jsx(U,{size:14}),o.type==="love"&&e.jsx(L,{size:14}),o.type==="laugh"&&e.jsx(M,{size:14}),e.jsx("span",{children:o.count})]},o.type))})})]},a.id)})})]},s.id)};return V?e.jsxs("div",{className:"min-h-screen flex flex-col",children:[e.jsx(v,{}),e.jsx("div",{className:"flex-1 flex items-center justify-center",children:e.jsx("p",{children:"Chargement de l'article..."})}),e.jsx(b,{})]}):r?e.jsxs("div",{className:"min-h-screen flex flex-col",children:[e.jsx(v,{}),e.jsx("div",{className:"pt-24 pb-16 container mx-auto px-4",children:e.jsxs("div",{className:"max-w-4xl mx-auto",children:[e.jsxs(c,{variant:"ghost",onClick:B,className:"mb-6 flex items-center gap-1",children:[e.jsx(K,{size:16}),"Retour au blog"]}),e.jsx("div",{className:"rounded-lg overflow-hidden mb-8",children:e.jsx("img",{src:r.imageUrl,alt:r.title,className:"w-full h-[400px] object-cover"})}),e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-4xl font-serif mb-4",children:r.title}),e.jsxs("div",{className:"flex flex-wrap items-center gap-4 text-muted-foreground mb-6",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(ie,{size:16}),e.jsx("span",{children:g(r.date)})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(Q,{size:16}),e.jsx("span",{children:r.author})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(W,{size:16}),e.jsxs("span",{children:[r.viewCount||1," vues"]})]}),e.jsx(E,{variant:"outline",className:"ml-auto capitalize",children:r.category})]}),e.jsx("p",{className:"text-lg font-medium mb-6",children:r.excerpt}),e.jsx("div",{className:"prose prose-stone max-w-none",children:e.jsx("p",{className:"whitespace-pre-line",children:r.content})})]}),e.jsxs("div",{className:"my-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/20 rounded-lg border",children:[e.jsxs("div",{className:"text-center sm:text-left",children:[e.jsx("h3",{className:"text-lg font-medium mb-1",children:"Partager cet article"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Si vous avez aimé cet article, partagez-le !"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs(c,{variant:"outline",size:"icon",className:"bg-[#3b5998] text-white hover:bg-[#3b5998]/90",onClick:()=>N("facebook"),children:[e.jsx(X,{size:18}),e.jsx("span",{className:"sr-only",children:"Partager sur Facebook"})]}),e.jsxs(c,{variant:"outline",size:"icon",className:"bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90",onClick:()=>N("twitter"),children:[e.jsx(ee,{size:18}),e.jsx("span",{className:"sr-only",children:"Partager sur Twitter"})]}),e.jsxs(c,{variant:"outline",size:"icon",className:"bg-[#0077B5] text-white hover:bg-[#0077B5]/90",onClick:()=>N("linkedin"),children:[e.jsx(ce,{size:18}),e.jsx("span",{className:"sr-only",children:"Partager sur LinkedIn"})]})]})]}),r.tags&&r.tags.length>0&&e.jsxs("div",{className:"mt-8 pt-6 border-t",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx(oe,{size:16}),e.jsx("span",{className:"font-medium",children:"Tags:"})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:r.tags.map((s,t)=>e.jsx(E,{variant:"secondary",children:s},t))})]}),T.length>0&&e.jsxs("section",{className:"mt-12 pt-6 border-t",children:[e.jsx("h2",{className:"text-2xl font-serif mb-6",children:"Articles en relation"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-6",children:T.map(s=>e.jsx(se,{product:s},s.id))})]}),e.jsxs("div",{className:"mt-12",children:[e.jsx(ae,{className:"my-8"}),e.jsxs("div",{className:"flex items-center gap-2 mb-6",children:[e.jsx(xe,{size:20}),e.jsx("h2",{className:"text-2xl font-serif",children:"Commentaires"}),e.jsxs("span",{className:"text-muted-foreground ml-2",children:["(",j.length,")"]})]}),j.length>0?e.jsx("div",{className:"space-y-6 mb-10",children:j.map(Z)}):e.jsx("div",{className:"text-center my-10 p-6 bg-muted/20 rounded-lg",children:e.jsx("p",{className:"text-muted-foreground",children:"Soyez le premier à commenter cet article !"})}),e.jsxs("div",{className:"mt-8",id:"comment-form",children:[e.jsx("h3",{className:"text-xl font-serif mb-4",children:d?"Répondre à un commentaire":"Laisser un commentaire"}),d&&e.jsxs("div",{className:"mb-4 flex items-center justify-between bg-muted/30 p-3 rounded-md",children:[e.jsx("p",{className:"text-sm",children:"Vous répondez à un commentaire"}),e.jsx(c,{variant:"ghost",size:"sm",onClick:J,className:"text-muted-foreground",children:"Annuler"})]}),e.jsxs("form",{onSubmit:q,className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{htmlFor:"name",className:"text-sm font-medium",children:["Nom ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(F,{id:"name",value:u,onChange:s=>C(s.target.value),placeholder:"Votre nom",required:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{htmlFor:"email",className:"text-sm font-medium",children:"Email (optionnel)"}),e.jsx(F,{id:"email",type:"email",value:k,onChange:s=>z(s.target.value),placeholder:"Votre email"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{htmlFor:"comment",className:"text-sm font-medium",children:["Commentaire ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(te,{id:"comment",value:h,onChange:s=>P(s.target.value),placeholder:"Votre commentaire...",rows:4,required:!0})]}),e.jsx(c,{type:"submit",className:"w-full sm:w-auto",disabled:S,children:S?"Envoi en cours...":d?"Publier la réponse":"Publier le commentaire"})]})]})]})]})}),e.jsx(b,{})]}):e.jsxs("div",{className:"min-h-screen flex flex-col",children:[e.jsx(v,{}),e.jsxs("div",{className:"flex-1 flex flex-col items-center justify-center p-4",children:[e.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Article non trouvé"}),e.jsx("p",{className:"text-muted-foreground mb-6",children:"L'article que vous recherchez n'existe pas ou a été supprimé."}),e.jsx(c,{onClick:B,children:"Retour au blog"})]}),e.jsx(b,{})]})};export{Ce as default};
