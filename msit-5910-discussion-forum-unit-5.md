# MSIT 5910-01 - AY2026-T2
# Discussion Forum Unit 5: Software Testing and Security

**Student:** Johnson Mabgwe  
**Course:** MSIT 5910 – Capstone Project  
**Date:** December 2025  
**Word Count:** 687 (excluding references)

---

## Introduction

Software testing serves as the critical quality gate between development and deployment, ensuring that systems behave as intended while identifying vulnerabilities before malicious actors exploit them. As Ganeshan (n.d.) emphasizes, testing is "a solution provider to our worries about how machines should behave the exact way we want them to." In healthcare IT, where authentication failures can compromise Protected Health Information (PHI) or delay life-saving treatment, rigorous testing is not merely best practice—it is a regulatory imperative under HIPAA (Alenezi & Almuairfi, 2019). This discussion examines the best software testing approaches and their critical relationship to security and vulnerability tracing.

---

## 1. Best Software Testing Approaches

Modern software testing employs a multi-layered strategy that progresses from isolated component validation to comprehensive system-wide assessment. The following approaches represent industry best practices for 2024-2025:

### Table 1: Software Testing Approaches for the HO-MFA Project

| Testing Approach | Description | Application in HO-MFA | Why Used |
|------------------|-------------|----------------------|----------|
| **Unit Testing** | Validates individual code components in isolation (BugBug.io, 2025) | Testing biometric hash generation function, risk scoring algorithm | Catches bugs early during development; ensures each function meets requirements independently |
| **Integration Testing** | Verifies that modules work together harmoniously (Netguru, 2025) | Testing SAML 2.0 handshake between HO-MFA and Epic EHR | Ensures seamless interaction between authentication service and healthcare systems |
| **Security Testing** | Identifies vulnerabilities through penetration testing and scanning (OWASP, 2024) | OWASP ZAP vulnerability scanning, brute force simulation | Proactively discovers exploitable weaknesses before deployment |
| **User Acceptance Testing (UAT)** | Validates that the system meets end-user needs (Rana, 2023) | Clinical staff testing emergency "break-glass" protocol | Ensures authentication workflow does not disrupt patient care |
| **Regression Testing** | Confirms that new changes do not break existing functionality (BugBug.io, 2025) | Re-running test suite after implementing step-up authentication | Maintains system stability throughout iterative development |

These approaches are used because they collectively address the testing pyramid: unit tests provide fast, granular feedback; integration tests validate component interactions; and system-level tests (security, UAT) confirm real-world readiness. For my HO-MFA capstone project, this layered strategy ensures that the adaptive authentication system functions correctly at the code level while meeting clinical usability and HIPAA compliance requirements at the system level.

---

## 2. Testing's Relationship to Software Security and Vulnerability Tracing

Testing and security are intrinsically linked through the principle of **proactive vulnerability identification**. Rather than waiting for attackers to discover weaknesses, security testing simulates adversarial behavior to find and remediate vulnerabilities before production deployment (Alenezi & Almuairfi, 2019). This relationship manifests in three critical dimensions:

### 2.1 Vulnerability Discovery Through Penetration Testing

The OWASP Web Security Testing Guide provides a structured framework for identifying common vulnerabilities such as SQL injection, cross-site scripting (XSS), and broken authentication (OWASP, 2024). For the HO-MFA project, penetration testing validates that rate limiting prevents brute force attacks (maximum 5 failed attempts per 15 minutes) and that session tokens cannot be hijacked through man-in-the-middle attacks. Deepstrike (2025) notes that HIPAA penetration testing specifically "validates the effectiveness of existing technical safeguards like access controls and encryption."

### 2.2 Traceability from Test Cases to Security Controls

Each test case should trace directly to a security requirement, creating an auditable link between testing activities and security controls. For example, in the HO-MFA system, Test Case TC-SEC-001 ("Verify AES-256 encryption of credentials at rest") traces directly to HIPAA Security Rule §164.312(a)(2)(iv), which mandates encryption of ePHI. This traceability enables compliance auditors to verify that security requirements have been systematically validated (FrugalTesting, 2024).

### 2.3 Continuous Security Integration

Modern DevSecOps practices integrate security testing into the CI/CD pipeline, ensuring that every code commit triggers automated vulnerability scans (Netguru, 2025). This "shift-left" approach detects security issues early when remediation is least expensive, rather than discovering critical vulnerabilities during final pre-production audits.

---

## Conclusion

Effective software testing combines multiple approaches—unit, integration, security, UAT, and regression—to ensure system correctness, usability, and security. The relationship between testing and vulnerability tracing is foundational: without systematic security testing, organizations cannot proactively identify and remediate weaknesses before adversarial exploitation. For healthcare systems like HO-MFA, this relationship is further elevated by regulatory mandates that require documented evidence of security control validation.

---

## References

Alenezi, M., & Almuairfi, S. (2019). Security risks in the software development lifecycle. *International Journal of Recent Technology and Engineering (IJRTE)*, 8(3), 22773878.

BugBug.io. (2025). *Software testing best practices for 2025*. https://bugbug.io/blog/software-testing/software-testing-best-practices/

Deepstrike. (2025). *HIPAA penetration testing: The 2025 guide for ePHI security*. https://deepstrike.io/blog/hipaa-penetration-testing-2025-guide

FrugalTesting. (2024). *What is HIPAA compliance testing in QA?* https://www.frugaltesting.com/blog/what-is-hipaa-compliance-testing-in-qa

Ganeshan, D. (n.d.). Testing software testing techniques. *MST Solutions*. https://www.mstsolutions.com/technical/software-testing-techniques/

Netguru. (2025). *10 best practices in software QA for 2025*. https://www.netguru.com/blog/software-qa-best-practices

OWASP. (2024). *Web security testing guide*. https://owasp.org/www-project-web-security-testing-guide/

Rana, K. (2023, April 29). What is a test case? How to write test cases? *ArtOfTesting*. https://artoftesting.com/what-is-test-case
