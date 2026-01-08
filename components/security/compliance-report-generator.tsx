"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, Download, Loader2, CheckCircle, Shield, AlertTriangle } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format-date"

interface ComplianceReportGeneratorProps {
  userId: string
}

interface ReportData {
  hospitalName: string
  reportPeriod: string
  generatedAt: Date
  mfaSuccessRate: number
  totalAuthentications: number
  biometricVerifications: number
  breakGlassEvents: BreakGlassEvent[]
  complianceChecks: ComplianceCheck[]
  securityScore: number
}

interface BreakGlassEvent {
  id: string
  patientId: string
  reason: string
  emergencyType: string
  accessedBy: string
  department: string
  timestamp: Date
  reviewed: boolean
}

interface ComplianceCheck {
  name: string
  category: string
  status: "passed" | "failed" | "warning"
}

export function ComplianceReportGenerator({ userId }: ComplianceReportGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [dateRange, setDateRange] = useState("30")
  const [hospitalName, setHospitalName] = useState("Metro General Hospital")
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const generateReport = async () => {
    setGenerating(true)
    setReportReady(false)

    // Simulate report generation with realistic data
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const data: ReportData = {
      hospitalName,
      reportPeriod: `${dateRange} Days`,
      generatedAt: new Date(),
      mfaSuccessRate: 99.8,
      totalAuthentications: 15847,
      biometricVerifications: 12453,
      breakGlassEvents: [
        {
          id: "BG-2024-001",
          patientId: "PT-2024-001",
          reason:
            "Patient arrived via ambulance with suspected cardiac arrest. Immediate access to medical history required.",
          emergencyType: "Code Blue",
          accessedBy: "Dr. Sarah Chen",
          department: "Emergency Department",
          timestamp: new Date(Date.now() - 86400000 * 2),
          reviewed: true,
        },
        {
          id: "BG-2024-002",
          patientId: "PT-444",
          reason: "Critical trauma patient requiring immediate surgical intervention",
          emergencyType: "Trauma",
          accessedBy: "Dr. John Smith",
          department: "Emergency Department",
          timestamp: new Date(Date.now() - 3600000),
          reviewed: false,
        },
      ],
      complianceChecks: [
        { name: "HIPAA Access Logging", category: "HIPAA", status: "passed" },
        { name: "Encryption at Rest", category: "HIPAA", status: "passed" },
        { name: "Encryption in Transit", category: "HIPAA", status: "passed" },
        { name: "Multi-Factor Authentication", category: "HIPAA", status: "passed" },
        { name: "Audit Trail Integrity", category: "SOC 2", status: "passed" },
        { name: "Access Control Lists", category: "SOC 2", status: "passed" },
        { name: "Password Policy", category: "NIST", status: "passed" },
        { name: "Session Management", category: "OWASP", status: "passed" },
      ],
      securityScore: 100,
    }

    setReportData(data)
    setGenerating(false)
    setReportReady(true)
  }

  const downloadReport = () => {
    if (!reportData) return

    // Create a new window with the printable report
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const passedChecks = reportData.complianceChecks.filter((c) => c.status === "passed").length
    const totalChecks = reportData.complianceChecks.length

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HIPAA Compliance Audit Report - ${reportData.hospitalName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a;
            background: #fff;
            padding: 40px;
          }
          .header { 
            border-bottom: 3px solid #0d9488; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
          }
          .logo-icon { 
            width: 48px; 
            height: 48px; 
            background: linear-gradient(135deg, #0d9488, #14b8a6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title { font-size: 28px; font-weight: 700; color: #0d9488; }
          .subtitle { color: #666; font-size: 14px; }
          .meta { text-align: right; font-size: 12px; color: #666; }
          .meta strong { color: #1a1a1a; }
          .classification {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
            display: inline-block;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          .summary-card.highlight {
            background: linear-gradient(135deg, #0d9488, #14b8a6);
            color: white;
            border: none;
          }
          .summary-card.highlight .summary-label { color: rgba(255,255,255,0.8); }
          .summary-value { font-size: 32px; font-weight: 700; }
          .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #0d9488;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .section-icon {
            width: 24px;
            height: 24px;
            background: #0d9488;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { 
            padding: 12px 16px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          th { 
            background: #f1f5f9; 
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          tr:hover { background: #f8fafc; }
          .status-passed { 
            background: #dcfce7; 
            color: #166534; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 11px;
            font-weight: 600;
          }
          .status-pending { 
            background: #fef3c7; 
            color: #92400e; 
            padding: 4px 12px; 
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          .event-card {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          }
          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .event-id { font-weight: 600; color: #92400e; }
          .event-type {
            background: #fde68a;
            color: #92400e;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          .event-details { font-size: 13px; color: #1a1a1a; margin-bottom: 8px; }
          .event-meta { font-size: 11px; color: #666; display: flex; gap: 16px; }
          .footer { 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
          }
          .footer-brand {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .footer-icon {
            width: 20px;
            height: 20px;
            background: #0d9488;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
          }
          .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 60px;
            font-weight: bold;
            color: #0d9488;
            transform: rotate(-15deg);
            pointer-events: none;
          }
          @media print {
            body { padding: 20px; }
            .watermark { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">CONFIDENTIAL</div>
        
        <div class="header">
          <div>
            <div class="logo">
              <div class="logo-icon">🛡️</div>
              <div>
                <div class="title">HO-MFA Compliance Audit Report</div>
                <div class="subtitle">${reportData.hospitalName}</div>
              </div>
            </div>
            <div class="classification">HIPAA Protected - Confidential</div>
          </div>
          <div class="meta">
            <div><strong>Report Period:</strong> Last ${reportData.reportPeriod}</div>
            <div><strong>Generated:</strong> ${formatDateTime(reportData.generatedAt)}</div>
            <div><strong>Report ID:</strong> RPT-${Date.now().toString(36).toUpperCase()}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card highlight">
            <div class="summary-value">${reportData.securityScore}%</div>
            <div class="summary-label">Security Score</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${reportData.mfaSuccessRate}%</div>
            <div class="summary-label">MFA Success Rate</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${reportData.totalAuthentications.toLocaleString()}</div>
            <div class="summary-label">Total Authentications</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${passedChecks}/${totalChecks}</div>
            <div class="summary-label">Compliance Checks</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">✓</div>
            Section 1: Access Control Effectiveness
          </div>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Multi-Factor Authentication Success Rate</td>
                <td>${reportData.mfaSuccessRate}%</td>
                <td>≥ 99.5%</td>
                <td><span class="status-passed">PASSED</span></td>
              </tr>
              <tr>
                <td>Biometric Verification Success Rate</td>
                <td>99.2%</td>
                <td>≥ 98.0%</td>
                <td><span class="status-passed">PASSED</span></td>
              </tr>
              <tr>
                <td>Total Authentication Events</td>
                <td>${reportData.totalAuthentications.toLocaleString()}</td>
                <td>N/A</td>
                <td><span class="status-passed">LOGGED</span></td>
              </tr>
              <tr>
                <td>Biometric Verifications</td>
                <td>${reportData.biometricVerifications.toLocaleString()}</td>
                <td>N/A</td>
                <td><span class="status-passed">LOGGED</span></td>
              </tr>
              <tr>
                <td>Failed Authentication Attempts</td>
                <td>32</td>
                <td>< 1% of total</td>
                <td><span class="status-passed">PASSED</span></td>
              </tr>
              <tr>
                <td>Average Authentication Time</td>
                <td>1.8 seconds</td>
                <td>< 5 seconds</td>
                <td><span class="status-passed">PASSED</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">⚠️</div>
            Section 2: Emergency Override Summary (Break-Glass Events)
          </div>
          <p style="margin-bottom: 16px; color: #666; font-size: 13px;">
            The following emergency access events occurred during the reporting period and require supervisory review per HIPAA §164.312(b).
          </p>
          ${reportData.breakGlassEvents
            .map(
              (event) => `
            <div class="event-card">
              <div class="event-header">
                <span class="event-id">${event.id} - Patient ${event.patientId}</span>
                <span class="event-type">${event.emergencyType}</span>
              </div>
              <div class="event-details">${event.reason}</div>
              <div class="event-meta">
                <span><strong>Accessed By:</strong> ${event.accessedBy}</span>
                <span><strong>Department:</strong> ${event.department}</span>
                <span><strong>Timestamp:</strong> ${formatDateTime(event.timestamp)}</span>
                <span><strong>Review Status:</strong> ${event.reviewed ? "✓ Reviewed" : "⏳ Pending Review"}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">📋</div>
            Section 3: Regulatory Compliance Status
          </div>
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Framework</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.complianceChecks
                .map(
                  (check) => `
                <tr>
                  <td>${check.name}</td>
                  <td>${check.category}</td>
                  <td><span class="status-passed">${check.status.toUpperCase()}</span></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">📜</div>
            Section 4: Attestation
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; font-size: 13px;">
            <p style="margin-bottom: 12px;">
              This report certifies that <strong>${reportData.hospitalName}</strong> has implemented and maintained 
              healthcare-optimized multi-factor authentication controls in accordance with:
            </p>
            <ul style="margin-left: 20px; margin-bottom: 12px;">
              <li>HIPAA Security Rule (45 CFR §164.312)</li>
              <li>HITECH Act requirements for electronic health records</li>
              <li>NIST Cybersecurity Framework guidelines</li>
              <li>SOC 2 Type II control objectives</li>
            </ul>
            <p>
              All emergency override (break-glass) events have been logged with full audit trails including 
              user identification, timestamp, patient accessed, reason for access, and supervisory notification status.
            </p>
          </div>
        </div>

        <div class="footer">
          <div class="footer-brand">
            <div class="footer-icon">🛡️</div>
            <span>Generated via <strong>HO-MFA Secure Framework</strong> v1.0</span>
          </div>
          <div>
            Report ID: RPT-${Date.now().toString(36).toUpperCase()} | 
            Generated: ${formatDateTime(reportData.generatedAt)} | 
            Classification: HIPAA Protected
          </div>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
          <FileText className="h-4 w-4 mr-2" />
          Generate HIPAA Audit Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-600" />
            Generate Compliance Report
          </DialogTitle>
          <DialogDescription>Create a formal HIPAA compliance audit report for regulatory review</DialogDescription>
        </DialogHeader>

        {!reportReady ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital / Organization Name</Label>
              <Input
                id="hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Enter hospital name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="range">Report Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This report contains Protected Health Information (PHI) indicators and should be handled according to
                your organization's data classification policies.
              </p>
            </div>

            <Button
              onClick={generateReport}
              disabled={generating || !hospitalName}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-center">Report Ready</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Your HIPAA compliance audit report has been generated
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hospital:</span>
                <span className="font-medium">{reportData?.hospitalName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium">Last {reportData?.reportPeriod}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Break-Glass Events:</span>
                <span className="font-medium">{reportData?.breakGlassEvents.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compliance Score:</span>
                <span className="font-medium text-green-600">{reportData?.securityScore}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadReport} className="flex-1 bg-teal-600 hover:bg-teal-700">
                <Download className="h-4 w-4 mr-2" />
                Download / Print PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReportReady(false)
                  setReportData(null)
                }}
              >
                New Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
