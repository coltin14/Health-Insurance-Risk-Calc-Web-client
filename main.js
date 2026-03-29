const API_URL = 'https://health-insurance-risk-calc-server-backlog-fngae6hphbgcchd8.centralus-01.azurewebsites.net';

// Wake up the API on page load
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

    // Get input values
    const age = document.getElementById("age").value;
    const heightFeet = document.getElementById("heightFeet").value;
    const heightInches = document.getElementById("heightInches").value;
    const weight = document.getElementById("weight").value;
    const systolic = document.getElementById("systolic").value;
    const diastolic = document.getElementById("diastolic").value;

    // Frontend validation
    if (!age || !heightFeet || !heightInches || !weight || !systolic || !diastolic) {
      document.getElementById("result").innerText = "Please fill in all fields.";
      return;
    }

    if (
      Number(age) < 0 ||
      Number(heightFeet) < 0 ||
      Number(heightInches) < 0 ||
      Number(weight) <= 0 ||
      Number(systolic) <= 0 ||
      Number(diastolic) < 0
    ) {
      alert("Please enter positive numbers for age, height, weight, and blood pressure.");
      document.getElementById("result").innerText = "";
      return;
    }

    // Collect family history
    const familyHistory = [];
    if (document.getElementById("diabetes").checked) familyHistory.push("Diabetes");
    if (document.getElementById("cancer").checked) familyHistory.push("Cancer");
    if (document.getElementById("Alzheimer").checked) familyHistory.push("Alzheimer");

    // Call BMI API
    const bmiResponse = await fetch(`${API_URL}/bmi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heightFeet: Number(heightFeet),
        heightInches: Number(heightInches),
        weight: Number(weight)
      })
    });
    const bmiResult = await bmiResponse.json();
    const bmiCategory = bmiResult.category || "Field required";

    // Call BP API
    const bpResponse = await fetch(`${API_URL}/bp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systolic: Number(systolic),
        diastolic: Number(diastolic)
      })
    });
    const bpResult = await bpResponse.json();
    const bpCategory = bpResult.category || "Field required";

    // Call Risk API
    const riskResponse = await fetch(`${API_URL}/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: Number(age),
        bmiCategory,
        bpCategory,
        familyHistory
      })
    });
    const riskData = await riskResponse.json();

    // Display results
    document.getElementById("result").innerHTML = `
      <h3>Results:</h3>
      BMI: ${bmiResult.bmi || "Field required"}<br>
      BMI Category: ${bmiCategory}<br>
      Blood Pressure Category: ${bpCategory}<br>
      Family History: ${familyHistory.join(", ") || "None"}<br>
      Risk Score: ${riskData.riskScore ?? "Field required"}<br>
      Risk Level: ${riskData.riskLevel ?? "Field required"}
    `;

  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText = "Error occurred.";
  }
});