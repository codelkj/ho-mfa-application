# Healthcare-Optimized Multi-Factor Authentication Framework
## MSIT Capstone Project Proposal

**Johnson Mabgwe**  
University of the People  
MSIT 5910-01 - Capstone Project - AY2026-T2  
Professor Eljilani Hmouda  
November 18, 2025

---

## Problem Statement

Healthcare organizations face escalating cybersecurity threats targeting electronic protected health information (ePHI), with the healthcare sector experiencing 1,463 data breaches affecting over 385 million patient records between 2020-2024—a 256% increase from the previous five-year period (HHS Office for Civil Rights, 2024). The 2025 HIPAA Security Rule mandates multi-factor authentication (MFA) for all systems accessing ePHI, yet many providers struggle to implement MFA solutions that balance robust security with clinical workflow efficiency (MetricStream, 2025). Legacy systems often lack native MFA capabilities, creating compliance gaps and vulnerabilities that expose patient data to unauthorized access, ransomware attacks, and insider threats.

In my role as Healthcare IT Security Analyst at Regional Medical Center, I have observed firsthand how clinician resistance to MFA implementations that disrupt workflows leads to insecure workarounds, such as credential sharing, password reuse, and bypassing authentication protocols during emergencies. This "shadow security" behavior often creates larger vulnerabilities than the ones the system was designed to prevent. The average healthcare worker accesses 16-20 different applications during a single shift, and each authentication delay of 30-45 seconds compounds into significant productivity losses and potential delays in patient care (Healthcare IT News, 2024). The diverse ecosystem of healthcare applications—including electronic health records (EHR) systems like Epic and Cerner, patient portals, telehealth platforms, medical device interfaces, and administrative systems—complicates authentication strategies because each system may have different technical capabilities, security requirements, and user interaction patterns.

Current enterprise MFA solutions fail to address healthcare-specific needs such as emergency access protocols that enable immediate ePHI access during life-threatening situations, shared workstation authentication in clinical areas where multiple providers access the same terminal throughout the day, role-based authentication that adapts security requirements based on clinical roles and data sensitivity, and seamless integration with existing single sign-on (SSO) infrastructure to minimize authentication friction (Forrester Research, 2024). Furthermore, the healthcare workforce includes diverse user populations with varying technical proficiency, from physicians and nurses to administrative staff and third-party vendors, each requiring tailored authentication approaches that balance security with usability. This multifaceted challenge creates an urgent need for a healthcare-optimized MFA framework that ensures HIPAA compliance, strengthens data protection, prevents unauthorized access, and maintains rapid access to patient information in clinical contexts where seconds matter.

The significance of this problem extends beyond regulatory compliance to encompass patient safety, organizational reputation, financial stability, and public trust in healthcare systems. The average cost of a healthcare data breach reached $10.93 million in 2023, the highest of any industry, with costs including regulatory fines, legal settlements, remediation expenses, and reputational damage (IBM Security, 2024). Moreover, authentication delays during critical moments can compromise patient outcomes, and authentication systems that frustrate clinical workflows contribute to provider burnout and reduced job satisfaction. Addressing this problem requires an innovative solution that integrates emerging technologies, adapts to clinical realities, and demonstrates measurable improvements in both security posture and workflow efficiency.

## Proposed Solution

This capstone project will design and implement a Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework specifically tailored for clinical environments. The solution integrates adaptive authentication mechanisms that dynamically adjust security requirements based on contextual factors including user role, physical location, device trust level, data sensitivity, and clinical urgency (Happiest Minds, 2025). By leveraging risk-based authentication algorithms, the system will apply stringent authentication requirements for high-risk scenarios—such as remote access or administrative functions—while streamlining authentication for low-risk activities performed by verified users on trusted devices within secure network perimeters.

The framework will incorporate multiple authentication factors to provide flexibility and accommodate diverse user preferences and clinical contexts. Biometric authentication options will include fingerprint scanning for rapid verification at clinical workstations, facial recognition for hands-free authentication in surgical or sterile environments, and voice recognition for telemedicine applications. Hardware security tokens will provide FIDO2-compliant authentication for administrative users accessing sensitive systems, while mobile push notifications and time-based one-time passwords (TOTP) will support remote access scenarios. Proximity-based authentication using Bluetooth Low Energy (BLE) badges will enable seamless authentication as clinicians move between workstations, reducing repeated login friction while maintaining security.

