let button_selected;
let type_selected;

function typeButtonAction(button,text,other_text, type){
    //função que ocorre quando um dos botões de tipo é clicado
    const label=document.querySelector(`label[for='${button.id}']`);
    if(button_selected){
        const prevlabel=document.querySelector(`label[for='${button_selected.id}']`);
        //muda para o estilo padrão
        if(prevlabel){
        if(type_selected==="Urbano"){
            prevlabel.style.backgroundColor="#BECCC3";
            prevlabel.style.boxShadow="0px 2px 4px 0px #00000040";
        }else{
            prevlabel.style.backgroundColor="#F6E05E";
            prevlabel.style.boxShadow="0px 2px 4px 0px #00000040";
        }
    }
}
button_selected=button;
type_selected=type;

//muda para o estilo selecionado 
          if(type_selected==="Urbano"){
            label.style.backgroundColor="#9CB0A5";
            label.style.boxShadow="0px 4px 8px 2px #00000040";
        }else{
            label.style.backgroundColor="#D9C53C";
            label.style.boxShadow="0px 4px 8px 2px #00000040";
        }

if(button_selected.value.includes("Outros")) text.style.display='block';
else text.style.display='none';
other_text.style.display='none';
}

function validateCpf(cpf){
    let isPossible=false;
    let previous_number="X";
    for (let i of cpf){
        if(i>='0' && i<='9'){
            if(previous_number==='X'){
                previous_number=i;
                continue;
            }
            if(previous_number!==i){
                isPossible=true;
                break;
            }
        }
    }
    if(!isPossible) return false;
    let check1=parseInt(cpf[0])*10+parseInt(cpf[1])*9+parseInt(cpf[2])*8+parseInt(cpf[4])*7+parseInt(cpf[5])*6+parseInt(cpf[6])*5+parseInt(cpf[8])*4+parseInt(cpf[9])*3+parseInt(cpf[10])*2;
    check1%=11;
    if(check1<2) check1=0;
    else check1=11-check1;
      let check2=parseInt(cpf[0])*11+parseInt(cpf[1])*10+parseInt(cpf[2])*9+parseInt(cpf[4])*8+parseInt(cpf[5])*7+parseInt(cpf[6])*6+parseInt(cpf[8])*5+parseInt(cpf[9])*4+parseInt(cpf[10])*3+check1*2;
    check2%=11;
    if(check2<2) check2=0;
    else check2=11-check2;
if(parseInt(cpf[12])===check1 && parseInt(cpf[13])===check2) return true;
else return false;
}

const form=document.getElementById('report-form');
const location_button=document.getElementById('actual-location');
const address=document.getElementById('address');
const latInput=document.getElementById('latitude');
const lonInput=document.getElementById('longitude');
const addressAlert=document.getElementById('address-alert');
let using_actual_location=false;
let currentAddress="";
async function convertCoordinates(){
    //Função que converte o adress em latitude e longitude
    console.log("iniciando conversão...");   
    if(address.value.trim() && (!currentAddress || currentAddress!==address.value)){
    try{
  const response= await fetch(
    `/api/nomination?address=${encodeURIComponent(address.value)}`
  );
  const data= await response.json();
  if(!data || data.length===0){
    addressAlert.style.display='block';
    return;
  }

if(!data[0].lat || !data[0].lon){
    addressAlert.style.display='block';
    return
}

  latInput.value=data[0].lat;
  lonInput.value=data[0].lon;
  addressAlert.style.display='none';
  currentAddress=address.value;
  console.log("coordenadas encontradas com sucesso!");
  console.log("lat:",latInput.value,"lon:",lonInput.value);
    } catch(error){
     addressAlert.style.display='block';
     console.log("Erro em encontrar as coordenadas:");
     console.log("Erro:",error);
    }
}else console.log(Boolean(address.value.trim()),Boolean(!currentAddress || currentAddress!==address.value));
}

location_button.addEventListener('click', async ()=>{
    //lógica de encontrar localização atual
    if(!navigator.geolocation){
        alert("Seu navegador não suporta geolocalização");
        return;
    }

    location_button.textContent="Obtendo localização...";
    location_button.disabled=true;

    const nomination_url="https://nominatim.openstreetmap.org/reverse?";

    const options={
        enableHighAccuracy: true,   
        timeout: 20000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
     async (position) => {
     const lat=position.coords.latitude;
     const lon=position.coords.longitude;
     try{
       const response= await fetch(
            nomination_url+`lat=${lat}&lon=${lon}&format=json`,
        );
        const data= await response.json();
       const addressParts=data.address;
       let parts=[];
        if(addressParts.road){
            if(addressParts.house_number) parts.push(addressParts.road+', '+addressParts.house_number);
            else parts.push(addressParts.road);
        }
        if(addressParts.neighbourhood ) parts.push(addressParts.neighbourhood);
        else if(addressParts.suburb) parts.push(addressParts.suburb);
        else if (addressParts.quarter) parts.push(addressParts.quarter);
        if(addressParts.city) parts.push(addressParts.city);
        else if(addressParts.town) parts.push(addressParts.town);
        else if(addressParts.village) parts.push(addressParts.village);
        else if(addressParts.municipality) parts.push(addressParts.municipality);
        if(addressParts.state) parts.push(addressParts.state);
        if(addressParts.postcode) parts.push(addressParts.postcode);

        let fullAddress=parts.join(', ');

        if(!fullAddress || fullAddress.trim()==='') fullAddress=data.display_name;
     address.value=fullAddress;
    currentAddress=fullAddress;
     latInput.value=lat;
     lonInput.value=lon;
     using_actual_location=true;
    addressAlert.style.display='none';
     location_button.textContent="Usar localização atual";
     location_button.disabled=false;
     console.log("Local encontrado com sucesso!");
     console.log('lat:',lat,"lon:",lon);
     console.log("imprecisão de um raio de",position.coords.accuracy,'metros');
     }
     catch(error){
        console.log("erro na geolocalização:", error);
        console.log('lat:',lat,"lon:",lon);
        alert("Não foi possível obter o endereço, Digite manualmente ou tente novamente mais tarde");
        location_button.textContent="Usar localização atual";
        location_button.disabled=false;
        latInput.value=lat;
        lonInput.value=lon;
     }
     },
     async(error)=>{
        let errorMessage;
        switch(error.code){
            case error.PERMISSION_DENIED:
                errorMessage="Localização atual não permitida";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage="Localização indisponível no momento";
                break;  
            case error.TIMEOUT:
                errorMessage="Tempo limite esgotado. Tente novamente";
                break;
            default:
                errorMessage="Erro desconhecido ao obter localização. Tente novamente";
        }
        alert(errorMessage);
        location_button.textContent = 'Usar localização atual';
        location_button.disabled = false;
     },
     options
    );
});

