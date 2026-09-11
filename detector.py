import re

def detect_sensitive_data(text):
    findings = []

    patterns = {
        "Email": (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', 10),
        "Phone": (r'\b[6-9]\d{9}\b', 20),
        "Aadhaar-like": (r'\b\d{4}\s?\d{4}\s?\d{4}\b', 30),
        "PAN-like": (r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', 30),
        "API Key": (r'(?i)\b(api[_-]?key|secret|token)\s*[:=]\s*[A-Za-z0-9_\-]{8,}', 40)
    }

    score = 0

    for data_type, (pattern, points) in patterns.items():
        matches = re.findall(pattern, text)

        for match in matches:
            findings.append({
                "type": data_type,
                "value": match
            })
            score += points

    score = min(score, 100)

    if score >= 70:
        risk_level = "HIGH RISK"
    elif score >= 40:
        risk_level = "MEDIUM RISK"
    elif score > 0:
        risk_level = "LOW RISK"
    else:
        risk_level = "SAFE"

    return findings, score, risk_level