A key innovation of this framework is the emergency access protocol, also known as "break-glass" authentication, which enables immediate ePHI access during life-threatening situations while maintaining comprehensive audit trails and triggering automatic security reviews (MetricStream, 2025). When a clinician invokes emergency access, the system immediately grants temporary credentials with predefined elevated privileges, simultaneously logging detailed information about the access event, notifying security personnel, and requiring post-access justification. This approach balances patient safety imperatives with security governance, ensuring that emergency access is available when needed but remains accountable and auditable.

The HO-MFA Framework will integrate with major healthcare IT systems including Epic, Cerner, and Meditech electronic health record platforms, Active Directory and LDAP directory services for centralized identity management, and SAML-based single sign-on platforms to leverage existing authentication infrastructure. The solution will employ modern authentication protocols including OAuth 2.0 for authorization delegation, OpenID Connect for identity layer functionality, and FIDO2/WebAuthn for passwordless authentication where appropriate. Integration will occur through standardized APIs and authentication middleware that intercepts authentication requests, applies policy-based decision logic, and enforces appropriate MFA requirements without requiring extensive modifications to existing applications.

Implementation will follow a phased rollout strategy designed to minimize disruption and enable iterative refinement based on user feedback. Phase 1 will establish the authentication framework infrastructure, configure policy engines, and pilot the system with administrative users who typically have higher technical proficiency and lower time pressures. Phase 2 will expand to clinical users in non-critical departments, gathering usability data and refining authentication workflows. Phase 3 will implement the solution in emergency departments and critical care units, where workflow efficiency is paramount. Phase 4 will achieve organization-wide deployment, including integration with all remaining systems and continuous monitoring for optimization opportunities.

The solution will include real-time monitoring dashboards displaying authentication metrics such as success rates, failure patterns, average authentication time, emergency access invocations, and security anomalies. Automated alerting will notify security teams of suspicious authentication patterns that may indicate compromised credentials or unauthorized access attempts. The framework will also incorporate comprehensive training modules tailored to different user roles, including interactive demonstrations, workflow simulations, and quick reference guides. Technical documentation will provide detailed architecture specifications, API references, troubleshooting procedures, and governance templates for ongoing policy management.

Success will be measured through quantifiable metrics including reduction in authentication-related help desk tickets (target: 40% decrease), improvement in mean time to authenticate (target: under 15 seconds for routine access), achievement of 100% HIPAA MFA compliance, reduction in security incidents related to authentication (target: 60% decrease), and user satisfaction scores above 4.0 on a 5-point scale. By addressing both security imperatives and clinical workflow realities, this Healthcare-Optimized Multi-Factor Authentication Framework will demonstrate how emerging technologies can be thoughtfully integrated to solve complex organizational challenges while respecting user needs and operational constraints.

---

## Specific Learning Objectives and MSIT Program Learning Outcomes Alignment

### PLO 1: Apply IT Principles to Complex Problems

This capstone project applies foundational cybersecurity principles from **MSIT 5270 (Foundations of Cybersecurity)**, including threat modeling, risk assessment, and defense-in-depth strategies, to analyze multi-dimensional healthcare authentication challenges. It integrates cryptographic concepts from **MSIT 5210 (Computer Security)**, such as public key infrastructure and hash functions, to ensure authentication credential integrity. Database security principles from **MSIT 5100 (Database Systems)** inform the design of secure credential storage and audit logging mechanisms. The project synthesizes concepts from multiple disciplines—including algorithms for adaptive risk scoring, cybersecurity frameworks like NIST SP 800-63B and HITRUST, healthcare regulatory compliance requirements, and organizational behavior insights about technology adoption—to address technical, regulatory, operational, and human factors simultaneously.

### PLO 2: Design and Evaluate Solutions Using Best Practices

The HO-MFA Framework adheres to industry-recognized best practices and standards including NIST SP 800-63B (Digital Identity Guidelines), OWASP Authentication Cheat Sheet, FIDO2/WebAuthn specifications for passwordless authentication, and HITRUST Common Security Framework (CSF) for healthcare cybersecurity. The design incorporates zero-trust architecture principles that assume no implicit trust based on network location, defense-in-depth layering with multiple security controls, and least-privilege access principles that grant only necessary permissions. Evaluation methodology will employ both quantitative metrics (authentication success rates, mean time to authenticate, security incident reduction) and qualitative assessments (user satisfaction surveys, workflow observations) to comprehensively assess solution effectiveness. The project applies design thinking principles from **MSIT 5600 (Foundations of Human-Computer Interaction)** to ensure solutions are user-centered and address real workflow needs rather than imposing technology for technology's sake.

