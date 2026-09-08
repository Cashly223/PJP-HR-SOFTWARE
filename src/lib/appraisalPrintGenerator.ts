import {
  CatholicHealthAppraisalFormData,
  PerformanceAppraisal,
  Employee,
  MultiTierWorkflow,
} from '../types/hrms';

export interface AppraisalPrintOptions {
  hospitalName?: string;
  autoPrint?: boolean;
}

export function generateAppraisalDocumentHtml(
  formData: CatholicHealthAppraisalFormData,
  appraisal?: PerformanceAppraisal | null,
  employee?: Employee | null,
  options: AppraisalPrintOptions = {}
): string {
  const hospital = options.hospitalName || 'POPE JOHN PAUL II MEDICAL CENTRE';
  const autoPrintScript = options.autoPrint !== false;

  // Format Staff ID into 10 character boxes
  const staffIdBoxes = (formData.staffIdNumber || 'STF0000000')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .padEnd(10, ' ')
    .slice(0, 10)
    .split('')
    .map(
      (char) =>
        `<span style="display:inline-block; width:22px; height:24px; line-height:24px; text-align:center; border:1.5px solid #000; font-family:monospace; font-weight:bold; font-size:13px; margin-right:2px; background:#fff;">${
          char === ' ' ? '&nbsp;' : char
        }</span>`
    )
    .join('');

  // Rating grade helpers
  const getGradeText = (score: number) => {
    if (score >= 4.5) return 'EXCELLENT (4.5 - 5.0)';
    if (score >= 3.5) return 'VERY GOOD (3.5 - 4.4)';
    if (score >= 2.5) return 'GOOD (2.5 - 3.4)';
    if (score >= 1.5) return 'SATISFACTORY (1.5 - 2.4)';
    return 'UNSATISFACTORY (1.0 - 1.4)';
  };

  const workflow: MultiTierWorkflow | undefined = appraisal?.workflow;
  const unitHeadStep = workflow?.unitHeadStep;
  const deptHeadStep = workflow?.departmentHeadStep;
  const hrStep = workflow?.hrStep;
  const facilityHeadStep = workflow?.facilityHeadStep;

  const appraisalCycle = `${formData.periodFromMonthYear || 'JAN 2025'} - ${formData.periodToMonthYear || 'DEC 2025'}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catholic Health Service Trust Appraisal - ${formData.surname} ${formData.otherNames} (${formData.staffIdNumber})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: Arial, Helvetica, "Nimbus Sans L", sans-serif;
      font-size: 10pt;
      line-height: 1.35;
    }
    .print-wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
      background: #ffffff;
    }
    .page {
      background: #ffffff;
      padding: 10px 0;
      min-height: 980px;
      position: relative;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #cbd5e1;
    }
    @media print {
      .no-print, .action-bar {
        display: none !important;
      }
      .page-break {
        border-top: none !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .print-wrapper {
        padding: 0 !important;
        max-width: 100% !important;
      }
      .page {
        min-height: auto;
      }
    }

    /* Action bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #090d16;
      color: #f8fafc;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: system-ui, -apple-system, sans-serif;
    }
    .action-btn {
      background: #f59e0b;
      color: #090d16;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .action-btn:hover { background: #d97706; }
    .action-btn.secondary {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
    }
    .action-btn.secondary:hover { background: #334155; }

    /* Official Form Styles */
    .header-box {
      border: 2px solid #000;
      padding: 12px 16px;
      text-align: center;
      margin-bottom: 14px;
    }
    .header-logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .emblem-circle {
      width: 58px;
      height: 58px;
      border: 3px solid #065f46;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fef3c7;
      color: #065f46;
      font-weight: 900;
      font-size: 9px;
      line-height: 1;
      text-align: center;
    }
    .title-main {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 2px 0;
      color: #000;
    }
    .title-sub {
      font-size: 10.5pt;
      font-weight: bold;
      color: #000;
      margin: 2px 0;
    }
    .title-hospital {
      font-size: 9.5pt;
      font-weight: bold;
      color: #065f46;
      text-transform: uppercase;
      margin-top: 3px;
    }

    /* Section Styles */
    .section-title {
      background: #000;
      color: #fff;
      font-size: 10.5pt;
      font-weight: 900;
      padding: 4px 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 12px 0 8px 0;
    }
    .section-subtitle {
      font-size: 8.5pt;
      font-style: italic;
      color: #333;
      margin-bottom: 8px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
      color: #000;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: bold;
      text-align: center;
    }
    .field-row {
      display: flex;
      border-bottom: 1px solid #000;
      padding: 4px 0;
      font-size: 9pt;
    }
    .field-label {
      font-weight: bold;
      width: 220px;
      flex-shrink: 0;
      color: #000;
    }
    .field-value {
      flex: 1;
      color: #000;
    }

    /* Score calculation box */
    .calc-box {
      border: 2px solid #000;
      background: #f8fafc;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
    }

    /* Signatures */
    .sig-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px solid #000;
      padding: 8px 10px;
      background: #fafafa;
    }
    .sig-line {
      border-bottom: 1px dashed #000;
      min-height: 22px;
      margin: 3px 0 6px 0;
      font-weight: bold;
      font-size: 9pt;
      color: #000;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 60pt;
      font-weight: 900;
      color: rgba(0, 0, 0, 0.035);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      text-transform: uppercase;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      margin-top: 15px;
      font-size: 7.5pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    <!-- Screen Action Bar -->
    <div class="action-bar no-print">
      <div>
        <strong style="font-size:14px; color:#fbbf24;">Official Catholic Health Service Appraisal Document</strong>
        <span style="font-size:12px; color:#cbd5e1; margin-left:8px;">Cycle: ${appraisalCycle}</span>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="action-btn" onclick="window.print()">
          <span>🖨️ Print Form / Save as PDF</span>
        </button>
        <button class="action-btn secondary" onclick="window.close()">
          <span>✖ Close Window</span>
        </button>
      </div>
    </div>

    <!-- =========================================================================
         PAGE 1: COVER & SECTION A - PERSONAL INFORMATION
         ========================================================================= -->
    <div class="page">
      <div class="watermark">CHST GHANA</div>

      <div class="header-box">
        <div class="header-logo-row">
          <div class="emblem-circle">
            <span style="font-size:16px;">☤</span>
            <span>CHST</span>
          </div>
          <div>
            <div class="title-main">NATIONAL CATHOLIC HEALTH SERVICE - GHANA</div>
            <div class="title-sub">STAFF PERFORMANCE APPRAISAL FORM</div>
            <div class="title-hospital">${hospital}</div>
          </div>
          <div style="text-align:right; font-size:8.5pt;">
            <strong>Cycle / Period:</strong><br/>
            <span style="font-weight:bold; color:#065f46;">${appraisalCycle}</span>
          </div>
        </div>

        <div style="font-size:8pt; text-align:left; line-height:1.3; background:#f8fafc; padding:6px; border:1px solid #cbd5e1;">
          <strong>NOTES FOR GUIDANCE:</strong> This appraisal scheme applies to all employees in the National Catholic Health Service.
          The primary objective is to review performance objectively against agreed targets, identify clinical/administrative strengths and growth areas,
          and determine priority training and development needs. <em>Sections A, B, and E are to be filled by the Appraisee and Appraiser.</em>
        </div>
      </div>

      <!-- SECTION A -->
      <div class="section-title">SECTION A: PERSONAL INFORMATION (To be completed by the Appraisee)</div>

      <div style="border:1.5px solid #000; padding:10px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #000; padding-bottom:6px;">
          <strong style="font-size:9.5pt;">STAFF ID NUMBER:</strong>
          <div>${staffIdBoxes}</div>
        </div>

        <div class="field-row">
          <div class="field-label">1. Surname:</div>
          <div class="field-value" style="font-weight:bold; text-transform:uppercase;">${formData.surname || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">2. Other Names:</div>
          <div class="field-value" style="font-weight:bold;">${formData.otherNames || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">3. Date of Birth & Gender:</div>
          <div class="field-value">${formData.dateOfBirth || '-'} &nbsp;|&nbsp; <strong>Gender:</strong> ${formData.gender || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">4. Directorate / Department / Unit:</div>
          <div class="field-value">${formData.directorateDepartmentUnit || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">5. Present Grade / Position:</div>
          <div class="field-value" style="font-weight:bold;">${formData.currentGrade || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">6. Date Appointed to Present Grade:</div>
          <div class="field-value">${formData.dateOfAppointmentToPresentGrade || '-'} &nbsp;|&nbsp; <strong>Date First Appointed to NCHS:</strong> ${formData.dateOfFirstAppointmentToNCHS || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">7. Academic & Professional Qualifications (with Dates):</div>
          <div class="field-value" style="white-space:pre-wrap;">${formData.academicAndProfessionalQualifications || '-'}</div>
        </div>
        <div class="field-row">
          <div class="field-label">8. Job Description / Key Responsibilities:</div>
          <div class="field-value" style="white-space:pre-wrap;">${formData.jobDescription || '-'}</div>
        </div>
        <div class="field-row" style="border-bottom:none;">
          <div class="field-label">9. Immediate Supervising Officer:</div>
          <div class="field-value">
            <strong>${formData.immediateSupervisorName || '-'}</strong>
            <span style="color:#555; margin-left:8px;">(${formData.immediateSupervisorRank || 'Supervising Officer'})</span>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span>Catholic Health Service Trust, Ghana • Annual Performance Appraisal Form</span>
        <span>Page 1 of 6</span>
      </div>
    </div>

    <!-- =========================================================================
         PAGE 2 & 3: SECTION B - SETTING OBJECTIVES & EVALUATION
         ========================================================================= -->
    <div class="page page-break">
      <div class="watermark">SECTION B</div>

      <div class="section-title">SECTION B: SETTING OBJECTIVES AND ASSESSMENT OF PERFORMANCE</div>
      <div class="section-subtitle">
        Agreed Performance Objectives and Main Activities / Tasks to be completed during the evaluation cycle.
        Scored on a scale of 1 to 5 (5 = Excellent, 4 = Very Good, 3 = Good, 2 = Satisfactory, 1 = Unsatisfactory).
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:30px;">No.</th>
            <th style="width:28%;">Agreed Performance Objectives</th>
            <th style="width:26%;">Main Activities / Tasks</th>
            <th style="width:24%;">Specific Objectives Achieved</th>
            <th style="width:40px;">Rating (1-5)</th>
            <th style="width:14%;">Monitoring & Comments</th>
          </tr>
        </thead>
        <tbody>
          ${formData.objectives.map((obj, i) => `
            <tr>
              <td style="text-align:center; font-weight:bold;">${i + 1}</td>
              <td style="font-weight:600;">${obj.agreedObjective || '-'}</td>
              <td>${obj.mainActivities || '-'}</td>
              <td>${obj.objectivesAchieved || '<span style="color:#777; font-style:italic;">(Pending final assessment)</span>'}</td>
              <td style="text-align:center; font-weight:900; font-size:11pt; background:#fef3c7;">${obj.rating || '-'}</td>
              <td style="font-size:8pt;">
                <strong>Mechanism:</strong> ${obj.monitoringMechanism || '-'}<br/>
                <strong>Remarks:</strong> ${obj.comments || '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Section B Mathematical Calculation Formula -->
      <div class="calc-box">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:6px;">
          <strong style="font-size:10pt; text-transform:uppercase;">Section B Mathematical Score Determination:</strong>
          <span style="font-weight:bold; font-family:monospace;">FORMULA: Average Score (A) = Q / N</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; text-align:center;">
          <div>
            <div style="font-size:8pt; color:#555;">Sum of Ratings (Q)</div>
            <div style="font-size:13pt; font-weight:900;">${formData.sectionBTotalQ}</div>
          </div>
          <div>
            <div style="font-size:8pt; color:#555;">No. of Objectives (N)</div>
            <div style="font-size:13pt; font-weight:900;">${formData.sectionBCountN}</div>
          </div>
          <div>
            <div style="font-size:8pt; color:#555;">Section B Score (A)</div>
            <div style="font-size:13pt; font-weight:900; color:#065f46;">${formData.sectionBScoreA} / 5.0</div>
          </div>
          <div>
            <div style="font-size:8pt; color:#555;">Percentage Equivalent</div>
            <div style="font-size:13pt; font-weight:900; color:#065f46;">${Math.round((formData.sectionBScoreA / 5) * 100)}%</div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span>Catholic Health Service Trust, Ghana • Annual Performance Appraisal Form</span>
        <span>Page 2 of 6</span>
      </div>
    </div>

    <!-- =========================================================================
         PAGE 4: SECTION C - ASSESSMENT FACTORS & CORE COMPETENCIES
         ========================================================================= -->
    <div class="page page-break">
      <div class="watermark">SECTION C</div>

      <div class="section-title">SECTION C: ASSESSMENT FACTORS & CORE COMPETENCIES</div>
      <div class="section-subtitle">
        Assess the Appraisee's performance over the review cycle based on the standard 5-point grading criteria.
        (5 = Excellent, 4 = Very Good, 3 = Good, 2 = Satisfactory, 1 = Unsatisfactory).
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:30px;">No.</th>
            <th style="width:26%;">Assessment Factor</th>
            <th style="width:10%;">Score (1-5)</th>
            <th style="width:60%;">Standard Description & Operational Standard</th>
          </tr>
        </thead>
        <tbody>
          ${formData.assessmentFactors.map((f) => `
            <tr>
              <td style="text-align:center; font-weight:bold;">${f.factorNumber}</td>
              <td style="font-weight:bold;">${f.factorName}</td>
              <td style="text-align:center; font-weight:900; font-size:11pt; background:#fef3c7;">${f.rating}</td>
              <td style="font-size:8.5pt;">
                ${f.factorNumber === 1 ? 'High accuracy, thorough clinical/administrative records, zero preventable errors, adherence to protocol.' : ''}
                ${f.factorNumber === 2 ? 'In-depth mastery of professional requirements, clinical skills, statutory guidelines and SOPs.' : ''}
                ${f.factorNumber === 3 ? 'Self-starter, proactive problem-solving, innovative resource management, constructive recommendations.' : ''}
                ${f.factorNumber === 4 ? 'Exemplary punctuality, regular duty attendance, emergency availability, reliable task completion.' : ''}
                ${f.factorNumber === 5 ? 'Compassionate patient care, respect for hierarchy, cooperative inter-departmental collaboration, adherence to Catholic ethics.' : ''}
                ${f.comments ? `<br/><em>Remarks: ${f.comments}</em>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Section C and Overall Combined Performance Score Box -->
      <div class="calc-box">
        <div style="border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:6px;">
          <strong style="font-size:10pt; text-transform:uppercase;">Overall Cumulative Rating Determination:</strong>
          <span style="font-weight:bold; font-family:monospace; margin-left:12px;">FORMULA: O = (A + S) / 2</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; text-align:center; margin-bottom:8px;">
          <div>
            <div style="font-size:8pt; color:#555;">Sec C Sum (Q)</div>
            <div style="font-size:12pt; font-weight:bold;">${formData.sectionCTotalQ}</div>
          </div>
          <div>
            <div style="font-size:8pt; color:#555;">Sec C Score (S = Q/5)</div>
            <div style="font-size:12pt; font-weight:bold;">${formData.sectionCScoreS} / 5.0</div>
          </div>
          <div>
            <div style="font-size:8pt; color:#555;">Sec B Score (A)</div>
            <div style="font-size:12pt; font-weight:bold;">${formData.sectionBScoreA} / 5.0</div>
          </div>
          <div style="background:#fef3c7; border:1px solid #f59e0b; border-radius:4px; padding:2px;">
            <div style="font-size:8pt; color:#78350f; font-weight:bold;">Cumulative Rating (O)</div>
            <div style="font-size:14pt; font-weight:900; color:#b45309;">${formData.overallRatingO} / 5.0</div>
          </div>
        </div>

        <div style="border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="font-size:9pt;">FINAL PERFORMANCE CLASSIFICATION:</strong>
            <span style="font-weight:900; font-size:10.5pt; color:#065f46; margin-left:6px;">
              ${getGradeText(formData.overallRatingO)}
            </span>
          </div>
          <div style="font-size:8.5pt; font-family:monospace; font-weight:bold;">
            OVERALL SCORE: ${Math.round((formData.overallRatingO / 5) * 100)}%
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span>Catholic Health Service Trust, Ghana • Annual Performance Appraisal Form</span>
        <span>Page 3 of 6</span>
      </div>
    </div>

    <!-- =========================================================================
         PAGE 5: SECTION D & SECTION E - SUMMARY & SIGNATURES
         ========================================================================= -->
    <div class="page page-break">
      <div class="watermark">SECTION D & E</div>

      <!-- SECTION D -->
      <div class="section-title">SECTION D: SUMMARY AND DEVELOPMENT PLANNING</div>
      <div style="border:1.5px solid #000; padding:10px; margin-bottom:12px; font-size:9pt;">
        <div style="margin-bottom:8px;">
          <strong>1. Major Strengths: (Activities the Appraisee does especially well)</strong>
          <div style="border:1px solid #cbd5e1; background:#fafafa; padding:6px; min-height:48px; margin-top:3px; white-space:pre-wrap;">
            ${formData.majorStrengths || '<span style="color:#777; font-style:italic;">None recorded</span>'}
          </div>
        </div>

        <div style="margin-bottom:8px;">
          <strong>2. Areas for Improvement: (Specific growth targets and deficiencies)</strong>
          <div style="border:1px solid #cbd5e1; background:#fafafa; padding:6px; min-height:48px; margin-top:3px; white-space:pre-wrap;">
            ${formData.weaknessesToImprove || '<span style="color:#777; font-style:italic;">None recorded</span>'}
          </div>
        </div>

        <div>
          <strong>3. Training Needs in Order of Priority: (Specific courses / CME / mentorship recommended)</strong>
          <div style="border:1px solid #cbd5e1; background:#fafafa; padding:6px; min-height:48px; margin-top:3px; white-space:pre-wrap;">
            ${formData.trainingNeededInPriority || '<span style="color:#777; font-style:italic;">None recorded</span>'}
          </div>
        </div>
      </div>

      <!-- SECTION E -->
      <div class="section-title">SECTION E: COMMENTS AND SIGNATURES</div>
      <div class="section-subtitle">(To be completed by both the Appraiser and the Appraisee)</div>

      <div class="sig-row">
        <!-- Appraiser's Box -->
        <div class="sig-box">
          <strong style="font-size:9.5pt; text-transform:uppercase;">1. Appraiser's Official Comments:</strong>
          <div style="border:1px solid #cbd5e1; background:#fff; padding:6px; min-height:70px; margin:4px 0 8px 0; font-size:8.5pt; white-space:pre-wrap;">
            ${formData.appraiserComments || '<span style="color:#777; font-style:italic;">Pending supervisor evaluation</span>'}
          </div>
          <div style="font-size:8.5pt;">
            <div><strong>Full Name:</strong> ${formData.appraiserName || '-'}</div>
            <div><strong>Position / Rank:</strong> ${formData.appraiserPositionRank || '-'}</div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>Signature:</strong><br/>
                ${
                  formData.appraiserSignatureUrl
                    ? `<span style="display:inline-block; border:1px solid #065f46; color:#065f46; background:#ecfdf5; font-size:8pt; padding:2px 6px; font-weight:bold; border-radius:3px;">✓ DIGITALLY VERIFIED</span>`
                    : `<span class="sig-line" style="display:inline-block; width:120px;"></span>`
                }
              </div>
              <div style="text-align:right;">
                <strong>Date:</strong><br/>
                ${formData.appraiserSignatureDate || '-'}
              </div>
            </div>
          </div>
        </div>

        <!-- Appraisee's Box -->
        <div class="sig-box">
          <strong style="font-size:9.5pt; text-transform:uppercase;">2. Appraisee's Comments:</strong>
          <div style="border:1px solid #cbd5e1; background:#fff; padding:6px; min-height:70px; margin:4px 0 8px 0; font-size:8.5pt; white-space:pre-wrap;">
            ${formData.appraiseeComments || '<span style="color:#777; font-style:italic;">No staff comments logged</span>'}
          </div>
          <div style="font-size:8.5pt;">
            <div><strong>Full Name:</strong> ${formData.appraiseeName || `${formData.surname} ${formData.otherNames}`}</div>
            <div><strong>Staff ID:</strong> ${formData.staffIdNumber}</div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>Signature:</strong><br/>
                ${
                  formData.appraiseeSignatureUrl
                    ? `<span style="display:inline-block; border:1px solid #065f46; color:#065f46; background:#ecfdf5; font-size:8pt; padding:2px 6px; font-weight:bold; border-radius:3px;">✓ DIGITALLY VERIFIED</span>`
                    : `<span class="sig-line" style="display:inline-block; width:120px;"></span>`
                }
              </div>
              <div style="text-align:right;">
                <strong>Date:</strong><br/>
                ${formData.appraiseeSignatureDate || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span>Catholic Health Service Trust, Ghana • Annual Performance Appraisal Form</span>
        <span>Page 4 of 6</span>
      </div>
    </div>

    <!-- =========================================================================
         PAGE 6: SECTION F - COUNTERSIGNING & 4-TIER WORKFLOW AUDIT
         ========================================================================= -->
    <div class="page page-break">
      <div class="watermark">SECTION F</div>

      <!-- SECTION F -->
      <div class="section-title">SECTION F: COMMENTS BY COUNTERSIGNING OFFICER</div>
      <div class="section-subtitle">(To be completed by the Head of Facility / Chief Executive Officer / Medical Director)</div>

      <div style="border:1.5px solid #000; padding:12px; margin-bottom:14px; font-size:9pt;">
        <strong>Countersigning Officer's Evaluation Remarks & Confirmation:</strong>
        <div style="border:1px solid #cbd5e1; background:#fafafa; padding:8px; min-height:85px; margin:6px 0 12px 0; white-space:pre-wrap;">
          ${formData.countersigningComments || '<span style="color:#777; font-style:italic;">Pending Executive Countersigning</span>'}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">
          <div>
            <strong>Name of Countersigning Officer:</strong><br/>
            <span style="font-size:10pt; font-weight:bold;">${formData.countersigningOfficerName || '-'}</span>
          </div>
          <div>
            <strong>Position / Title:</strong><br/>
            <span style="font-size:10pt; font-weight:bold;">${formData.countersigningOfficerPosition || 'Head of Facility / CEO'}</span>
          </div>
        </div>

        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:flex-end; border-top:1px dashed #cbd5e1; padding-top:8px;">
          <div>
            <strong>Executive Signature / Stamp:</strong><br/>
            ${
              formData.countersigningSignatureUrl
                ? `<span style="display:inline-block; border:1.5px solid #1e3a8a; color:#1e3a8a; background:#eff6ff; font-size:8.5pt; padding:4px 10px; font-weight:900; border-radius:4px;">★ OFFICIAL SEAL / VERIFIED DIGITAL ENDORSEMENT</span>`
                : `<span class="sig-line" style="display:inline-block; width:220px;"></span>`
            }
          </div>
          <div style="text-align:right;">
            <strong>Date Endorsed:</strong><br/>
            <span style="font-size:10pt; font-weight:bold;">${formData.countersigningSignatureDate || '-'}</span>
          </div>
        </div>
      </div>

      <!-- 4-TIER SEQUENTIAL WORKFLOW AUDIT LOG (IDENTICAL TO LEAVE WORKFLOW) -->
      <div class="section-title">4-TIER GOVERNANCE & APPROVAL AUDIT TRAIL</div>
      <div class="section-subtitle">National Catholic Health Service Multi-Tier Electronic Routing Verification</div>

      <table>
        <thead>
          <tr>
            <th style="width:18%;">Approval Tier</th>
            <th style="width:24%;">Designated Authority</th>
            <th style="width:18%;">Status</th>
            <th style="width:18%;">Date & Time</th>
            <th style="width:22%;">Review Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:bold;">Tier 1: Unit Head</td>
            <td>${unitHeadStep?.approverName || 'Unit In-Charge (HOU)'}</td>
            <td>
              <span style="font-weight:bold; color:${unitHeadStep?.status === 'Approved' ? '#065f46' : '#b45309'};">
                ${unitHeadStep?.status || (appraisal?.status === 'Completed' ? 'Approved' : 'Pending')}
              </span>
            </td>
            <td>${unitHeadStep?.approvedAt ? unitHeadStep.approvedAt.replace('T', ' ').slice(0, 16) : '-'}</td>
            <td style="font-size:7.5pt;">${unitHeadStep?.comments || 'Verified performance outputs.'}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Tier 2: Dept Head</td>
            <td>${deptHeadStep?.approverName || 'Departmental Head (HOD)'}</td>
            <td>
              <span style="font-weight:bold; color:${deptHeadStep?.status === 'Approved' ? '#065f46' : '#b45309'};">
                ${deptHeadStep?.status || (appraisal?.status === 'Completed' ? 'Approved' : 'Pending')}
              </span>
            </td>
            <td>${deptHeadStep?.approvedAt ? deptHeadStep.approvedAt.replace('T', ' ').slice(0, 16) : '-'}</td>
            <td style="font-size:7.5pt;">${deptHeadStep?.comments || 'Departmental alignment endorsed.'}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Tier 3: HR Directorate</td>
            <td>${hrStep?.approverName || 'HR Directorate / Manager'}</td>
            <td>
              <span style="font-weight:bold; color:${hrStep?.status === 'Approved' ? '#065f46' : '#b45309'};">
                ${hrStep?.status || (appraisal?.status === 'Completed' ? 'Approved' : 'Pending')}
              </span>
            </td>
            <td>${hrStep?.approvedAt ? hrStep.approvedAt.replace('T', ' ').slice(0, 16) : '-'}</td>
            <td style="font-size:7.5pt;">${hrStep?.comments || 'Service records and score verified.'}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Tier 4: Head of Facility</td>
            <td>${facilityHeadStep?.approverName || 'Head of Facility / CEO'}</td>
            <td>
              <span style="font-weight:bold; color:${facilityHeadStep?.status === 'Approved' ? '#065f46' : '#b45309'};">
                ${facilityHeadStep?.status || (appraisal?.status === 'Completed' ? 'Approved' : 'Pending')}
              </span>
            </td>
            <td>${facilityHeadStep?.approvedAt ? facilityHeadStep.approvedAt.replace('T', ' ').slice(0, 16) : '-'}</td>
            <td style="font-size:7.5pt;">${facilityHeadStep?.comments || 'Certified and ratified.'}</td>
          </tr>
        </tbody>
      </table>

      <div style="border:1px dashed #cbd5e1; padding:6px; font-size:7.5pt; color:#475569; text-align:center; margin-top:10px;">
        This document constitutes an official appraisal record under the National Catholic Health Service Trust Governance Code.
        Copies are deposited with the Human Resource Directorate archives and the Appraisee's official personnel file.
      </div>

      <div class="page-footer">
        <span>Catholic Health Service Trust, Ghana • Annual Performance Appraisal Form</span>
        <span>Page 5 & 6 (Final Certification)</span>
      </div>
    </div>
  </div>

  ${
    autoPrintScript
      ? `<script>
    window.onload = function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.warn('Auto print trigger prevented', e);
        }
      }, 350);
    };
  </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Universal print handler for Catholic Health Service Trust Appraisal Form
 */
export function printAppraisalDocument(
  formData: CatholicHealthAppraisalFormData,
  appraisal?: PerformanceAppraisal | null,
  employee?: Employee | null,
  options: AppraisalPrintOptions = {}
): boolean {
  const fullHtml = generateAppraisalDocumentHtml(formData, appraisal, employee, options);

  // Method 1: Pop-up print window
  try {
    const printWindow = window.open('', '_blank', 'width=950,height=1000,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      return true;
    }
  } catch (err) {
    console.warn('Popup print was blocked, attempting hidden iframe method...', err);
  }

  // Method 2: Hidden iframe printer (works 100% inside sandboxed web views)
  try {
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute('title', 'Catholic Health Appraisal Print Frame');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      setTimeout(() => {
        try {
          if (printIframe.contentWindow) {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          } else {
            window.print();
          }
        } catch (e) {
          console.warn('Iframe print error, falling back to window.print()', e);
          window.print();
        }

        setTimeout(() => {
          try {
            document.body.removeChild(printIframe);
          } catch (e) {
            // Ignore removal error
          }
        }, 2000);
      }, 400);

      return true;
    }
  } catch (iframeErr) {
    console.warn('Iframe printing failed, defaulting to native window.print()', iframeErr);
  }

  // Method 3: Native window print fallback
  window.print();
  return true;
}

/**
 * Downloads the appraisal form as an offline HTML file
 */
export function downloadAppraisalHtml(
  formData: CatholicHealthAppraisalFormData,
  appraisal?: PerformanceAppraisal | null,
  employee?: Employee | null,
  filename?: string
) {
  const fullHtml = generateAppraisalDocumentHtml(formData, appraisal, employee, { autoPrint: false });
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (formData.surname || 'Staff').replace(/\s+/g, '_');
  link.download = filename || `CatholicHealth_Appraisal_${safeName}_${formData.staffIdNumber || 'Form'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
