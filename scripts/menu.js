import { outlet, mount, QrCode } from "../index.js"
import { getAllCards, removeCard } from "./store.js"


export function transition(){
  console.log(outlet)
  outlet.innerHTML=""
  const template=document.getElementById("menu-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("menu")
  outlet.classList.remove("add-card")
 
  outlet.querySelector("button.add-new-card").addEventListener("click",()=>{
    mount("add-card")
  })
  setupMenu()
}

async function setupMenu(){
  const cards=await getAllCards()
  outlet.querySelector(".card-container").innerHTML=""
  console.log(cards)
  for(let c of cards) createCard(c)
}

function createCard(c){
  const card=document.createElement("div")
  card.id=`card-${c.id}`
  card.classList.add("card")
  const template=document.getElementById("menu-card-template")
  const clone=template.content.cloneNode(true)
  card.append(clone)

  if(c.imgData){
    const canvas=card.querySelector("div.back > canvas")
    const ctx=canvas.getContext("2d")
    ctx.putImageData(c.imgData,0,0)
  }
  const front=card.querySelector(".front")
  
  front.innerHTML=c.title
  front.style.setProperty("background-color",c.backgroundColor)
  front.style.setProperty("foreround-color",c.foregroundColor)
  front.style.setProperty("text-color",c.textColor)
  card.append(front)

  const backSvg=card.querySelector(".back svg")
  backSvg.id=`svg-${c.id}`

  card.addEventListener("animationend",(ev)=>{
    if(ev.animationName=="shrink-card") ev.target.classList.remove("shrink")
  })
  card.addEventListener("click",(ev)=>{
    if(!ev.target.classList.contains("grow")){
      ev.target.classList.add("grow")
      ev.target.classList.remove("shrink")
      if(backSvg){
        drawBarcode(`#${backSvg.id}`,c.format,c.value)
      }
    }else if(!ev.target.classList.contains("shrink")){
      ev.target.classList.add("shrink")
      ev.target.classList.remove("grow")
    }
  })
  card.querySelector("button.delete-card").addEventListener("click",async (ev)=>{
    if(card.classList.contains("grow")){
      ev.stopPropagation()
      if(confirm("Rimuovere questa carta?")){
        await removeCard(c.id)
        setupMenu()
      }
    }
  })

  outlet.querySelector(".card-container").append(card)
}

const drawBarcode=(svgQuery,format,value)=>{
  switch(format){
    case "upc_a":
    case "ean_13":
      JsBarcode(svgQuery, value, {format: "EAN13"})
      break
    case "qr_code":
      const matrix = QrCode.generate(value)
      const svgContent = QrCode.render('svg', matrix)
      document.querySelector(svgQuery).innerHTML = svgContent
      break
    default: break
  }
}

export function unmount(){
  outlet.classList.remove("menu")
  outlet.innerHTML=""
}