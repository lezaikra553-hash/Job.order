const {google} = require('googleapis');

function auth(){
  const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if(!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON belum diisi');
  const credentials=JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes:['https://www.googleapis.com/auth/drive']
  });
}
function drive(){return google.drive({version:'v3',auth:auth()})}
const ROOT=()=>process.env.GOOGLE_DRIVE_FOLDER_ID;

async function findFile(name,parent,mimeType){
  const q=[`name = '${name.replace(/'/g,"\\'")}'`,`'${parent}' in parents`,'trashed = false',mimeType?`mimeType = '${mimeType}'`:null].filter(Boolean).join(' and ');
  const r=await drive().files.list({q,fields:'files(id,name,mimeType,modifiedTime,webViewLink)',pageSize:10});
  return r.data.files?.[0];
}
async function ensureFolder(name,parent){
  const found=await findFile(name,parent,'application/vnd.google-apps.folder');
  if(found)return found;
  const r=await drive().files.create({requestBody:{name,mimeType:'application/vnd.google-apps.folder',parents:[parent]},fields:'id,name'});
  return r.data;
}
async function ensurePath(parts){
  let parent=ROOT();
  if(!parent)throw new Error('GOOGLE_DRIVE_FOLDER_ID belum diisi');
  for(const p of parts) parent=(await ensureFolder(p,parent)).id;
  return parent;
}
async function getJson(fileId){
  const r=await drive().files.get({fileId,alt:'media'});
  return r.data;
}
module.exports=async(req,res)=>{
  try{
    if(req.method!=='GET' && req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
    const action=req.query.action||'load';
    if(action==='load'){
      const dbFolder=await ensurePath(['PRODUKSI - JO','database']);
      const f=await findFile('jo-index.json',dbFolder);
      if(!f)return res.status(200).json({data:null});
      const data=await getJson(f.id);
      return res.status(200).json({data});
    }
    if(action==='save'){
      if(req.method!=='POST')return res.status(405).json({error:'POST required'});
      const dbFolder=await ensurePath(['PRODUKSI - JO','database']);
      const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
      const f=await findFile('jo-index.json',dbFolder);
      const media={mimeType:'application/json',body:JSON.stringify(body,null,2)};
      let r;
      if(f) r=await drive().files.update({fileId:f.id,media,fields:'id,name,modifiedTime'});
      else r=await drive().files.create({requestBody:{name:'jo-index.json',parents:[dbFolder]},media,fields:'id,name,modifiedTime'});
      return res.status(200).json({ok:true,file:r.data});
    }
    if(action==='health'){
      const folder=await ensurePath(['PRODUKSI - JO']);
      return res.status(200).json({ok:true,folderId:folder});
    }
    return res.status(400).json({error:'Unknown action'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:e.message||'Drive error'});
  }
};