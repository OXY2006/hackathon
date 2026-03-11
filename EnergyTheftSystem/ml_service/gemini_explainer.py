"""
Gemini AI Reasoning Layer for Energy Theft Detection.
Uses Google's Gemini model to generate detailed, intelligent reasoning for risk assessments.
"""
import os

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("[Gemini] google-generativeai package not installed. Using template fallback.")


def generate_gemini_reasoning(
    meter_id: str,
    risk_score: float,
    risk_level: str,
    features: dict,
    top_features: list,
) -> str | None:
    """Generate AI-powered reasoning for meter risk assessment."""
    if not GEMINI_AVAILABLE:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[Gemini] GEMINI_API_KEY not set.")
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-flash-latest"),
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1024,
                "top_p": 0.95,
            },
        )
        
        prompt = f"""You are an expert energy theft forensic analyst. 
Explain why meter {meter_id} has a risk score of {risk_score:.1f}/100 ({risk_level} risk).

Top suspicious features: {', '.join(f['feature'] for f in top_features[:3])}

Provide a concise 2-3 sentence explanation of why this meter is flagged."""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as exc:
        print(f"[Gemini] Error: {exc}")
        return None


def generate_investigation_report(
    meter_id: str,
    risk_score: float,
    risk_level: str,
    features: dict,
    top_features: list,
    nearby_meters: list = None,
) -> dict:
    """Generate comprehensive investigation report with cluster analysis."""
    if not GEMINI_AVAILABLE:
        return {
            "available": False,
            "hypothesis": "AI investigation unavailable - Gemini not configured",
            "evidence": [],
            "cluster_analysis": None,
            "recommendation": "Manual review required",
        }

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "available": False,
            "hypothesis": "AI investigation unavailable - API key not set",
            "evidence": [],
            "cluster_analysis": None,
            "recommendation": "Configure GEMINI_API_KEY",
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-flash-latest"),
            generation_config={
                "temperature": 0.5,
                "max_output_tokens": 2048,
                "top_p": 0.95,
                "top_k": 40,
            },
        )
        
        # Build feature summary
        feat_text = "\n".join([f"  • {f['feature']}: importance {f['importance']:.3f}" for f in top_features[:5]])
        
        # Cluster info
        cluster_text = ""
        if nearby_meters and len(nearby_meters) > 0:
            suspicious_count = len([m for m in nearby_meters if m.get("is_suspicious")])
            cluster_text = f"\n\nNearby meters (5km radius): {len(nearby_meters)} total, {suspicious_count} suspicious"
        
        prompt = f"""You are a forensic energy theft investigator conducting a DEEP DIVE analysis.

METER: {meter_id}
RISK: {risk_score:.1f}/100 ({risk_level.upper()})

TOP SUSPICIOUS FEATURES:
{feat_text}
{cluster_text}

Generate a comprehensive forensic report with these sections:

### 1. PRIMARY HYPOTHESIS
What type of theft or tampering is most likely occurring? (1-2 sentences)

### 2. SUPPORTING EVIDENCE  
- List 3-4 specific evidence points from the features
- Connect each to known theft techniques

### 3. CLUSTER ANALYSIS
- Is this isolated or organized theft?
- Should we do area-level or single-meter inspection?

### 4. RECOMMENDED ACTION
Specific next steps for the field team (1 sentence)

Write clearly and be specific."""

        response = model.generate_content(prompt)
        full_report = response.text.strip()

        # Parse sections with regex
        import re
        
        sections = {
            "hypothesis": "",
            "evidence": [],
            "cluster_analysis": None,
            "recommendation": "",
        }
        
        # Extract hypothesis
        hyp_match = re.search(
            r'(?:###\s*1\.|PRIMARY HYPOTHESIS)(.*?)(?=###\s*2\.|SUPPORTING EVIDENCE|$)',
            full_report, re.DOTALL | re.IGNORECASE
        )
        if hyp_match:
            sections["hypothesis"] = hyp_match.group(1).strip()
        
        # Extract evidence
        ev_match = re.search(
            r'(?:###\s*2\.|SUPPORTING EVIDENCE)(.*?)(?=###\s*3\.|CLUSTER ANALYSIS|$)',
            full_report, re.DOTALL | re.IGNORECASE
        )
        if ev_match:
            evidence_text = ev_match.group(1)
            evidence_lines = re.findall(r'[-•*]\s*(.+?)(?=\n[-•*]|\n\n|$)', evidence_text, re.DOTALL)
            sections["evidence"] = [e.strip() for e in evidence_lines if e.strip()]
        
        # Extract cluster
        cluster_match = re.search(
            r'(?:###\s*3\.|CLUSTER ANALYSIS)(.*?)(?=###\s*4\.|RECOMMENDED ACTION|$)',
            full_report, re.DOTALL | re.IGNORECASE
        )
        if cluster_match:
            sections["cluster_analysis"] = cluster_match.group(1).strip()
        
        # Extract recommendation
        rec_match = re.search(
            r'(?:###\s*4\.|RECOMMENDED ACTION)(.*?)$',
            full_report, re.DOTALL | re.IGNORECASE
        )
        if rec_match:
            sections["recommendation"] = rec_match.group(1).strip()
        
        # Fallback
        if not sections["hypothesis"] and not sections["recommendation"]:
            sections["hypothesis"] = full_report[:500]
            sections["recommendation"] = "See full report for details"

        return {
            "available": True,
            "full_report": full_report,
            "hypothesis": sections["hypothesis"],
            "evidence": sections["evidence"],
            "cluster_analysis": sections["cluster_analysis"],
            "recommendation": sections["recommendation"],
            "nearby_meters_analyzed": len(nearby_meters) if nearby_meters else 0,
        }

    except Exception as exc:
        print(f"[Gemini] Error: {exc}")
        return {
            "available": False,
            "hypothesis": f"Investigation failed: {str(exc)}",
            "evidence": [],
            "cluster_analysis": None,
            "recommendation": "Manual review required",
        }
