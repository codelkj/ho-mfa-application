# MSIT 5910-01 - AY2026-T2: Identity Verification Assignment Unit 4
## Capstone Progress Report: Software Requirements and Design Specification

**Student:** Johnson Mabgwe  
**Course:** MSIT 5910-01 Capstone Project  
**Unit:** 4 - Project Implementation Plan: Part 2  
**Project:** Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework

---

## Video Script and Documentation

### Part 1: Introduction and ID Verification (0:00 - 0:30)

*[Face camera directly]*

"Hello, my name is Johnson Mabgwe, and I am a graduate student in the Master of Science in Information Technology program at the University of the People. I am presenting my Identity Verification Assignment for Unit 4 of MSIT 5910 Capstone Project."

*[Hold government-issued ID clearly in front of camera for 5-10 seconds]*

"Here is my government-issued identification for verification purposes."

*[Return focus to camera]*

---

## Part 2: Software Requirements Specification (0:30 - 4:00)

### Question 1: Identify the List of Software Requirements for Your Capstone Project

The Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework requires a comprehensive set of software components organized into five categories: core authentication services, integration middleware, database systems, monitoring infrastructure, and security testing tools.

#### 2.1 Core Authentication Service Requirements

| **Requirement ID** | **Software Component** | **Purpose** | **Justification** |
|-------------------|------------------------|-------------|-------------------|
| SR-001 | Python 3.11+ | Backend authentication service development | Industry-standard language with extensive security libraries (cryptography, PyJWT) and healthcare IT adoption; aligns with Unit 2 implementation plan specifying Python-based microservices |
| SR-002 | Flask 3.0 Framework | RESTful API development | Lightweight, HIPAA-compliant implementations documented in healthcare IT literature |
| SR-003 | python-saml Library | SAML 2.0 service provider implementation | Required for Epic/Cerner EHR single sign-on integration |
| SR-004 | PyJWT Library | JSON Web Token handling | OAuth 2.0 token generation and validation for stateless authentication |
| SR-005 | bcrypt Library | Password hashing | OWASP-recommended cryptographic hashing with configurable work factors |

**Table 1:** Core Authentication Software Requirements

**Example Justification:** The selection of Python with Flask aligns with healthcare industry practices where regulatory compliance documentation is essential. Flask's modular architecture enables the separation of authentication logic, audit logging, and emergency access protocols into discrete, testable components. For instance, the adaptive risk scoring algorithm can be implemented as an independent Flask Blueprint, allowing isolated unit testing of the machine learning model without affecting core authentication flows. This choice maintains consistency with the technology stack defined in Unit 2's resource allocation plan.

#### 2.2 Database and Storage Requirements

| **Requirement ID** | **Software Component** | **Purpose** | **Justification** |
|-------------------|------------------------|-------------|-------------------|
| SR-006 | PostgreSQL 15 | Relational database for audit logs and configuration | ACID compliance ensures audit log integrity; JSON support enables flexible event schema |
| SR-007 | SQLAlchemy ORM | Database abstraction layer | Prevents SQL injection through parameterized queries; simplifies schema migrations |
| SR-008 | Alembic | Database migration management | Version-controlled schema changes supporting HIPAA audit requirements |

**Table 2:** Database Software Requirements

**Example Justification:** PostgreSQL's robust indexing capabilities are essential for the HO-MFA audit logging infrastructure. The system will generate approximately 10,000 authentication events daily across clinical users, requiring efficient query performance for real-time monitoring dashboards and compliance reporting. PostgreSQL's B-tree indexes on timestamp and user_id columns will enable sub-second query response times for audit investigations.

#### 2.3 Integration Middleware Requirements

| **Requirement ID** | **Software Component** | **Purpose** | **Justification** |
|-------------------|------------------------|-------------|-------------------|
| SR-009 | Epic FHIR API Sandbox | EHR authentication integration testing | Industry-leading EHR with documented SAML 2.0 integration endpoints |
| SR-010 | Cerner Millennium API Sandbox | Multi-vendor EHR compatibility validation | Demonstrates framework portability across healthcare IT ecosystems |
| SR-011 | python-ldap Library | Active Directory integration | Required for enterprise user directory synchronization |

**Table 3:** Integration Middleware Requirements

