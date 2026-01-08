# MSIT 5910-01 - AY2026-T2
# Portfolio Activity Unit 3: Project Implementation Plan – Resource Identification and Management

**Student:** Johnson Mabgwe
**Course:** MSIT 5910 – Capstone Project
**Date:** December 2025
**Word Count:** 1,245 (excluding references)

---

## 1. Introduction

The successful implementation of any IT project depends on the systematic identification, allocation, and management of resources. As Ahmed (2011) notes, "effective management of human and financial resources is essential for project success" (Chapter 1). This report details the comprehensive resource identification process for my Healthcare-Optimized Multi-Factor Authentication (HO-MFA) capstone project, which aims to design an adaptive authentication system that balances stringent security requirements with the clinical workflow efficiency demanded in healthcare environments. The following sections provide a detailed explanation of all identified resources, the challenges encountered during the identification process, and a step-by-step framework for effective resource management.

---

## 2. Detailed Explanation of Identified Resources

Resource identification for the HO-MFA project followed the taxonomy established by BCcampus (2014), which categorizes project resources into four primary domains: hardware, software, human, and financial. Each category is essential to the project's success and is justified below with specific examples.

### 2.1 Hardware Resources

Hardware resources form the physical infrastructure upon which the HO-MFA system operates. The following components have been identified:

| Hardware Component | Specification | Justification |
|--------------------|---------------|---------------|
| **FIDO2 Security Keys** | YubiKey 5 NFC | Industry-standard passwordless authentication; HIPAA-compliant (FIDO Alliance, 2024) |
| **Biometric Scanners** | Fingerprint sensors (Suprema BioMini) | Enables rapid clinician authentication without password entry |
| **Development Workstation** | 32GB RAM, Intel i7, 1TB SSD | Sufficient processing power for testing adaptive authentication algorithms |
| **Test Server Environment** | Azure Virtual Machine (D4s v3) | Cloud-based infrastructure for scalable pilot testing |

The selection of FIDO2 keys, for example, is justified by their resistance to phishing attacks and their compliance with healthcare security standards (Yubico, 2024). Biometric scanners address the "sterile glove problem" identified in clinical settings, where clinicians cannot type passwords during procedures.

### 2.2 Software Resources

Software resources encompass the applications, platforms, and tools required for development, testing, and deployment:

| Software Component | Purpose | Licensing |
|--------------------|---------|-----------|
| **Microsoft Azure Active Directory** | Identity and access management | Enterprise subscription |
| **Visual Studio Code** | Integrated development environment | Open-source (free) |
| **Postman** | API testing and validation | Free tier |
| **OWASP ZAP** | Security vulnerability scanning | Open-source (free) |
| **Jira** | Project management and sprint tracking | Educational license |

The combination of commercial (Azure AD) and open-source (OWASP ZAP) tools reflects a cost-optimization strategy that maximizes functionality while minimizing licensing expenses. As Watt (2014) emphasizes, "the project budget must account for both direct and indirect costs" (Chapter 12), and leveraging open-source tools reduces the financial burden without compromising quality. **It is important to note that while open-source tools carry no licensing fees, they do incur indirect costs in the form of Human Resource time for installation, configuration, and ongoing maintenance.** For example, configuring OWASP ZAP for healthcare-specific vulnerability scanning is estimated to require 8-10 hours of developer time, which is accounted for in the Human Resources allocation rather than the Software budget.

### 2.3 Human Resources

Human resources represent the intellectual capital driving the project. Ahmed (2011) defines these as "the individuals involved in developing the software, such as developers, project managers, testers, and designers" (Chapter 1). For the HO-MFA project, the following roles have been identified:

| Role | Responsibility | Estimated Hours |
|------|----------------|-----------------|
| **Project Manager (Self)** | Overall coordination, timeline management, stakeholder communication | 120 hours |
| **Security Analyst (Consultant)** | HIPAA compliance review, penetration testing | 40 hours |
| **Clinical Advisor (Dr. Chen)** | Workflow validation, usability feedback | 20 hours |
| **QA Tester** | Functional and regression testing | 30 hours |

The inclusion of a Clinical Advisor is particularly critical. As Freed Associates (2024) notes, healthcare IT projects must adopt a "patient-centric, adaptive, interdisciplinary" approach, and direct clinical input ensures that the authentication system does not disrupt emergency care workflows.

### 2.4 Financial Resources

Financial resources define the monetary constraints within which the project operates. The HO-MFA project budget is structured as follows:

| Budget Category | Estimated Cost (USD) | Percentage |
|-----------------|----------------------|------------|
| Hardware Procurement | $1,500 | 25% |
| Software Licenses | $1,200 | 20% |
| Human Resources (Consultant Fees) | $2,400 | 40% |
| Contingency Reserve | $900 | 15% |
| **Total** | **$6,000** | **100%** |

**Note on Budget Simulation:** For the purpose of this implementation plan, the budget represents a simulated real-world deployment scenario. The Security Analyst consultant fee of $2,400 reflects industry-standard rates for HIPAA compliance expertise (approximately $60/hour for 40 hours) and demonstrates the financial planning required for enterprise-scale deployment. In the academic capstone context, the student serves as the primary contributor, with the consultant role representing the type of external expertise that would be engaged in a production healthcare environment.

