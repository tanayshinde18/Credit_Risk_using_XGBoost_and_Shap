# CreditLens — Credit Risk Prediction

A FastAPI + scikit-learn credit-risk application with a responsive fintech-style frontend.

## Project structure

```text
credit-risk-app/
├── main.py
├── credit_risk_model.pkl
├── best_threshold.pkl
├── requirements.txt
├── render.yaml
└── static/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Important

Put your existing FastAPI code in `main.py`, and place these two model files in the project root:

- `credit_risk_model.pkl`
- `best_threshold.pkl`

The frontend calls:

`POST /predict`

and sends exactly the fields defined by your `LoanApplication` Pydantic model.

## Render

The included `render.yaml` uses:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

No Node.js build step is required because the frontend is served directly by FastAPI.

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open:

`http://127.0.0.1:8000`
