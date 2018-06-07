import solver
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)

CORS(app)

@app.route("/", methods=['POST'])
def solve():
    app.logger.debug('Solve called')
    app.logger.debug(request.get_json())
    data_request = request.get_json()
    solution = solver.solve(data_request['data_form'], data_request['time_limit'])
    return jsonify(solution)

if __name__ == "__main__":
    app.run(debug = True)