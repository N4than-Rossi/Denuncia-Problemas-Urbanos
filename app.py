from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests
import csv
from mimetypes import guess_type
from werkzeug.utils import secure_filename
from datetime import datetime 
import os

app = Flask(__name__)

UPLOAD_FOLDER='static/assets/problem_images'
app.config['UPLOAD_FOLDER']=UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER,exist_ok=True)

def allowed_file(filename):
    mime_type,_=guess_type(filename)
    if mime_type is None:
        return False
    return mime_type.startswith(('image/','video/'))


@app.get("/")
def index():
    problemas = []
    with open('problemas.csv', mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            problemas.append(row)
    return render_template("index.html", problemas=problemas)

@app.get("/send")
def show_report_page():
    return render_template('send-report.html')

@app.post("/send")
def send_report():
    id=1
    with open('problemas.csv',mode='r',encoding='utf-8') as file:
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

    name=request.form.get("report-type")
    adress=request.form.get("address")
    lat=request.form.get('latitude')
    lon=request.form.get('longitude')
    type=request.form.get("type")
    description=request.form.get("problem")
    cpf=request.form.get("cpf")
    new_report=[
        id,
        name,
        img_url,
        "Em andamento",
        type,
        adress,
        lat,
        lon,
        description,
        cpf
    ]
    with open("problemas.csv", mode='a',encoding='utf-8',newline="") as problems:
        writer=csv.writer(problems)
        writer.writerow(new_report)
    return redirect(url_for('index'))

@app.route('/api/nomination',methods=['GET'])
def nomination():
    address=request.args.get('address')

    if not address:
        return jsonify({'error:': "Endereço não fornecido"}), 400
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

if __name__ == "__main__":
    app.run(debug=True)