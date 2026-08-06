from services.ai_service import analyze_vulnerability

def enrich_findings(findings: list[dict]) -> list[dict]:
    """
    Takes raw findings from the scanner and enriches them
    with AI-generated explanations and secure examples.
    """
    enriched_findings = []
    
    for finding in findings:
        try:
            ai_data = analyze_vulnerability(finding)
            if ai_data and ai_data.get("explanation"):
                finding["explanation"] = ai_data["explanation"]
            
            danger = ai_data.get("danger", "") if ai_data else ""
            fix = ai_data.get("fix", "") if ai_data else ""
            if danger and fix:
                finding["recommendation"] = f"**Why it's dangerous:**\n{danger}\n\n**How to fix:**\n{fix}"
            elif fix:
                finding["recommendation"] = fix
            elif danger:
                finding["recommendation"] = f"**Why it's dangerous:**\n{danger}"
                
            if ai_data and ai_data.get("secure_example"):
                finding["secure_example"] = ai_data["secure_example"]
        except Exception as e:
            print(f"AI enrichment skipped for finding {finding.get('issue')}: {e}")
        
        enriched_findings.append(finding)
        
    return enriched_findings
