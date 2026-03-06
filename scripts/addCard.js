import { outlet, mount, QrCode } from "../index.js"
import { saveCard } from "./store.js"

const data={
  title:undefined,
  subtitle: undefined,
  backgroundColor:"#ff0000",
  foregroundColor:"#ffa500",
  textColor:"#ffffff",
  value:undefined,
  type:undefined
}

export function transition(){
  outlet.innerHTML=""
  const template=document.getElementById("add-card-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("add-card")
  outlet.classList.remove("menu")

  setupListeners()
  setupCard()
}

const setupListeners=()=>{
  let card=outlet.querySelector(".preview-card")
  outlet.querySelector(".open-camera").addEventListener("click",setupSnap)
  outlet.querySelector(".cancel-add-card").addEventListener("click",()=>{
    mount("menu")
  })
  outlet.querySelector("button.flip").addEventListener("click",()=>{
    if(!card.classList.contains("flip")) card.classList.add("flip")

  })
  card.addEventListener("animationend",(ev)=>{
    if(ev.animationName=="flip-card"){
      card.classList.remove("flip")
      card.classList.add("unflip")
      let front=card.querySelector(".front-content")
      let back=card.querySelector(".back-content")
      if(back.classList.contains("hidden")){
        front.classList.add("hidden")
        back.classList.remove("hidden")
      }else{
        front.classList.remove("hidden")
        back.classList.add("hidden")
      }
    }
    if(ev.animationName=="unflip-card"){
      card.classList.remove("unflip")
    }
  })

  outlet.querySelector("input[name=card-background]").value=data.backgroundColor
  outlet.querySelector("input[name=card-background]").addEventListener("input",(ev)=>{
    outlet.style.setProperty("--card-background-color",ev.target.value)
    data.backgroundColor=ev.target.value
  })
  outlet.querySelector("input[name=card-foreground]").value=data.foregroundColor
  outlet.querySelector("input[name=card-foreground]").addEventListener("input",(ev)=>{
    outlet.style.setProperty("--card-foreground-color",ev.target.value)
    data.foregroundColor=ev.target.value
  })
  outlet.querySelector("input[name=card-text]").value=data.textColor
  outlet.querySelector("input[name=card-text]").addEventListener("input",(ev)=>{
    outlet.style.setProperty("--card-text-color",ev.target.value)
    data.textColor=ev.target.value
  })
}

//#region data
const setupCard=()=>{

  const form=outlet.querySelector("form")
  form.addEventListener("submit",collectData)

  console.log(data)
}

const collectData=async (ev)=>{
  ev.preventDefault()
  const formData=new FormData(ev.target)
  data.title=formData.get("title")
  data.subtitle=formData.get("subtitle")
  data.backgroundColor=formData.get("card-background")
  data.foregroundColor=formData.get("card-foreground")
  data.textColor=formData.get("card-text")
  data.title=formData.get("title")
  data.title=formData.get("title")
  if(data.value && data.format && data.title){
    const res=await saveCard(data)
    if(res) mount("menu")
    else alert("Problemi nel salvataggio")
  }
}

//#endregion


//#region snap
function setupSnap(){
  doSnap()
}

const doSnap=()=>{
  const cameraInput=document.createElement("input")
  cameraInput.classList.add("hidden")
  cameraInput.setAttribute("type","file")
  cameraInput.setAttribute("accept","image/*")
  cameraInput.setAttribute("capture","user")
  outlet.append(cameraInput)

  cameraInput.addEventListener("input",(ev)=>{
    outlet.classList.add("snap")
    outlet.classList.remove("card")

    cameraInput.remove()

    if(ev.target.files?.length>0){
      const url=URL.createObjectURL(ev.target.files[0])
      
      const img=document.createElement("img")
      img.classList.add("hidden")
      img.addEventListener("load",async ()=>{
        const result=await detect(img)
        
        let format=result.format
        let value=result.rawValue.toString()
        if(result.format=="upc_a" && value.length==12){
          value="0"+value
          format="ean_13"
        }
        data.value=value
        data.format=format

        URL.revokeObjectURL(url)
        img.remove()

        drawBarcode(result.format,value)
      })
      outlet.append(img)
      img.src=url
    }
  })

  cameraInput.click()
}


const detect=async (img)=>{
  if("BarcodeDetector" in globalThis){
    return new Promise(async (res,rej)=>{
      // const formats=await BarcodeDetector.getSupportedFormats()
      // console.log(formats)
      const barcodeDetector = new BarcodeDetector({ formats:["ean_13","upc_a","qr_code"] })

      barcodeDetector.detect(img)
      .then(barcodes => {
        console.log(barcodes)
        res(barcodes[0])
      })
      .catch((err) => {
        console.log(err)
        rej()
      })
    })
    
  }else{
    console.log("No luck, Chuck")
    return undefined
  }
}

const drawBarcode=(format,value)=>{
  switch(format){
    case "upc_a":
    case "ean_13":
      JsBarcode(".card-back", value, {format: "EAN13"})
      break
    case "qr_code":
      const matrix = QrCode.generate(value)
      const svgContent = QrCode.render('svg', matrix)
      document.querySelector('svg.card-back').innerHTML = svgContent
      break
    default: break
  }
}
//#endregion




export function unmount(){
  outlet.classList.remove("add-card")
  outlet.innerHTML=""

  const form=outlet.querySelector("form")
  if(form) form.removeEventListener("submit",collectData)
}