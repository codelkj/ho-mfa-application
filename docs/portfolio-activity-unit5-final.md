# Capstone Progress Report: Security and Testing Strategy

**Johnson Mabgwe**  
Department of Information Technology, University of the People  
MSIT 5910: Capstone Project  
Unit 5 Portfolio Activity  
December 11, 2025

---

## Security and Testing

### 5.1 Software Testing Practices and Security Measures Adopted

The Healthcare-Optimized Multi-Factor Authentication (HO-MFA) framework demands rigorous testing practices that address both functional correctness and security resilience. Given the system's role in protecting Protected Health Information (PHI) and enabling life-critical emergency access, the testing strategy follows a Defense-in-Depth approach. As Alenezi and Almuairfi (2019) emphasize, "security risks must be addressed at every phase of the software development lifecycle" (p. 1). The following testing practices and security measures have been adopted for the HO-MFA project.

#### 5.1.1 Multi-Layered Testing Strategy

The HO-MFA project employs a comprehensive testing pyramid that progresses from granular unit tests to system-wide security assessments.

**Table 1**  
*Testing Practices Adopted for HO-MFA*

| Testing Type | Purpose | Tools Used | HO-MFA Application |
|--------------|---------|------------|-------------------|
| Unit Testing | Validate individual functions in isolation. | Jest, PyTest | Testing the Risk Score Calculator logic to ensure it correctly weights factors like "Remote Location" (20 points) versus "Known Device" (-10 points). |
| Integration Testing | Verify module interactions. | Postman, Newman | Verifying the secure handshake between the Vercel API Route and the Supabase backend to ensure "Break-Glass" events trigger audit logs correctly. |
| Security Testing | Identify vulnerabilities proactively. | OWASP ZAP, Burp Suite | Automated penetration testing of authentication endpoints; SQL injection attempts against the login form. |
| User Acceptance Testing (UAT) | Validate clinical workflow compatibility. | Manual testing | Simulating a "Code Blue" scenario to verify the Break-Glass Protocol grants access in < 3 seconds, meeting the non-functional requirement for availability. |
| Regression Testing | Ensure changes do not break existing functionality. | Automated Suite | Running the full authentication suite after updating the biometric library to ensure no degradation in match accuracy. |

This layered approach ensures that defects are caught at the earliest possible stage. As BugBug.io (2025) notes, fixing bugs during unit testing costs significantly less than addressing them post-deployment.

#### 5.1.2 Software Security Measures Implemented

Security measures for the HO-MFA system are designed to address the OWASP Top 10 vulnerabilities and HIPAA Security Rule requirements, with a specific focus on biometric privacy.

**Table 2**  
*Security Measures and Their Justification*

| Security Measure | Implementation | Justification |
|-----------------|----------------|---------------|
| Privacy-First Biometrics | Raw biometric data is processed on-device (client); only mathematical embeddings are sent to the server. | **Critical Control:** Prevents the central database from becoming a honeypot of biometric images. Aligns with HIPAA's "Minimum Necessary" standard. |
| AES-256 Encryption (At Rest) | All credentials and biometric templates encrypted in Supabase. | HIPAA §164.312(a)(2)(iv) mandates encryption of ePHI; AES-256 is the NIST-approved standard (NIST, 2023). |
| TLS 1.3 Encryption (In Transit) | All traffic between Client, API Gateway, and Database is encrypted. | Prevents man-in-the-middle (MitM) attacks during credential transmission. |
| Rate Limiting | Maximum 5 failed login attempts per 15-minute window. | Mitigates brute force attacks; aligns with OWASP Authentication Cheat Sheet recommendations. |
| Account Lockout | Account locked after 10 consecutive failures. | Defense against credential stuffing attacks. |
| Comprehensive Audit Logging | All events (success, failure, break-glass) logged with timestamp, IP, and risk score. | HIPAA §164.312(b) audit requirement; enables forensic investigation of emergency access usage. |

#### 5.1.3 Penetration Testing Approach

Following the OWASP Web Security Testing Guide framework, the HO-MFA system undergoes structured penetration testing scenarios:

1. **Authentication Bypass:** Attempting to bypass the MFA prompt by manipulating JWT token claims.
2. **Input Validation:** Injecting SQL payloads (e.g., `' OR 1=1 --`) into the "Justification" field of the Break-Glass form.
3. **Privilege Escalation:** Attempting to access the Admin Dashboard using a Nurse-role credential.

---

### 5.2 Test Cases and Their Contribution to the Testing Process

Test cases translate requirements into executable validation steps. As Rana (2023) defines, "a test case is a set of actions performed on a system to determine that it satisfies the software requirements" (para. 1). The following test cases have been developed and executed for critical HO-MFA functionality.

**Table 3**  
*HO-MFA Critical Test Cases*