The 15% contingency reserve aligns with PMI (2021) best practices, which recommend a 10-20% buffer for unforeseen expenses. This reserve proved essential when initial cost estimates for FIDO2 keys exceeded projections due to supply chain delays.

---

## 3. Challenges Faced During Resource Identification

The resource identification process was not without obstacles. Three primary challenges emerged:

### 3.1 Talent Scarcity

Nifty PM (2024) identifies the "talent drought" as a significant challenge in healthcare IT projects. Finding a security analyst with both HIPAA expertise and adaptive authentication experience proved difficult. The solution involved engaging a consultant on a part-time basis rather than seeking a full-time team member, thereby balancing cost and expertise.

### 3.2 Budget Constraints

As a capstone project with limited funding, trade-offs were necessary. For example, the original plan included dedicated hardware servers for testing, but budget constraints necessitated a pivot to cloud-based Azure Virtual Machines, which offered scalability at lower upfront costs. This aligns with TrueProject Insight's (2024) assertion that budget planning "enables confident decision-making" by forcing prioritization.

### 3.3 Stakeholder Availability

Clinical advisors, such as Dr. Chen, have demanding schedules that limit their availability for project consultations. To address this, I implemented asynchronous communication methods (email questionnaires, recorded video demonstrations) to capture feedback without requiring synchronous meetings. AIHCP (2024) emphasizes that "managing diverse stakeholders" is a common challenge in healthcare projects, and flexible communication strategies are essential.

---

## 4. Step-by-Step Framework for Effective Resource Management

Effective resource management requires a structured approach that spans the entire project lifecycle. The following six-step framework guides the HO-MFA project:

### Step 1: Resource Inventory Creation
Compile a comprehensive inventory of all identified resources (hardware, software, human, financial) using a Resource Breakdown Structure (RBS). This inventory serves as the "single source of truth" for resource availability (BCcampus, 2014, Chapter 11).

### Step 2: Resource Calendar Development
Create a resource calendar that maps personnel availability against the project schedule. For example, the Security Analyst's 40 hours are concentrated in Weeks 6-8 during the penetration testing phase, ensuring alignment with the project Gantt chart.

### Step 3: Budget Baseline Establishment
Establish a cost baseline against which actual expenditures are tracked. Any variance exceeding 10% triggers a formal change request process, ensuring financial discipline (Watt, 2014, Chapter 12).

### Step 4: Risk-Based Contingency Allocation
Allocate contingency reserves to high-risk resource categories. For HO-MFA, hardware procurement was identified as high-risk due to supply chain volatility, justifying a dedicated buffer.

### Step 5: Continuous Monitoring and Earned Value Analysis
Implement Earned Value Management (EVM) to track resource consumption against planned baselines. Key metrics include Cost Performance Index (CPI) and Schedule Performance Index (SPI), which provide early warning of budget or schedule overruns (PMI, 2021).

### Step 6: Adaptive Reallocation
Based on monitoring data, dynamically reallocate resources to address bottlenecks. For example, if pilot testing reveals performance issues, additional developer hours can be shifted from documentation to optimization tasks.

---

## 5. Conclusion

Resource identification and management are foundational to the success of the HO-MFA capstone project. By systematically categorizing resources into hardware, software, human, and financial domains, and by applying a structured six-step management framework, the project is positioned to achieve its objectives within established constraints. The challenges encountered—talent scarcity, budget limitations, and stakeholder availability—were addressed through pragmatic strategies such as consultant engagement, cloud migration, and asynchronous communication. As the project progresses, continuous monitoring and adaptive reallocation will ensure that resources remain aligned with evolving requirements.

---

## References

Ahmed, A. (2011). *Software project management: A process-driven approach*. Auerbach Publishers.

AIHCP. (2024). *Top strategies for healthcare resource management success*. https://aihcp.net/2024/08/08/top-strategies-for-healthcare-resource-management-success/

BCcampus. (2014). Resource planning. In A. Watt, *Project management* (2nd ed., Chapter 11). BCcampus Open Education. https://opentextbc.ca/projectmanagement/

FIDO Alliance. (2024). *FIDO2: Web authentication (WebAuthn)*. https://fidoalliance.org/fido2/

Freed Associates. (2024). *Nine best practices in healthcare IT project management*. https://www.freedassociates.com/knowledge-center/healthcare-it-project-management-best-practices/

Nifty PM. (2024). *7 healthcare project management challenges & their solutions*. https://niftypm.com/blog/healthcare-project-management-challenges-and-solutions/

Project Management Institute. (2021). *A guide to the project management body of knowledge (PMBOK guide)* (7th ed.). PMI.

TrueProject Insight. (2024). *Effective budget planning: Key to project success*. https://www.trueprojectinsight.com/blog/project-office/budget-planning

Watt, A. (2014). Budget planning. In *Project management* (2nd ed., Chapter 12). BCcampus Open Education. https://opentextbc.ca/projectmanagement/

Yubico. (2024). *YubiKey 5 series: Enterprise-grade security*. https://www.yubico.com/products/yubikey-5-overview/
