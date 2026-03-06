import { transition as mountMenu, unmount as unmountMenu } from "./scripts/menu.js"
import { transition as mountAddCard, unmount as unmountAddCard } from "./scripts/addCard.js"
import QrCodeLib from "./libs/qrcode.js"
export const QrCode=QrCodeLib

export const outlet=document.getElementById("main-outlet")

export function mount(scene){
  switch(scene){
    case "add-card":
      document.startViewTransition(()=>{
        unmountMenu()
        mountAddCard()
      })
      break
    case "menu":
      document.startViewTransition(()=>{
        unmountAddCard()
        mountMenu()
      })
    default:
      break
  }
}

const unmount=(scene)=>{
  switch(scene){
    case "add-card":
      unmountAddCard()
      break
    case "menu":
      unmountMenu()
    default:
      break
  }
}

mount("menu")