| Test Case ID | Test Case Name | Preconditions | Test Steps | Expected Result | Status |
|--------------|---------------|---------------|------------|-----------------|--------|
| TC-AUTH-001 | Valid Biometric Authentication | User enrolled; Camera active. | 1. User positions face in frame. 2. Client extracts embedding. 3. Server verifies match. | Authentication succeeds; User redirected to Dashboard. | PASS |
| TC-BG-001 | Emergency Break-Glass Access | Login screen active. | 1. Click "Emergency Access". 2. Select "Code Blue". 3. Enter justification. | Immediate access granted; Audit log created with severity=CRITICAL. | PASS |
| TC-RISK-001 | Adaptive Risk Scoring | User context established. | 1. Simulate "Unknown Device". 2. Simulate "Remote IP". 3. Attempt Login. | Risk Score > 70; Step-Up Authentication (MFA) triggered. | PASS |
| TC-SEC-001 | Client-Side Data Leakage | Network inspector open. | 1. Perform biometric scan. 2. Inspect network payload. | Payload contains embedding array only; NO raw image data is transmitted. | PASS |
| TC-UAT-001 | Mean Time to Authenticate | Clinical user group. | 1. Measure time from "Login" click to "Dashboard" load. | Average time < 5 seconds for standard access. | PASS |

#### 5.2.1 Evidence of Testing (Screenshots)

The following figures demonstrate the successful execution of key test cases via the HO-MFA Testing Dashboard.

---

**Figure 1**  
*Automated Test Suite Execution (Regression Testing)*

`[Insert Screenshot: /test page showing "Automated Tests" tab with 14 tests displaying green "Passed" badges]`

**Contribution:** Figure 1 demonstrates the Regression Testing capability. By automating 14 critical checks—including Database Connection, RLS Policy Validation, and Session Management—the system allows for continuous integration. Every time code is deployed, this suite runs to ensure no existing security controls have been broken (BugBug.io, 2025).

---

**Figure 2**  
*Risk Scenario Simulator (User Acceptance Testing)*

`[Insert Screenshot: /test page showing "Risk Scenarios" tab with sliders for risk factors and resulting "High Risk" score]`

**Contribution:** Figure 2 illustrates the User Acceptance Testing (UAT) for the adaptive risk engine. This interface allows non-technical stakeholders (clinical directors) to validate the logic of the system. By toggling "VPN Detected" or "New Device," stakeholders can visually verify that the system responds correctly (triggering Step-Up Auth) without needing to read the backend code. This validates that the system meets the "Context-Aware" requirement defined in the Software Requirements Specification (SRS).

---

**Figure 3**  
*Break-Glass Audit Confirmation (Integration Testing)*

`[Insert Screenshot: /break-glass page showing green "Emergency Access Granted" screen with audit trail confirmation]`

**Contribution:** Figure 3 provides evidence of Integration Testing. The success of this screen confirms that three distinct modules—the Frontend UI, the Backend Authentication Service, and the Audit Logging Database—are communicating correctly. The display of "Audit Trail Active" confirms that the system has successfully written the immutable log entry before granting access, satisfying the HIPAA requirement for accountability during emergency overrides.

---

### Conclusion

The HO-MFA capstone project employs a comprehensive testing strategy that combines unit, integration, security, and user acceptance testing. By specifically testing for privacy leakage (ensuring raw images don't traverse the network) and operational latency, the testing plan addresses the unique constraints of healthcare IT. The 100% pass rate on critical security test cases, evidenced by the automated dashboards and risk simulators, demonstrates that the system is technically robust and ready for pilot deployment.

---

## References

Alenezi, M., & Almuairfi, S. (2019). Security risks in the software development lifecycle. *International Journal of Recent Technology and Engineering (IJRTE), 8*(3), 2277-3878.

BugBug.io. (2025). Software testing best practices for 2025. https://bugbug.io/blog/software-testing/software-testing-best-practices/

Deepstrike. (2025). HIPAA penetration testing: The 2025 guide for ePHI security. https://deepstrike.io/blog/hipaa-penetration-testing-2025-guide

FrugalTesting. (2024). What is HIPAA compliance testing in QA? https://www.frugaltesting.com/blog/what-is-hipaa-compliance-testing-in-qa

Ganeshan, D. (n.d.). Testing software testing techniques. *MST Solutions*. https://www.mstsolutions.com/technical/software-testing-techniques/

NIST. (2023). Cryptographic standards and guidelines. *National Institute of Standards and Technology*. https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines

OWASP. (2024). Web security testing guide. https://owasp.org/www-project-web-security-testing-guide/

Rana, K. (2023, April 29). What is a test case? How to write test cases? *ArtOfTesting*. https://artoftesting.com/what-is-test-case
