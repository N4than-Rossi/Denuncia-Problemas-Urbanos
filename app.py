from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests
import csv
from mimetypes import guess_type
from werkzeug.utils import secure_filename
from datetime import datetime 
import os

app = Flask(__name__)

OLLAMA_URL=os.getenv("OLLAMA_URL", 'http://localhost:11434' )

UPLOAD_FOLDER='static/assets/problem_images'
app.config['UPLOAD_FOLDER']=UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER,exist_ok=True)

def allowed_file(filename):
    mime_type,_=guess_type(filename)
    if mime_type is None:
        return False
    return mime_type.startswith(('image/','video/'))

@app.context_processor
def inject_defaults():
    return{
        'show_sobre_nos': True
    }

@app.get("/")
def show_home(): 
    return render_template('home.html', show_sobre_nos=False)


@app.get("/index")
def index():
    problemas = []
    atendidas=0
    problemas_nao_atentidos = []
    with open('static/problemas.csv', mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            if row['status']!="Em andamento":
                atendidas+=1
                problemas_nao_atentidos.append(row)
            else:
                problemas.append(row)
    problemas=sorted(problemas, key=lambda x: x['nome'])
    problemas_nao_atentidos=sorted(problemas_nao_atentidos, key=lambda x: x['nome'])
    for problem in problemas_nao_atentidos:
        problemas.append(problem)
    return render_template("index.html", problemas=problemas, solved=atendidas, unesolved=len(problemas)-atendidas)

@app.get("/send")
def show_report_page():
    return render_template('send-report.html')

@app.post("/send")
def send_report():
    id=1
    with open('static/problemas.csv',mode='r',encoding='utf-8') as file:
        reader=list(csv.reader(file))
        if len(reader)>1:
            last_row=reader[-1]
            if last_row:
                id+=int(last_row[0])

    if 'foto' not in request.files:
        return redirect(url_for('show_report_page'))
    file=request.files["foto"]
    if file.filename=='' or not allowed_file(file.filename):
        return redirect(url_for("show_report_page"))
    filename=secure_filename(file.filename)
    timestamp=datetime.now().strftime("%Y%m%d_%H%M%S_")
    filename=timestamp+filename
    file.save(os.path.join(app.config['UPLOAD_FOLDER'],filename))
    img_url=url_for('static',filename='assets/problem_images/'+filename)
    
    description=request.form.get("descricao")
    url=f"{OLLAMA_URL}/api/generate"
    data={
        "model": "llama3.2:1b",
        "prompt": (
       "Com base na descrição abaixo gere um titulo direto e simples usando um máximo de 5 palavaras, apenas um título que resuma tudo e seja curto."
       "NÃO EXPLIQUE, NÃO COMENTE, NÃO ESCREVA NADA ALÉM DO TÍTULO, quero que responda com o título e apenas ele, nem se quer um confirmação deve ser entregue na resposta."
       "Retorne um título independente de qual for a descrição."
       "Não utilize pontuação como ponto final."
       f"Descrição: {description}"
        ),
        "stream": False
    }
    try:
        response=requests.post(url,json=data)
        response.raise_for_status()
        response_data=response.json()
        if "response" in response_data:
            name=response.json()["response"].strip()
            print("titulo gerado automaticamente:",name)
        else:
            print("Resposta inesperada do ollama:",response_data)
            name=' '.join(description.split()[:3])
    except requests.exceptions.RequestException as e:
        print("erro ao conectar com Ollama:",e)
        name=' '.join(description.split()[:3])
    except (KeyError,ValueError) as e:
        print("erro ao processar resposta do Ollama:",e)
        name=' '.join(description.split()[:3])
    adress=request.form.get("address")
    lat=request.form.get('latitude')
    lon=request.form.get('longitude')
    problem_type=request.form.get("type")
    cpf=request.form.get("cpf")
    new_report=[
        id,
        name,
        img_url,
        "Em andamento",
        problem_type,
        adress,
        lat,
        lon,
        description,
        cpf
    ]
    with open("static/problemas.csv", mode='a',encoding='utf-8',newline="") as problems:
        writer=csv.writer(problems)
        writer.writerow(new_report)
    return redirect(url_for('index'))

@app.route('/api/nomination',methods=['GET'])
def nomination():
    address=request.args.get('address')

    if not address:
        return jsonify({'error': "Endereço não fornecido"}), 400
    try:
        url="https://nominatim.openstreetmap.org/search"
        response=requests.get(
            url,
            params={
                'q':address,
                'format':'json',
                'limit': 1,
                'countrycodes':'br'
            },
            headers={
            'User-Agent': "UrbanWeb/1.0 (https://github.com/N4than-Rossi/Denuncia-Problemas-Urbanos/tree/main)",
            'accept-language': "pt-BR"             
            },
            timeout=(5,10)
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as error:
        return jsonify({'error': str(error)}),500

@app.get("/acesso")
def show_acess():
    return render_template('acesso.html')

@app.get("/login-cidadao")
def show_login_citizen():
    return render_template('login_cidadao.html')

@app.post("/login-cidadao")
def process_login_citizen():
    return redirect(url_for('index'))

@app.get("/login-prefeitura")
def show_login_city_hall():
    return render_template('login_prefeitura.html')

@app.post("/login-prefeitura")
def process_login_city_hall():
    return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')