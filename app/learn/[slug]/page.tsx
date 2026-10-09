import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { Gate } from "@/components/learn/Gate";
import { Comments } from "@/components/comments/Comments";
import { googleEnabled } from "@/lib/auth";
import { canonicalPreviewAccount, currentReader } from "@/lib/account-security";
import { completeReader, privateReader } from "@/lib/accounts";
import type { Step } from "@/lib/learn";
import { getArticle, SERIES, articleDate, articleReadTime } from "@/lib/learn";
import { SITE } from "@/lib/site";
import { withShare } from "@/lib/meta";

type Params={params:Promise<{slug:string}>};
export async function generateMetadata({params: routeParams}:Params):Promise<Metadata>{
 const params=await routeParams;
 const article=getArticle(params.slug);if(!article)return {};
 const shared=withShare({title:article.question,description:article.answer,alternates:{canonical:`/learn/${article.slug}`}}); return {...shared, openGraph:{...shared.openGraph,type:"article",publishedTime:article.published,modifiedTime:article.published,authors:["Kaustubh Srivastava"]}};
}
function embedUrl(url:string):string|null{
 try{const parsed=new URL(url);if(["youtube.com","www.youtube.com","m.youtube.com","youtu.be"].includes(parsed.hostname)){const id=parsed.hostname==="youtu.be"?parsed.pathname.slice(1):parsed.searchParams.get("v");return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null}}catch{return null}return null;
}
export const dynamic="force-dynamic";
function ArticleSections({steps}:{steps:Step[]}) {return <div className="article-prose">{steps.map((section,index)=><section key={section.title||index}>{section.title?<h2>{section.title}</h2>:null}{section.body.map((paragraph,i)=><p key={i}>{paragraph.split(/(\[\d+\])/g).map((part,j)=>/^\[\d+\]$/.test(part)?<a key={j} href={`#source-${part.slice(1,-1)}`} aria-label={`Source ${part.slice(1,-1)}`}>{part}</a>:part)}</p>)}{section.doThisNow?<aside className="reader-action"><p className="vx-label">Apply the idea</p><p>{section.doThisNow}</p></aside>:null}</section>)}</div>;}
export default async function ArticlePage({params: routeParams}:Params):Promise<React.ReactElement>{
 const params=await routeParams;
 await canonicalPreviewAccount(`/learn/${encodeURIComponent(params.slug)}`);const article=getArticle(params.slug);if(!article)notFound();const video=article.videoUrl?embedUrl(article.videoUrl):null;const reader=await currentReader();const allowed=Boolean(reader&&completeReader(reader));
 const breadcrumbs={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:SITE.url},{"@type":"ListItem",position:2,name:"Articles",item:`${SITE.url}/learn`},{"@type":"ListItem",position:3,name:article.question,item:`${SITE.url}/learn/${article.slug}`}]};
 const schema={"@context":"https://schema.org","@type":"Article",headline:article.question,description:article.answer,datePublished:article.published,dateModified:article.published,author:{"@type":"Person",name:"Kaustubh Srivastava",url:`${SITE.url}/about`},publisher:{"@type":"Organization",name:SITE.name,url:SITE.url},mainEntityOfPage:`${SITE.url}/learn/${article.slug}`,isAccessibleForFree:false,hasPart:{"@type":"WebPageElement",isAccessibleForFree:false,cssSelector:".reader-full-article"}};
 return <article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([schema,breadcrumbs]).replace(/</g,"\\u003c")}}/><header data-segment="LEARN-02" className="article-header"><div className="vx-container"><div className="article-width"><Link className="article-back" href="/learn">← Articles</Link><p className="vx-label hero-eyebrow">{SERIES[article.series].label}</p><h1>{article.question}</h1><p className="article-deck">{article.answer}</p><p className="article-meta">By Kaustubh Srivastava · <time dateTime={article.published}>{articleDate(article.published)}</time> · {articleReadTime(article)} min read</p>{video?<div className="mt-8 aspect-video overflow-hidden rounded-xl"><iframe src={video} title={article.question} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div>:null}</div></div></header><div data-segment="LEARN-03" className="vx-container article-body"><div className="article-width"><ArticleSections steps={article.free} />{allowed?<div className="reader-full-article"><div id="continue" tabIndex={-1} style={{scrollMarginTop:"120px"}}/><ArticleSections steps={article.full}/><Comments slug={article.slug}/></div>:<Gate slug={article.slug} googleEnabled={googleEnabled} profile={reader?privateReader(reader):null}/>}{article.sources?.length?<section aria-label="Article sources" className="article-followup"><h2>Sources and further reading</h2><ol>{article.sources.map((source,index)=><li key={source.url} id={`source-${index+1}`}><a href={source.url} rel="noopener noreferrer" className="vx-link">{source.title}</a>{source.note?<p>{source.note}</p>:null}</li>)}</ol></section>:null}<footer className="article-followup"><p>{article.honestLine}</p><div><ButtonLink href={article.next.href} variant="text">{article.next.text}</ButtonLink></div><div><ButtonLink href="/brands" variant="text">Planning a brand campaign?</ButtonLink><ButtonLink href="/organisations" variant="text">For esports</ButtonLink></div></footer></div></div></article>;
}