### PLO 3: Analyze User Needs in Solution Development

User needs analysis will employ multiple methodologies including contextual inquiry to observe clinicians in their natural work environments, semi-structured interviews with representatives from each stakeholder group, usability testing sessions with prototype authentication flows, and persona development to represent diverse user archetypes. Stakeholders encompass clinicians (physicians, nurses, specialists), administrative staff (billing, scheduling, records management), IT security personnel, compliance officers, and patients whose data is being protected. The solution prioritizes usability to prevent insecure workarounds that commonly occur when security measures frustrate legitimate users. By understanding that a physician may need to access patient records 50-100 times during a shift, the framework optimizes for rapid repeated authentication while maintaining security, demonstrating how technical solutions must adapt to human factors and operational realities rather than expecting users to adapt to poorly designed systems.

### PLO 4: Assess Ethical Considerations in IT Systems

This project engages with significant ethical considerations at the intersection of patient privacy, security, and access. The emergency access protocol addresses the ethical tension between maintaining strict access controls to protect patient privacy and enabling immediate access during life-threatening situations when authentication delays could harm patients. Ethical concerns include ensuring equitable access to authentication technologies across diverse user populations with varying technical literacy and physical abilities, maintaining transparency about authentication monitoring while respecting legitimate privacy expectations, balancing institutional security needs with individual autonomy in authentication method selection, and ensuring that security measures do not disproportionately burden certain user groups or create barriers to care. The project applies ethical frameworks from **MSIT 5400 (Management and Leadership)** including beneficence (solutions that promote good outcomes), non-maleficence (avoiding harm to patients or providers), autonomy (respecting user agency), and justice (equitable distribution of burdens and benefits) to evaluate design decisions and policy choices.

### PLO 5: Construct Evidence-Based Arguments

All design decisions, technology selections, and implementation strategies will be supported by evidence from multiple authoritative sources. Peer-reviewed research publications provide theoretical foundations and empirical findings about authentication usability and security trade-offs. Industry reports from organizations like HIMSS (Healthcare Information and Management Systems Society), Ponemon Institute, Gartner, and Forrester offer data-driven insights into healthcare cybersecurity trends, breach costs, and technology adoption patterns. Regulatory guidance from HHS (Health and Human Services), NIST (National Institute of Standards and Technology), and industry frameworks like HITRUST establish compliance requirements and security baselines. Empirical data collected during implementation phases—including authentication metrics, user feedback, and security incident reports—will inform iterative refinements and validate design hypotheses. Project documentation will demonstrate proper APA citation format, logical argumentation structure, critical analysis of competing approaches, synthesis of diverse information sources, and professional technical writing tailored to audiences ranging from executive stakeholders to technical implementers.

---

**Word Count:** 1,487 words (excluding title, header, and references)

---

## References

Forrester Research. (2024). *The state of healthcare cybersecurity 2024*. Forrester Research, Inc.

Happiest Minds. (2025). *Strengthening healthcare cybersecurity: Navigating HIPAA compliance in 2025*. https://www.happiestminds.com/blogs/strengthening-healthcare-cybersecurity-navigating-hipaa-compliance-in-2025/

Healthcare IT News. (2024). *Clinician burnout and technology: Finding the balance*. HIMSS Media.

HHS Office for Civil Rights. (2024). *Breach portal: Notice to the Secretary of HHS breach of unsecured protected health information*. https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf

IBM Security. (2024). *Cost of a data breach report 2024*. IBM Corporation.

MetricStream. (2025). *2025 HIPAA updates: Key changes every organization must know*. https://metricstream.com/blog/hipaa-updates-2025-key-changes.html

NIST. (2024). *Digital identity guidelines: Authentication and lifecycle management (SP 800-63B)*. National Institute of Standards and Technology. https://pages.nist.gov/800-63-3/sp800-63b.html

OWASP. (2024). *Authentication cheat sheet*. Open Web Application Security Project. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
