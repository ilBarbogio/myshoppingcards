const DB_NAME="mycards-elefantino"
const DB_VERSION=1
const DB_STORE_NAME="mycards"

let db

export function open(){
  return new Promise((res,rej)=>{
    const req=window.indexedDB.open(DB_NAME,DB_VERSION)
    req.onerror=ev=>{
      console.log(ev)
      res(undefined)
    }
    req.onsuccess=ev=>{
      res(ev.target.result)
    }
    req.onupgradeneeded = ev => {
      const db = ev.target.result
      const objectStore = db.createObjectStore(DB_STORE_NAME,
        { keyPath: "id", autoIncrement: true }
      )
      objectStore.transaction.oncomplete = event=>{
        res(db)
      }
    }
  })
}

export async function getAllCards(data){
  if(!db) db=await open()
  if(db) return new Promise((res,rej)=>{
    const req=db.transaction([DB_STORE_NAME])
    .objectStore(DB_STORE_NAME)
    .getAll(data)
    req.addEventListener("success",ev=>{
      res(ev.target.result)
    })
    req.addEventListener("error",ev=>{
      console.log(ev)
      res(undefined)
    })
  })
  else return undefined
}

export async function saveCard(data){
  if(!db) db=await open()
  if(db) return new Promise((res,rej)=>{
    const req=db.transaction([DB_STORE_NAME],"readwrite")
    .objectStore(DB_STORE_NAME)
    .add(data)
    req.addEventListener("success",ev=>{
      res(ev.target.result)
    })
    req.addEventListener("error",ev=>{
      console.log(ev)
      res(undefined)
    })
  })
  else return undefined
}

export async function removeCard(id){
  if(!db) db=await open()
  if(db) return new Promise((res,rej)=>{
    const req=db.transaction([DB_STORE_NAME],"readwrite")
    .objectStore(DB_STORE_NAME)
    .delete(id)
    req.addEventListener("success",ev=>{
      res(true)
    })
    req.addEventListener("error",ev=>{
      console.log(ev)
      res(false)
    })
  })
  else return undefined
}

