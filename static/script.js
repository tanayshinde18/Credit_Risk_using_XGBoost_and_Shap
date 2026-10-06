
const form = document.getElementById("riskForm");
const button = document.getElementById("predictBtn");
const errorBox = document.getElementById("formError");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
const resultCard = document.getElementById("resultCard");
const resetBtn = document.getElementById("resetBtn");

const probability = document.getElementById("probability");
const probabilityText = document.getElementById("probabilityText");
const probabilityBar = document.getElementById("probabilityBar");
const thresholdMarker = document.getElementById("thresholdMarker");
const thresholdText = document.getElementById("thresholdText");
const scoreRing = document.getElementById("scoreRing");

const riskLabel = document.getElementById("riskLabel");
const riskTitle = document.getElementById("riskTitle");
const riskDescription = document.getElementById("riskDescription");

const decisionIcon = document.getElementById("decisionIcon");
const decisionTitle = document.getElementById("decisionTitle");
const decisionText = document.getElementById("decisionText");


// ==========================================
// ERROR HANDLING
// ==========================================

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
}

function clearError() {
    errorBox.textContent = "";
    errorBox.classList.remove("show");
}


// ==========================================
// DATA PROCESSING
// ==========================================

function numberValue(formData, key) {
    const value = Number(formData.get(key));

    return Number.isFinite(value) ? value : null;
}


function buildPayload() {
    const fd = new FormData(form);

    return {
        person_age: numberValue(fd, "person_age"),

        person_income: numberValue(fd, "person_income"),

        person_home_ownership:
            fd.get("person_home_ownership"),

        person_emp_length:
            numberValue(fd, "person_emp_length"),

        loan_intent: fd.get("loan_intent"),

        loan_grade: fd.get("loan_grade"),

        loan_amnt: numberValue(fd, "loan_amnt"),

        loan_int_rate:
            numberValue(fd, "loan_int_rate"),

        loan_percent_income:
            numberValue(fd, "loan_percent_income"),

        cb_person_default_on_file:
            fd.get("cb_person_default_on_file"),

        cb_person_cred_hist_length:
            numberValue(fd, "cb_person_cred_hist_length")
    };
}


// ==========================================
// FORM VALIDATION
// ==========================================

function validatePayload(payload) {

    const required = Object.entries(payload).filter(
        ([, value]) => value === null || value === ""
    );

    if (required.length) {
        return "Please complete all applicant and loan fields.";
    }

    if (payload.person_age < 18) {
        return "Applicant age must be at least 18.";
    }

    if (
        payload.person_income < 0 ||
        payload.loan_amnt < 0
    ) {
        return "Income and loan amount cannot be negative.";
    }

    if (
        payload.loan_percent_income < 0 ||
        payload.loan_percent_income > 1
    ) {
        return "Loan / income ratio must be between 0 and 1.";
    }

    if (
        payload.loan_int_rate < 0 ||
        payload.loan_int_rate > 100
    ) {
        return "Interest rate must be between 0% and 100%.";
    }

    return null;
}


// ==========================================
// NUMBER ANIMATION
// ==========================================

