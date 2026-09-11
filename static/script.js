const fileInput = document.getElementById("fileInput");
const scanButton = document.getElementById("scanButton");
const safeButton = document.getElementById("safeButton");

const fileName = document.getElementById("fileName");
const riskScore = document.getElementById("riskScore");
const riskLevel = document.getElementById("riskLevel");
const findings = document.getElementById("findings");
const shareStatus = document.getElementById("shareStatus");

const previewSection = document.getElementById("previewSection");
const beforePreview = document.getElementById("beforePreview");
const afterPreview = document.getElementById("afterPreview");


// File selection
fileInput.addEventListener("change", function () {

    if (fileInput.files.length > 0) {

        fileName.textContent =
            "Selected: " + fileInput.files[0].name;

        shareStatus.textContent =
            "📄 Ready to scan this file.";

    } else {

        fileName.textContent = "No file selected";

        shareStatus.textContent =
            "📄 Upload a file to check sharing safety.";

        previewSection.style.display = "none";
    }
});


// Scan button
scanButton.addEventListener("click", async function () {

    if (fileInput.files.length === 0) {

        alert("Please select a file first.");
        return;
    }

    riskScore.textContent = "Scanning...";
    riskLevel.textContent = "Please wait";

    shareStatus.textContent =
        "🔍 Checking your file for sensitive information...";

    findings.innerHTML =
        "<p>Analyzing your file...</p>";

    previewSection.style.display = "none";


    const formData = new FormData();

    formData.append(
        "file",
        fileInput.files[0]
    );


    try {

        const response = await fetch("/scan", {
            method: "POST",
            body: formData
        });

        const data = await response.json();


        riskScore.textContent =
            data.score + "/100";

        riskLevel.textContent =
            data.risk_level;


        if (data.findings.length === 0) {

            shareStatus.textContent =
                "✅ SAFE TO SHARE — No sensitive information detected.";

            findings.innerHTML =
                "<p>✅ No sensitive information detected.</p>";

            previewSection.style.display = "none";

        } else {

            shareStatus.textContent =
                "⚠️ NOT SAFE TO SHARE — Sensitive information detected.";

            findings.innerHTML =
                data.findings.map(item =>
                    `<p>⚠️ <strong>${item.type}</strong>: ${item.value}</p>`
                ).join("");


            // Show Before & After
            previewSection.style.display = "block";


            beforePreview.innerHTML =
                data.findings.map(item =>
                    `<p>⚠️ ${item.type}: ${item.value}</p>`
                ).join("");


            afterPreview.innerHTML =
                data.findings.map(item =>
                    `<p>🔒 ${item.type}: ${maskValue(item.value)}</p>`
                ).join("");
        }


        // Risk styling

        if (data.score >= 70) {

            riskScore.style.color = "#dc2626";
            riskLevel.style.color = "#dc2626";

            shareStatus.style.background = "#fee2e2";
            shareStatus.style.color = "#991b1b";

        } else if (data.score >= 40) {

            riskScore.style.color = "#d97706";
            riskLevel.style.color = "#d97706";

            shareStatus.style.background = "#fef3c7";
            shareStatus.style.color = "#92400e";

        } else if (data.score > 0) {

            riskScore.style.color = "#ca8a04";
            riskLevel.style.color = "#ca8a04";

            shareStatus.style.background = "#fefce8";
            shareStatus.style.color = "#854d0e";

        } else {

            riskScore.style.color = "#059669";
            riskLevel.style.color = "#059669";

            shareStatus.style.background = "#d1fae5";
            shareStatus.style.color = "#065f46";
        }


    } catch (error) {

        console.error(error);

        riskScore.textContent = "Error";

        riskLevel.textContent =
            "Scan failed";

        shareStatus.textContent =
            "❌ Unable to scan the file.";

        findings.innerHTML =
            "<p>❌ Something went wrong.</p>";
    }
});


// Mask detected values for preview
function maskValue(value) {

    // Email
    if (value.includes("@")) {

        const parts = value.split("@");

        return parts[0].charAt(0) +
            "******@" +
            parts[1];
    }


    // Phone / numbers
    if (/^\d+$/.test(value.replace(/\s/g, ""))) {

        const clean = value.replace(/\s/g, "");

        if (clean.length >= 8) {

            return clean.substring(0, 2) +
                "******" +
                clean.substring(clean.length - 2);
        }
    }


    // API key / token
    if (
        value.toLowerCase().includes("key") ||
        value.toLowerCase().includes("token") ||
        value.toLowerCase().includes("secret")
    ) {

        return "[REDACTED]";
    }


    // PAN or other sensitive value
    return "[REDACTED]";
}


// Make Safe button
safeButton.addEventListener("click", async function () {

    if (fileInput.files.length === 0) {

        alert("Please select a file first.");
        return;
    }


    const formData = new FormData();

    formData.append(
        "file",
        fileInput.files[0]
    );


    try {

        const response = await fetch("/make-safe", {
            method: "POST",
            body: formData
        });


        if (!response.ok) {

            alert("Unable to create safe copy.");
            return;
        }


        const blob = await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "safe_copy.txt";


        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);


        shareStatus.textContent =
            "✅ Safe copy created successfully. Ready to share.";

        shareStatus.style.background =
            "#d1fae5";

        shareStatus.style.color =
            "#065f46";


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while creating the safe copy."
        );
    }
});
