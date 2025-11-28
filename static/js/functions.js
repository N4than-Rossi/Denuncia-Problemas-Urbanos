function parseCSVLine(line){
   // Lê uma linha CSV e retorna um array de valores
    let result=[];
    let current='';
    let quote=false;
    let escape=false;

    for(const c of line){
        if(c==='"'){
            quote=!quote;
            if(escape){
                current+='"';
                escape=false;
            }else{
                escape=true;
            }
        }else if(c===',' && !quote){
            result.push(current);
            current='';
        }else{
            current+=c;
        }
    }
    result.push(current);
    return result;
}

function readCsv(csvUrl){
//Lê um arquivo CSV e retorna um array de objetos

return fetch(csvUrl)
    .then(response=> response.text())
    .then(csv=>{
    const lines=csv.trim().split('\n');
    const header=parseCSVLine(lines[0]);
    let ans=[];
    for(let i=1;i<lines.length;i++){
        const parts=parseCSVLine(lines[i]);
        ans.push({});
        for(let j=0;j<header.length;j++){
            ans[i-1][header[j]]=parts[j];
        }
    }
    return ans;
    }).catch(error=>{
    console.log("erro ao carregar csv:",error);
     return null;
    }
); 
}