function animateNumber(element, target, suffix = "%") {

    const duration = 800;
    const start = performance.now();

    function tick(now) {

        const progress = Math.min(
            (now - start) / duration,
            1
        );

        const eased =
            1 - Math.pow(1 - progress, 3);

        const value = target * eased;

        element.textContent =
            `${value.toFixed(1)}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}


// ==========================================
// DISPLAY PREDICTION RESULTS
// ==========================================

function renderResult(data) {

    const p = Math.max(
        0,
        Math.min(1, Number(data.default_probability))
    );

    const threshold = Math.max(
        0,
        Math.min(1, Number(data.threshold))
    );

    const highRisk =
        Number(data.default_prediction) === 1;

    const percentage = p * 100;


    // Show results panel

    emptyState.classList.add("hidden");

    resultContent.classList.remove("hidden");

    resultCard.classList.toggle(
        "risk-high",
        highRisk
    );


    // Animate probability numbers

    animateNumber(
        probability,
        percentage
    );

    animateNumber(
        probabilityText,
        percentage
    );


    // Animate probability visualization

    requestAnimationFrame(() => {

        probabilityBar.style.width =
            `${percentage}%`;

        thresholdMarker.style.left =
            `${threshold * 100}%`;

        const color = highRisk
            ? "var(--danger)"
            : "var(--accent)";

        scoreRing.style.background =
            `conic-gradient(
                ${color} ${percentage * 3.6}deg,
                rgba(255,255,255,.07) 0deg
            )`;

    });


    // Display model threshold

    thresholdText.textContent =
        `Decision threshold: ${(threshold * 100).toFixed(1)}%`;


    // Update risk classification

    if (highRisk) {

        riskLabel.textContent =
            "HIGH RISK";

        riskTitle.textContent =
            "Elevated default risk";

        riskDescription.textContent =
            "The model estimates that this application is above its configured default-risk threshold.";

        decisionIcon.textContent = "!";

        decisionTitle.textContent =
            "Higher risk profile";

        decisionText.textContent =
            "The predicted probability is at or above the model's decision threshold.";

    } else {

        riskLabel.textContent =
            "LOW RISK";

        riskTitle.textContent =
            "Low default risk";

        riskDescription.textContent =
            "The model estimates a relatively low likelihood of default for this application.";

        decisionIcon.textContent = "✓";

        decisionTitle.textContent =
            "Lower risk profile";

        decisionText.textContent =
            "The predicted probability is below the model's decision threshold.";

    }


    // Trigger result animation

    resultCard.classList.remove("flash");

    void resultCard.offsetWidth;

    resultCard.classList.add("flash");

}


// ==========================================
// FASTAPI PREDICTION REQUEST
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearError();


        // Browser validation

        if (!form.checkValidity()) {

            form.reportValidity();

            showError(
                "Please complete the required fields with valid values."
            );

            return;
        }


        // Prepare model input

        const payload = buildPayload();

        const validationError =
            validatePayload(payload);

        if (validationError) {

            showError(validationError);

            return;
        }


        // Activate loading animation

        button.classList.add("loading");

        button.querySelector(
            ".btn-label"
        ).textContent = "Assessing profile…";


        try {

            // Send request to FastAPI

            const response = await fetch(
                "/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(payload)
                }
            );


            // Process response

            let data;

            try {

                data = await response.json();

            } catch {

                throw new Error(
                    "The server returned an invalid response."
                );

            }


            // Handle API errors

            if (!response.ok) {

                const message =
                    typeof data.detail === "string"
                        ? data.detail
                        : "Prediction failed. Please check the submitted values.";

                throw new Error(message);

            }


            // Validate model response

            if (
                !Number.isFinite(
                    Number(data.default_probability)
                ) ||
                !Number.isFinite(
                    Number(data.threshold)
                )
            ) {

                throw new Error(
                    "The model returned an invalid prediction."
                );

            }


            // Display prediction

            renderResult(data);


            // Scroll to results

            resultCard.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });


        } catch (error) {

            showError(
                error.message ||
                "Could not connect to the prediction service."
            );

        } finally {

            // Restore button

            button.classList.remove("loading");

            button.querySelector(
                ".btn-label"
            ).textContent = "Assess credit risk";

        }

    }
);


// ==========================================
// RESET ASSESSMENT
// ==========================================

resetBtn.addEventListener(
    "click",
    () => {

        resultContent.classList.add("hidden");

        emptyState.classList.remove("hidden");

        resultCard.classList.remove("risk-high");

        form.reset();

        clearError();

        probabilityBar.style.width = "0%";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ==========================================
// CLEAR ERRORS WHEN USER EDITS FIELDS
// ==========================================

document.querySelectorAll(
    "input, select"
).forEach((field) => {

    field.addEventListener(
        "input",
        clearError
    );

    field.addEventListener(
        "change",
        clearError
    );

});
