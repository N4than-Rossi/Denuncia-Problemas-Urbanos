from flask import Flask, render_template, redirect, url_for, request;
import csv

app = Flask(__name__)

@app.get("/")
def index():
    problemas = []
    with open('problemas.csv', mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            problemas.append(row)
    return render_template("index.html", problemas=problemas)

if __name__ == "__main__":
    app.run(debug=True)