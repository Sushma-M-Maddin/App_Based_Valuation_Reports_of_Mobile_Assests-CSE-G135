
from flask import Flask, request, jsonify
import os
import pickle
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load pipeline and df (replace with your actual file paths)
base_dir = os.path.dirname(os.path.abspath(__file__))
pipe_path = os.path.join(base_dir, 'models', 'pipe.pkl')
df_path = os.path.join(base_dir, 'models', 'df.pkl')

# Load the pipeline and df
try:
    pipe = pickle.load(open(pipe_path, 'rb'))  # Load your pipeline
    df = pickle.load(open(df_path, 'rb'))  # Load your dataframe or feature info
except Exception as e:
    raise RuntimeError(f"Failed to load model or pipeline: {str(e)}")

# Define the USD to INR conversion rate (you can update this dynamically by fetching live rates)
USD_TO_INR = 83  # Example rate; you can update this dynamically by fetching from an API

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Laptop Price Prediction API"

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return '', 204

@app.route('/predict-laptop', methods=['POST'])
def predict_laptop():
    try:
        data = request.get_json()
        print("Received data:", data)

        # Map frontend keys to backend expected keys
        input_data = {
            'company': data.get("company"),
            'type_name': data.get("type_name"),
            'ram': data.get("ram"),
            'weight': data.get("weight"),
            'touchscreen': data.get("touchscreen"),
            'lps': data.get("lps"),
            'ppi': data.get("ppi"),
            'cpu_brand': data.get("cpu_brand"),
            'hdd': data.get("hdd"),
            'ssd': data.get("ssd"),
            'gpu': data.get("gpu"),
            'os': data.get("os")
        }

        # Map input data to the model's expected column names
        mapped_data = {
            'Company': input_data['company'],
            'TypeName': input_data['type_name'],
            'Ram': input_data['ram'],
            'Weight': input_data['weight'],
            'Touchscreen': input_data['touchscreen'],
            'Ips': input_data['lps'],  # Assuming 'lps' is meant to be 'Ips'
            'ppi': input_data['ppi'],  # Ensure 'ppi' is lowercase
            'Cpu brand': input_data['cpu_brand'],
            'HDD': input_data['hdd'],
            'SSD': input_data['ssd'],
            'Gpu brand': input_data['gpu'],
            'os': input_data['os']  # Ensure correct column name for OS
        }

        # Prepare the input data as a DataFrame for prediction
        input_df = pd.DataFrame([mapped_data])

        # Check if all columns are present in the input dataframe
        print("Input DataFrame columns:", input_df.columns)

        # Predict the price using the pipeline
        predicted_price_usd = pipe.predict(input_df)[0]  # Get the predicted price in USD
        print(f"Predicted price (USD): {predicted_price_usd}")

        # Convert the predicted price to INR
        predicted_price_inr = predicted_price_usd * USD_TO_INR
        print(f"Predicted price (INR): {predicted_price_inr}")

        # Return the result in INR
        return jsonify({'predicted_price': predicted_price_usd, 'predicted_price_inr': predicted_price_inr})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

