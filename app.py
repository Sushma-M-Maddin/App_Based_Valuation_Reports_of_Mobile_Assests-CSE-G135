
from flask import Flask, request, jsonify
import os
import pandas as pd
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'models', 'LinearRegressionModel.pkl')

try:
    model = pickle.load(open(model_path, 'rb'))
except Exception as e:
    raise RuntimeError(f"Failed to load model: {str(e)}")

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Car Price Prediction API"

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return '', 204

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)
        car_name = data['name'].strip()  # Trim spaces
        company = data['company'].strip()  # Trim spaces
        year = int(data['year'])
        kilometers_driven = int(data['kms_driven'])
        fuel_type = data['fuel_type'].strip()  # Trim spaces

        # Create the DataFrame with correct column names
        features_df = pd.DataFrame(
            columns=['name', 'company', 'year', 'kms_driven', 'fuel_type'],
            data=[[car_name, company, year, kilometers_driven, fuel_type]]
        )

        # Predict
        predicted_price = model.predict(features_df)
        return jsonify({'predicted_price': predicted_price[0]})
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
###########################################################################
