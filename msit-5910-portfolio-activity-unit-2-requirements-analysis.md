# MSIT 5910-01 Portfolio Activity Unit 2

**Topic:** Requirement Analysis and Project Timeline (Implementation Plan)
**Project:** Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework
**Word Count:** ~750 words

## 1. Introduction
Following the identification of the problem in Unit 1—the conflict between rigorous security mandates and rapid clinical workflows—this Portfolio Activity focuses on the planning phase for the **Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework**. This report details the methodology for requirements analysis, utilizing specific elicitation techniques to bridge the gap between technical compliance (HIPAA) and user experience. Furthermore, it presents a comprehensive project timeline using a Gantt chart to track milestones from inception to final deployment.

## 2. Conducting Requirement Analysis
Requirement Analysis is the process of defining the expectations of stakeholders to ensure the final product solves the correct problem. For the HO-MFA project, relying solely on documentation is insufficient because clinical workflows often deviate from written policy ("work-as-imagined" vs. "work-as-done"). Therefore, I will conduct requirement analysis using a **Hybrid Strategy** combining Contextual Inquiry with the Volere Requirements Specification Template.

### Root Cause Analysis (Fishbone Diagram)
Before defining requirements, I utilized a Fishbone Diagram to understand the root causes of current authentication failures.

\`\`\`mermaid
graph LR
    subgraph "Environment"
    E1[High-Stress ER] --> E_Line
    E2[Shared Workstations] --> E_Line
    E3[Sterile Zones] --> E_Line
    end

    subgraph "Technology"
    T1[Legacy EHR] --> T_Line
    T2[Lack of Biometrics] --> T_Line
    T3[Slow Hardware] --> T_Line
    end

    subgraph "People"
    P1[Clinician Burnout] --> P_Line
    P2[Password Fatigue] --> P_Line
    P3[Training Gaps] --> P_Line
    end

    subgraph "Process"
    M1[Complex Workflows] --> M_Line
    M2[Frequent Re-auth] --> M_Line
    M3[Manual Entry] --> M_Line
    end

    E_Line((Environment)) --> Spine
    T_Line((Technology)) --> Spine
    P_Line((People)) --> Spine
    M_Line((Process)) --> Spine

    Spine ==> Problem[RESULT:<br/>Auth Failures]

    style Problem fill:#f96,stroke:#333,stroke-width:4px
\`\`\`

**Figure 1: Root Cause Analysis.** The diagram reveals that "People" issues like burnout are exacerbated by "Technology" issues like slow hardware. This analysis dictates that our requirements must focus heavily on speed and usability (e.g., biometric login) to alleviate cognitive load.

## 3. Techniques for Requirement Analysis
To ensure a 360-degree view of the system needs, I will employ a "Triangulation" approach, using three distinct techniques to cross-verify data:

1.  **Semi-Structured Interviews (Expert Elicitation):**
    I will conduct one-on-one interviews with high-level stakeholders, specifically **Dr. Chen (Chief Medical Officer)** to understand clinical urgencies, and **Sarah Jenkins (CISO)** to define HIPAA audit constraints. This technique allows for deep diving into "why" certain protocols exist.

2.  **Contextual Inquiry (Shadowing):**
    I will observe nurses in the ICU during their shifts. This is crucial for capturing non-functional requirements that users might forget to mention in surveys, such as "The MFA reader must be accessible while wearing sterile gloves."

3.  **Agile User Stories:**
    Requirements will be documented as User Stories to keep the focus on value.
    *   *Example:* "As an ER Physician, I want to authenticate using facial recognition so that I can access patient records immediately without touching a keyboard during a trauma case."

**Table 1: Requirements Traceability Matrix (RTM) Sample**

| Req ID | User Story | Source | Priority | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | "Break-glass" access in < 3 seconds. | Dr. Chen (CMO) | **Critical** | Latency Testing |
| **REQ-02** | Biometric auth (Face/Fingerprint). | ICU Nurses | **High** | User Acceptance Test |
| **REQ-03** | Immutable audit logs (6-year retention). | Sarah Jenkins (CISO) | **Critical** | Security Audit |
| **REQ-04** | Suppress MFA on trusted internal networks. | IT Ops Team | Medium | Network Simulation |

## 4. Key Points for Preparing a Project Timeline
Creating a project timeline for a healthcare IT project requires acknowledging specific constraints. My timeline planning is based on the following key points:

*   **Critical Path Method (CPM):** I identified the longest sequence of dependent tasks. For HO-MFA, the procurement of **FIDO2 Hardware Keys** is a long-lead item. This task must start in Week 2 to avoid delaying the Pilot Phase in Week 7.
*   **Phased Rollout:** To minimize risk, the timeline includes a "Pilot Testing" phase in a single department (ICU) before full rollout. This allows us to catch bugs without disrupting the entire hospital.
*   **Buffer Management:** Following Goldratt’s (2024) principles, I have added a "Project Buffer" of 1 week before final submission to account for inevitable clinical emergencies that might divert IT resources.

## 5. Project Timeline Template (Gantt Chart)
Below is the visual representation of the 12-week implementation plan for the HO-MFA Framework.

\`\`\`mermaid
gantt
    title HO-MFA Project Timeline (MSIT 5910)
    dateFormat  YYYY-MM-DD
    axisFormat  Wk %W
    
    section Phase 1: Inception
    Problem ID & Charter        :done,    init1, 2025-11-13, 7d
    Stakeholder Interviews      :active,  init2, 2025-11-20, 7d
    Milestone: Proposal Approved :crit,   ms1, 2025-11-27, 0d

    section Phase 2: Planning
    Requirements (Volere)       :         plan1, 2025-11-27, 7d
    Risk Assessment (HIPAA)     :         plan2, 2025-12-04, 7d
    Procure FIDO2 Keys          :         plan3, 2025-12-04, 14d
    Milestone: Design Locked    :crit,    ms2, 2025-12-11, 0d

    section Phase 3: Execution
    Dev: Adaptive Engine Logic  :         exec1, 2025-12-11, 14d
    Dev: Biometric Integration  :         exec2, 2025-12-18, 14d
    Pilot Testing (ICU Dept)    :         exec3, 2026-01-01, 14d
    Milestone: Beta Ready       :crit,    ms3, 2026-01-15, 0d

    section Phase 4: Closure
    Security Audit & Pen Test   :         close1, 2026-01-15, 7d
    Final Report Writing        :         close2, 2026-01-15, 10d
    Milestone: Project Submission :crit,  ms4, 2026-01-29, 0d
\`\`\`

**Figure 2: HO-MFA Project Timeline.** The Gantt chart visualizes the critical path. Note the specific allocation of 2 weeks for "Pilot Testing (ICU Dept)"—this is the most critical validation step. The "Procure FIDO2 Keys" task runs parallel to Requirement Analysis to save time.

## 6. Conclusion
This detailed requirements analysis and project timeline provide a robust roadmap for the HO-MFA Capstone Project. By employing techniques like Contextual Inquiry, I ensure the solution meets the real-world needs of clinicians like Dr. Chen. By adhering to the Gantt chart and monitoring critical milestones like "Pilot Testing," I can deliver a compliant, secure, and usable authentication framework within the academic timeframe.

## References
*   Goldratt, E. M. (2024). *Critical Chain*. North River Press.
*   HHS. (2024). *Health Industry Cybersecurity Practices: Managing Threats and Protecting Patients*. U.S. Department of Health and Human Services.
*   HIMSS. (2025). *2025 HIMSS Healthcare Cybersecurity Survey*. Healthcare Information and Management Systems Society.
*   Holtzblatt, K., & Beyer, H. (2024). *Contextual Design: Design for Life* (3rd ed.). Morgan Kaufmann.
*   Kerzner, H. (2024). *Project Management: A Systems Approach to Planning, Scheduling, and Controlling* (14th ed.). Wiley.
*   NIST. (2024). *NIST Special Publication 800-63B: Digital Identity Guidelines*. National Institute of Standards and Technology.
*   Robertson, S., & Robertson, J. (2024). *Mastering the Requirements Process: Getting Requirements Right* (4th ed.). Addison-Wesley Professional.
*   Wiegers, K., & Beatty, J. (2024). *Software Requirements* (4th ed.). Microsoft Press.
