const API_URL = 'https://health-insurance-risk-calc-server-backlog-fngae6hphbgcchd8.centralus-01.azurewebsites.net';

// ping api
async function wakeUpAPI() {
  try {
    const res = await fetch(`${API_URL}/ping`);
    const data = await res.json();
    console.log("API Awake:", data.message);
  } catch (err) {
    console.error("API wake-up failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wakeUpAPI();
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  try {
    document.getElementById("result").innerText = "Loading...";

    const age = Number(document.getElementById("age").value);
    const heightFeet = Number(document.getElementById("heightFeet").value);
    const heightInches = Number(document.getElementById("heightInches").value);
    const weight = Number(document.getElementById("weight").value);
    const systolic = Number(document.getElementById("systolic").value);
    const diastolic = Number(document.getElementById("diastolic").value);

    const familyHistory = [];
    if (document.getElementById("diabetes").checked) familyHistory.push("Diabetes");
    if (document.getElementById("cancer").checked) familyHistory.push("Cancer");
    if (document.getElementById("Alzheimer").checked) familyHistory.push("Alzheimer");

    // Call BMI API
    const bmiResponse = await fetch(`${API_URL}/bmi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heightFeet, heightInches, weight })
    });
    const bmiResult = await bmiResponse.json();
    console.log("BMI Response:", bmiResult); // debug

    // Call BP API
    const bpResponse = await fetch(`${API_URL}/bp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systolic, diastolic })
    });
    const bpResult = await bpResponse.json();
    const bpCategory = bpResult.category || "unknown";

    // Call Risk API
    const riskResponse = await fetch(`${API_URL}/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age,
        bmiCategory: bmiResult.category,
        bpCategory,
        familyHistory
      })
    });
    const riskData = await riskResponse.json();

    document.getElementById("result").innerHTML = `
        <h3>Results:</h3>
        BMI: ${bmiResult.bmi !== undefined ? bmiResult.bmi : "Not provided"}<br>
        BMI Category: ${bmiResult.category !== undefined ? bmiResult.category : "Not provided"}<br>
        Blood Pressure Category: ${bpCategory !== undefined ? bpCategory : "Not provided"}<br>
        Family History: ${familyHistory.length > 0 ? familyHistory.join(", ") : "None"}<br>
        Risk Score: ${riskData.riskScore !== undefined ? riskData.riskScore : "Not provided"}<br>
        Risk Level: ${riskData.riskLevel !== undefined ? riskData.riskLevel : "Not provided"}
        `;

  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText = "Error occurred.";
  }
});