address.addEventListener('focus',()=>addressAlert.style.display='none');

let debounceTimer;
address.addEventListener('blur',()=>{
    clearTimeout(debounceTimer);
    debounceTimer=setTimeout(convertCoordinates,500);
});

//Verificação de tipo do problema
const urban_buttons=document.querySelectorAll('input[name="tipo-urbano"]');
const school_buttons=document.querySelectorAll('input[name="tipo-escolar"]');
const urban_specify=document.getElementById('urban-specify');
const school_specify=document.getElementById('school-specify');
for(let button of urban_buttons)
    button.addEventListener('click', ()=>typeButtonAction(button, urban_specify, school_specify, "Urbano"));
for(let button of school_buttons)
    button.addEventListener('click', ()=>typeButtonAction(button, school_specify, urban_specify, "Escolar"));



const cpf=document.getElementById('cpf');
const cpfAlert=document.getElementById('cpf-alert');
cpf.addEventListener('input',()=>{
    //completa cpf na escrita e verifica se está correto matemáticamente
let value=cpf.value.replace(/\D/g, '');
if(value.length>11) value=value.slice(0,11);
if(value.length>9) value=value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/,"$1.$2.$3-$4");
else if(value.length>6) value=value.replace(/^(\d{3})(\d{3})(\d{0,3})$/,"$1.$2.$3");
else if(value.length>3) value=value.replace(/^(\d{3})(\d{0,3})$/,"$1.$2");

if(value.length==14){
    let isValid=validateCpf(value);
    if(!isValid) cpfAlert.style.display='block';
    else cpfAlert.style.display='none';
}else cpfAlert.style.display='none';
cpf.value=value;
}
);

cpf.addEventListener('blur',()=>{
let value=cpf.value;
if(value.length && (value.length!==14 || !validateCpf(value)))
    cpfAlert.style.display='block';
});

const cpfButton=document.getElementById('checkbox');
let isAnonymous=false;
cpfButton.addEventListener('click',()=>{
    if(isAnonymous){
        //estilo normal (botão e campo de inserir cpf)
        cpf.style.backgroundColor='#D9D9D9';
        cpf.style.color='black';
        isAnonymous=false;
        cpf.disabled=false;
        if(cpf.value.length>0 && (cpf.value.length!==14 || !validateCpf(cpf.value)))
            cpfAlert.style.display='block';
    }
    else{
        //estilo quando está selecionado (botão e campo de inserir cpf)
     cpf.style.backgroundColor='#f5f5f5';
     cpf.style.color='#999'
     isAnonymous=true;
     cpf.disabled=true;
     cpfAlert.style.display='none';
    }
});

//submissão do form
const  submitButton=document.getElementById("submit-denuncia");
const reportType=document.getElementById('type');
form.addEventListener('submit', async (event)=>{
    submitButton.textContent="Enviando...";
    submitButton.disabled=true;
    if(!address.value && !using_actual_location){
        event.preventDefault();
        submitButton.textContent="ENVIAR DENÚNCIA";
        submitButton.disabled=true;
        addressAlert.style.display='block';
        return;
    }
  await convertCoordinates();
  if(!type_selected)
        reportType.value="Urbano"+":  ";
    else 
        reportType.value=type_selected+":  "
    if(!button_selected)
        reportType.value+='Outros';
    else if(button_selected.value==="Outros"){
        if(button_selected===urban_buttons[urban_buttons.length-1] && urban_specify.value.length)
            reportType.value+=urban_specify.value;
        else if(button_selected===school_buttons[school_buttons.length-1] && school_specify.value.length)
            reportType.value+=school_specify.value;
        else
            reportType.value+="Outros";
    }
    else 
        reportType.value+=button_selected.value;
        
    if(isAnonymous || !cpf.value.length){ 
        cpf.disabled=false;
        cpf.value="anonymous";  
    }
    else if(cpf.value.length<14 || !validateCpf(cpf.value)){
        event.preventDefault();
        submitButton.textContent="ENVIAR DENÚNCIA";
        submitButton.disabled=true;
        cpfAlert.style.display='block';
    }
}
);    