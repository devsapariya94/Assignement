from flask import Flask, jsonify, request
import csv
import flask_cors
from collections import defaultdict

import os
import dotenv


dotenv.load_dotenv()


from langchain_experimental.agents.agent_toolkits import create_csv_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts.prompt import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI


agent = create_csv_agent(
    ChatGoogleGenerativeAI(google_api_key=os.getenv("GEMINI_API_KEY"), model="gemini-pro"),

    "salaries.csv",
)

llm = GoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"), model="gemini-pro"
)

app = Flask(__name__)
flask_cors.CORS(app)

def load_data():
    data = []
    with open('salaries.csv', 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            data.append(row)
    return data[1:]

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/get_data')
def get_data():
    data = load_data()
    return jsonify(data)

@app.route('/get_aggregated_data')
def get_aggregated_data():
    data = load_data()
    year_map = defaultdict(lambda: {'total_jobs': 0, 'total_salary': 0, 'jobs': defaultdict(int)})

    for row in data:
        year = row[0]
        salary = int(row[6])
        job_title = row[3]

        year_map[year]['total_jobs'] += 1
        year_map[year]['total_salary'] += salary
        year_map[year]['jobs'][job_title] += 1

    aggregated_data = []
    for year, values in year_map.items():
        aggregated_data.append({
            'year': year,
            'total_jobs': values['total_jobs'],
            'average_salary': values['total_salary'] / values['total_jobs'],
            'jobs': values['jobs']
        })

    return jsonify(aggregated_data)

@app.route('/get_jobs_by_year/<int:year>')
def get_jobs_by_year(year):
    data = load_data()
    jobs = defaultdict(lambda: {'count': 0, 'total_salary': 0})

    for row in data:
        if int(row[0]) == year:
            job_title = row[3]
            salary = float(row[6])  
            jobs[job_title]['count'] += 1
            jobs[job_title]['total_salary'] += salary

    job_data = [{'job_title': job, 'count': data['count'], 'avg_salary': data['total_salary'] / data['count']} for job, data in jobs.items()]
    return jsonify(job_data)

@app.route('/ai', methods=['POST'])
def ai():
    query = request.json['message']
    history = request.json['history']['sortHitsory']

    template = f'''
        give the human like answer.
                
        History: {history}

        question: {query}
    '''
    res = agent.run(template)

  
    print(res)
    return jsonify(res)


if __name__ == '__main__':
    app.run(debug=True)