**Example Justification:** The Epic FHIR API sandbox provides a realistic testing environment that mirrors production authentication workflows without exposing actual patient data. This sandbox enables validation of SAML assertion handling, session timeout enforcement, and single logout functionality—all critical requirements for clinical SSO integration.

#### 2.4 Biometric Authentication Requirements

| **Requirement ID** | **Software Component** | **Purpose** | **Justification** |
|-------------------|------------------------|-------------|-------------------|
| SR-012 | OpenCV 4.x | Facial recognition processing | Open-source computer vision library with extensive healthcare research applications |
| SR-013 | PyFingerprint Library | Fingerprint scanner integration | Enables hands-free authentication essential for clinical workflows |
| SR-014 | TensorFlow Lite | Edge inference for biometric matching | Enables on-device biometric processing without cloud dependency; critical for offline authentication during network outages in clinical environments where EHR access cannot be interrupted |

**Table 4:** Biometric Authentication Requirements

**Example Justification:** OpenCV's facial recognition capabilities address the healthcare-specific requirement for contactless authentication. During COVID-19, healthcare facilities identified touch-based authentication as an infection vector; facial recognition enables authentication without physical contact, supporting clinical infection control protocols. TensorFlow Lite specifically enables edge inference—processing biometric data locally on clinical workstations rather than sending it to cloud servers. This architectural decision addresses three critical healthcare requirements: (1) **latency reduction** to sub-3-second authentication during emergency scenarios, (2) **offline capability** ensuring authentication continues during network outages that would otherwise block EHR access during patient emergencies, and (3) **data residency compliance** by keeping biometric templates on-premises per institutional security policies.

#### 2.5 Monitoring and Security Requirements

| **Requirement ID** | **Software Component** | **Purpose** | **Justification** |
|-------------------|------------------------|-------------|-------------------|
| SR-015 | Grafana 10.x | Real-time authentication metrics dashboard | Visualization of authentication success rates, failed attempts, emergency access usage |
| SR-016 | Prometheus | Time-series metrics collection | Efficient storage and querying of authentication latency measurements |
| SR-017 | ELK Stack | Audit log analysis and compliance reporting | Full-text search across authentication events for security investigations |
| SR-018 | OWASP ZAP | Web application security scanning | Automated vulnerability detection following OWASP Testing Guide methodology |

**Table 5:** Monitoring and Security Requirements

**Example Justification:** Grafana dashboards will display real-time authentication metrics aligned with 2025 HIPAA Security Rule requirements. The dashboard will include panels showing: authentication success rate by user role (target: >99%), Mean Time to Authenticate (target: <5 seconds), emergency "break-glass" access frequency, and failed login attempt patterns indicating potential brute force attacks.

---

## Part 3: Software Design Document (4:00 - 8:00)

### Question 2: Create a Software Design Document with All Key Elements

The HO-MFA Software Design Document (SDD) provides comprehensive architectural guidance for implementing the authentication framework. The document follows IEEE 1016 standards for software design descriptions.

#### 3.1 System Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                    HO-MFA SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Clinical   │    │    Admin     │    │   Security   │              │
│  │   Workstation│    │    Portal    │    │   Dashboard  │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                   │                       │
│         └───────────────────┴───────────────────┘                       │
│                             │                                           │
│                    ┌────────▼────────┐                                  │
│                    │   API Gateway   │                                  │
│                    │  (Rate Limiting)│                                  │
│                    └────────┬────────┘                                  │
│                             │                                           │
│  ┌──────────────────────────┴──────────────────────────┐               │
│  │              AUTHENTICATION SERVICE LAYER            │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │               │
│  │  │   Primary   │  │  Biometric  │  │  Emergency  │  │               │
│  │  │    Auth     │  │    Auth     │  │ Break-Glass │  │               │
│  │  │   Module    │  │   Module    │  │   Module    │  │               │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │               │
│  │                                                      │               │
│  │  ┌─────────────────────────────────────────────┐    │               │
│  │  │         ADAPTIVE RISK SCORING ENGINE         │    │               │
│  │  │  (Context: Role, Location, Device, Time)     │    │               │
│  │  └─────────────────────────────────────────────┘    │               │
│  └──────────────────────────┬──────────────────────────┘               │
│                             │                                           │
│  ┌──────────────────────────┴──────────────────────────┐               │
│  │                 INTEGRATION LAYER                    │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │               │
│  │  │  SAML 2.0   │  │   Active    │  │  EHR API    │  │               │
│  │  │   Handler   │  │  Directory  │  │  Adapter    │  │               │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │               │
│  └──────────────────────────┬──────────────────────────┘               │
│                             │                                           │
│  ┌──────────────────────────┴──────────────────────────┐               │
│  │                   DATA LAYER                         │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │               │
│  │  │ PostgreSQL  │  │   Redis     │  │  Prometheus │  │               │
│  │  │ (Audit Log) │  │  (Session)  │  │  (Metrics)  │  │               │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │               │
│  └─────────────────────────────────────────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

