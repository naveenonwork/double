// @ts-check
import { join } from "path";
import { createReadStream , readFile, writeFile,readFileSync } from "fs";
import fs from 'fs';
import express from "express";
import serveStatic from "serve-static";
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';
import fileupload from "express-fileupload";
import  fetch    from   "node-fetch" ;
import  FormData  from  "form-data";
import  http  from  "https";
import  path  from  "path"; 
 
 
 
const PORT =  process.env.BACKEND_PORT || 3001;
const MongoPath = "mongodb://localhost";
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


const app = express();
const cwd=process.cwd(); 
// Set up Shopify authentication and webhook handling
app.use(express.json());
app.use(express.urlencoded({ extended: true })) 
 app.use(fileupload({
  useTempFiles: true,
  safeFileNames: true,
  preserveExtension: true,
  tempFileDir: '/tmp/'
}));  
app.use(express.static(STATIC_PATH));
 
app.get("/api/test",   async  (req, res) => {
   
        const result ="test succesfull";
        res.status(200).send(result);
   
});
 

app.post("/static/avatar",   async  (req, res) => {
  const unique_session_id = uuidv4();
  var fileBuffer = req.files.file.data;
  fileBuffer.name = req.files.file.name;
  
  var result="None"; 
  const file = req.files.file;
  var filename= req.files.file.name;
  const size = req.body.size;
  const gender = req.body.gender; 
  const imageType = req.files.file.mimetype.replace('image/', '.')
  
  //const localOrigin= req.body.localOrigin; 
  var filepath =    file.tempFilePath+imageType; 
      //filepath =    cwd+'/public/'+filename; 
  fs.renameSync(file.tempFilePath, filepath)
  //filepath=filepath+filename; 
   //result=filepath;
 var filedata=await fs.createReadStream(filepath);
   /*await file.mv(`${filepath}`, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed", code: 200 });
    } 
  });  */
 
    const url = 'https://hybrik.azurewebsites.net/';
    const sessionId = 'bmF2ZWVudGVzdDEubXlzaG9waWZ5LmNvbS9hZG1pbg';
       //  size = 10;
      //const gender = 'm';
      
    const form = new FormData();
      form.append('session_id', sessionId);
      form.append('size', size);
      form.append('gender', gender);
      form.append('file',  filedata);
     
      var glbfileurl='';
      await fetch(url, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      })
      .then((response) => response.text())
        .then((data) => {
          
         // console.log(data); 
         result=data;
        })
        .catch((error) => {
          //console.error(error);
           
          result=error;
        });   
         
 
      

        res.status(200).send(result);
   
});
app.post("/api/garment",   async  (req, res) => {
     
    var result={} ;
    
     const sessionId = req.body.session;
    const size = req.body.size;
    const productid = req.body.productid; 
    const url = 'https://simple-to-complex.azurewebsites.net' ;
      let garmentData = { 
        "productid": productid ,
        "session": sessionId ,
        "size":size
      }
     ;
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(garmentData),
        headers: {"Content-Type": "application/json"}
      })
     .then((response) =>response.json())
      .then((data) => {
         result=data;
         
        })
      .catch((error) => {
          //console.error(error);
          result=error;
        });       


        
        res.status(200).send(result);
});

 
export async function connectToDatabse(uri) {
  let mongoClient;
  try {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      return mongoClient;
  } catch (error) {
      console.error('Connection to MongoDB Atlas failed!', error);
      process.exit();
  }
}

export async function createSettings(collection,settingDocument) {
 

  await collection.insertOne(settingDocument);
}

export async function findSettingsByShop(collection, shop) {
  return collection.find({ shop }).toArray();
}
export async function deleteSettingsByShop(collection, shop) {
  await collection.deleteMany({ shop });
}
 
app.use("/*", async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});
 

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

