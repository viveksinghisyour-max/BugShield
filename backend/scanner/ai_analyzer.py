from services.ai_service import analyze_vulnerability

def enrich_findings(findings: list[dict]) -> list[dict]:
    """
    Takes raw findings from the scanner and enriches them
    with AI-generated explanations and secure examples.
    """
    enriched_findings = []
    
    for finding in findings:
        # Generate AI explanation
        ai_data = analyze_vulnerability(finding)
        
        # Inject AI results into the finding dictionary
        # Map the AI keys to the existing database columns
        finding["explanation"] = ai_data.get("explanation", "")
        
        # Combine danger and fix into recommendation
        danger = ai_data.get("danger", "")
        fix = ai_data.get("fix", "")
        if danger and fix:
            finding["recommendation"] = f"**Why it's dangerous:**\n{danger}\n\n**How to fix:**\n{fix}"
        elif fix:
            finding["recommendation"] = fix
        elif danger:
            finding["recommendation"] = f"**Why it's dangerous:**\n{danger}"
            
        finding["secure_example"] = ai_data.get("secure_example", "")
        
        enriched_findings.append(finding)
        
    return enriched_findings