**Figure 1:** HO-MFA Three-Tier Architecture

#### 3.2 Key Design Elements

**Element 1: Component Descriptions**

| **Component** | **Responsibility** | **Technology** | **Interfaces** |
|---------------|-------------------|----------------|----------------|
| API Gateway | Request routing, rate limiting, TLS termination | Nginx + Lua | REST/HTTPS |
| Primary Auth Module | Username/password validation, token generation | Python/Flask | Internal API |
| Biometric Auth Module | Fingerprint/facial recognition processing | OpenCV, TensorFlow | USB/Camera SDK |
| Emergency Break-Glass | Immediate access with audit escalation | Python/Flask | Internal API |
| Risk Scoring Engine | Contextual authentication level determination | scikit-learn | Internal API |
| SAML Handler | SSO integration with Epic/Cerner | python-saml | SAML 2.0 |
| Audit Logger | Comprehensive authentication event capture | PostgreSQL | SQL |

**Table 6:** Component Responsibility Matrix

**Element 2: Data Flow Diagram - Standard Authentication**

\`\`\`
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│   API   │───▶│  Risk   │───▶│  Auth   │───▶│  EHR    │
│ Request │    │ Gateway │    │ Scoring │    │ Module  │    │ Access  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                  │                             │
                                  │         ┌─────────┐         │
                                  └────────▶│  Audit  │◀────────┘
                                            │   Log   │
                                            └─────────┘
\`\`\`

**Figure 2:** Standard Authentication Data Flow

**Element 3: Emergency "Break-Glass" Protocol Design**

The emergency access protocol addresses the healthcare-specific requirement for immediate ePHI access during life-threatening situations:

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│              EMERGENCY ACCESS DECISION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │   Clinician │────▶│  Emergency  │────▶│  IMMEDIATE  │        │
│  │   Request   │     │   Button    │     │   ACCESS    │        │
│  └─────────────┘     └──────┬──────┘     └──────┬──────┘        │
│                             │                   │                │
│                    ┌────────▼────────┐          │                │
│                    │  PARALLEL AUDIT │          │                │
│                    │    ACTIONS      │          │                │
│                    └────────┬────────┘          │                │
│         ┌───────────────────┼───────────────────┤                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │ High-Priority│   │  Supervisor │   │  Security   │            │
│  │  Audit Log  │   │ Notification│   │   Review    │            │
│  │   Created   │   │    Sent     │   │  Triggered  │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Figure 3:** Emergency Break-Glass Protocol Flow

**Element 4: Database Schema Design**

\`\`\`sql
-- Core Authentication Audit Log Schema
CREATE TABLE authentication_events (
    event_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id         VARCHAR(100) NOT NULL,
    user_role       VARCHAR(50) NOT NULL,
    auth_method     VARCHAR(30) NOT NULL,  -- 'password', 'fingerprint', 'facial', 'emergency'
    auth_result     VARCHAR(20) NOT NULL,  -- 'success', 'failure', 'locked'
    risk_score      INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    device_id       VARCHAR(100),
    ip_address      INET,
    location        VARCHAR(100),
    ehr_system      VARCHAR(50),           -- 'epic', 'cerner', 'meditech'
    emergency_flag  BOOLEAN DEFAULT FALSE,
    emergency_reason TEXT,
    session_id      UUID,
    
    -- Indexes for common query patterns
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id),
    INDEX idx_emergency (emergency_flag) WHERE emergency_flag = TRUE
);

-- Emergency Access Review Table
CREATE TABLE emergency_reviews (
    review_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES authentication_events(event_id),
    reviewer_id     VARCHAR(100),
    review_status   VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'flagged'
    review_notes    TEXT,
    reviewed_at     TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_pending (review_status) WHERE review_status = 'pending'
);
\`\`\`

**Figure 4:** PostgreSQL Schema for Audit Logging

**Element 5: API Endpoint Specification**

| **Endpoint** | **Method** | **Purpose** | **Authentication** |
|--------------|------------|-------------|-------------------|
| `/api/v1/auth/login` | POST | Primary authentication | None (public) |
| `/api/v1/auth/biometric` | POST | Biometric authentication | Session token |
| `/api/v1/auth/emergency` | POST | Emergency break-glass access | User credentials |
| `/api/v1/auth/logout` | POST | Session termination | Session token |
| `/api/v1/users/{id}/enroll` | POST | Biometric enrollment | Admin token |
| `/api/v1/audit/events` | GET | Audit log query | Security role |
| `/api/v1/metrics/dashboard` | GET | Real-time metrics | Authenticated |

**Table 7:** API Endpoint Specification

**Element 6: Security Architecture**

| **Security Layer** | **Implementation** | **Standard** |
|--------------------|-------------------|--------------|
| Transport Security | TLS 1.3 with HSTS | NIST SP 800-52 |
| Credential Storage | bcrypt (cost factor 12) | OWASP Guidelines |
| Token Security | JWT with RS256 signing | RFC 7519 |
| Session Management | Redis with 15-minute timeout | HIPAA requirement |
| Input Validation | Schema validation + sanitization | OWASP ASVS |
| Rate Limiting | 10 requests/minute per user | Brute force protection |

**Table 8:** Security Architecture Controls

#### 3.3 Design Rationale

The three-tier architecture separates presentation, business logic, and data concerns, enabling independent scaling and testing. The adaptive risk scoring engine implements Zero Trust principles by evaluating every authentication request against contextual factors rather than relying solely on network perimeter security. The emergency break-glass module embodies the ethical balance between security and patient safety by granting immediate access while creating comprehensive audit trails for post-hoc review.

---

## Part 4: Conclusion and Next Steps (8:00 - 8:30)

*[Face camera directly]*

"In summary, the HO-MFA Framework requires 18 distinct software components organized across authentication services, database systems, integration middleware, biometric processing, and security monitoring. The Software Design Document I have created includes all key elements: system architecture diagrams, component descriptions, data flow diagrams, database schema design, API specifications, and security architecture controls."

"As my project progresses, I will continue updating this design document to reflect implementation decisions and lessons learned. My next steps include completing the staging environment setup and beginning development of the core authentication service module."

"Thank you for your time and attention."

*[End recording]*

---

## References

BuiltIn. (2024). *What is a software requirement specification (SRS)?* https://builtin.com/articles/software-requirement-specification-meaning

Editorial Team. (n.d.). Software design document: What is it & how to create it! (template included). *BIT.AI Blog*. https://blog.bit.ai/software-design-document/

IEEE. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998). Institute of Electrical and Electronics Engineers.

IEEE. (2009). *IEEE standard for information technology—Systems design—Software design descriptions* (IEEE Std 1016-2009). Institute of Electrical and Electronics Engineers.

Krüger, G., & Lane, C. (2023, January 17). How to write a software requirements specification. *Perforce*. https://www.perforce.com/blog/alm/how-write-software-requirements-specification-srs-document

Lucid Content Team. (2024). How to create software design documents. *Lucidchart*. https://www.lucidchart.com/blog/how-to-write-a-software-design-document

NIST. (2017). *Digital identity guidelines: Authentication and lifecycle management* (SP 800-63B). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-63b

OWASP. (2024). *Authentication cheat sheet*. Open Web Application Security Project. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

Rosencrance, L. (2024). Software requirements specifications (SRS). *TechTarget*. https://www.techtarget.com/searchsoftwarequality/definition/software-requirements-specification

TimelyText. (2024). How to create an effective software design document (SDD). https://www.timelytext.com/how-to-create-an-effective-software-design-document-sdd/
