# CreditLens - Credit Risk Prediction System

CreditLens is a FastAPI-based machine learning web app that predicts credit default risk from an applicant's financial and loan profile. It serves a responsive frontend from the same FastAPI application and exposes a `/predict` API endpoint for model inference.

## Features

- Credit risk prediction using a trained scikit-learn model
- FastAPI backend with automatic API docs
- Responsive HTML, CSS, and JavaScript frontend
- Probability score, risk label, and decision threshold display
- Ready-to-deploy Render configuration

## Tech Stack

- Python 3.11
- FastAPI
- scikit-learn
- XGBoost
- pandas
- joblib
- HTML, CSS, JavaScript

## Project Structure

```text
Credit_Risk_ML_System/
├── main.py
├── credit_risk_model.pkl
├── best_threshold.pkl
├── credit_risk_dataset.csv
├── Credit_Risk.ipynb
├── requirements.txt
├── render.yaml
├── README.md
└── static/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Model Files

The application expects these files in the project root:

- `credit_risk_model.pkl` - trained model pipeline
- `best_threshold.pkl` - saved decision threshold

The saved model was trained with `scikit-learn==1.6.1`, so the dependency is pinned in `requirements.txt`. Using a newer scikit-learn version can break pickle loading.

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run Locally

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

Open the app:

```text
http://127.0.0.1:8000
```

If port `8000` is already in use, run on another port:

```bash
python -m uvicorn main:app --reload --port 8001
```

## API Endpoint

### `POST /predict`

Request body:

```json
{
  "person_age": 35,
  "person_income": 60000,
  "person_home_ownership": "RENT",
  "person_emp_length": 5.0,
  "loan_intent": "PERSONAL",
  "loan_grade": "B",
  "loan_amnt": 10000,
  "loan_int_rate": 12.5,
  "loan_percent_income": 0.17,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 8
}
```

Example response:

```json
{
  "default_probability": 0.017311771044770465,
  "default_prediction": 0,
  "threshold": 0.9998393058776855,
  "Result": "Low  Risk"
}
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Frontend Notes

The frontend is served directly by FastAPI using:

```python
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

Because the static folder is mounted at `/`, frontend assets are referenced as:

```html
<link rel="stylesheet" href="/styles.css" />
<script src="/script.js"></script>
```

Do not use `/static/styles.css` or `/static/script.js` unless the backend mount path is changed.

## Deployment On Render

The included `render.yaml` is configured for Render:

```yaml
services:
  - type: web
    name: credit-risk-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /docs
```

No Node.js build step is required.

## Troubleshooting

### Model fails to load

If you see an error like:

```text
AttributeError: Can't get attribute '_RemainderColsList'
```

install the pinned dependencies:

```bash
pip install -r requirements.txt
```

This usually happens when the model is loaded with a different scikit-learn version.

### Page appears unstyled

Check that `static/index.html` links assets from the root path:

```html
href="/styles.css"
src="/script.js"
```

Then hard refresh the browser with `Ctrl + F5`.

### Port already in use

Run the app on a different port:

```bash
python -m uvicorn main:app --reload --port 8001
```

## Disclaimer

This project is for educational and demonstration purposes. The prediction output should not be treated as financial advice or used as the only basis for lending decisions.
