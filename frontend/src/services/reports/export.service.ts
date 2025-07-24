// ============================================================================
// services/export/export.service.ts - Export service for reports
// ============================================================================

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type {
  StatisticsOverview,
  AgeGroupDistribution,
  SpecialPopulationRegistry,
  MonthlyRevenue,
  PopulationDistributionByStreet,
  DocumentTypesIssued,
  MostRequestedService,
  ReportsFilters,
} from '../reports/reports.types';

interface ExportData {
  statisticsOverview: StatisticsOverview;
  ageGroupDistribution: AgeGroupDistribution[];
  specialPopulationRegistry: SpecialPopulationRegistry[];
  monthlyRevenue: MonthlyRevenue[];
  populationDistributionByStreet: PopulationDistributionByStreet[];
  documentTypesIssued: DocumentTypesIssued[];
  mostRequestedServices: MostRequestedService[];
  filters: ReportsFilters;
}

export class ExportService {
  /**
   * Export all report data to Excel with separate sheets
   */
  async exportToExcel(data: ExportData): Promise<void> {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Add Statistics Overview sheet
      this.addStatisticsOverviewSheet(workbook, data.statisticsOverview, data.filters);

      // Add Age Group Distribution sheet
      this.addAgeGroupDistributionSheet(workbook, data.ageGroupDistribution, data.filters);

      // Add Special Population Registry sheet
      this.addSpecialPopulationSheet(workbook, data.specialPopulationRegistry, data.filters);

      // Add Monthly Revenue sheet
      this.addMonthlyRevenueSheet(workbook, data.monthlyRevenue, data.filters);

      // Add Population Distribution by Street sheet
      this.addPopulationDistributionSheet(workbook, data.populationDistributionByStreet, data.filters);

      // Add Document Types Issued sheet
      this.addDocumentTypesSheet(workbook, data.documentTypesIssued, data.filters);

      // Add Most Requested Services sheet
      this.addMostRequestedServicesSheet(workbook, data.mostRequestedServices, data.filters);

      // Generate filename with filters
      const filename = this.generateFilename('excel', data.filters);

      // Write and save the workbook
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
      const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
      saveAs(blob, filename);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel. Please try again.');
    }
  }

  /**
   * Export all report data to Word document
   */
  async exportToWord(data: ExportData): Promise<void> {
    try {
      // Create HTML content for Word document
      const htmlContent = this.generateWordHTML(data);

      // Create blob and save
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const filename = this.generateFilename('word', data.filters);
      saveAs(blob, filename);

    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error('Failed to export to Word. Please try again.');
    }
  }

  /**
   * Add Statistics Overview sheet to workbook
   */
  private addStatisticsOverviewSheet(workbook: XLSX.WorkBook, data: StatisticsOverview, filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - STATISTICS OVERVIEW'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['STATISTICS OVERVIEW'],
      [''],
      ['Metric', 'Value'],
      ['Total Residents', data.totalResidents],
      ['Total Households', data.totalHouseholds],
      ['Active Barangay Officials', data.activeBarangayOfficials],
      ['Total Blotter Cases', data.totalBlotterCases],
      ['Total Issued Clearance', data.totalIssuedClearance],
      // ['Ongoing Projects', data.ongoingProjects],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 15 }
    ];

    // Add styling ranges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Title merge
      { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }  // Section header merge
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Statistics Overview');
  }

  /**
   * Add Age Group Distribution sheet to workbook
   */
  private addAgeGroupDistributionSheet(workbook: XLSX.WorkBook, data: AgeGroupDistribution[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - AGE GROUP DISTRIBUTION'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['AGE GROUP DISTRIBUTION'],
      [''],
      ['Age Group', 'Percentage (%)'],
      ...data.map(item => [item.name, item.percentage])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 25 },
      { width: 15 }
    ];

    // Add chart data for Excel charts
    const chartData = data.map(item => ({
      category: item.name,
      value: item.percentage
    }));

    // Add chart reference (Excel will create chart from this data)
    ws['!charts'] = [{
      type: 'pie',
      data: chartData,
      title: 'Age Group Distribution'
    }];

    XLSX.utils.book_append_sheet(workbook, ws, 'Age Group Distribution');
  }

  /**
   * Add Special Population Registry sheet to workbook
   */
  private addSpecialPopulationSheet(workbook: XLSX.WorkBook, data: SpecialPopulationRegistry[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - SPECIAL POPULATION REGISTRY'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['SPECIAL POPULATION REGISTRY'],
      [''],
      ['Population Type', 'Percentage (%)'],
      ...data.map(item => [item.name, item.percentage])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Special Population');
  }

  /**
   * Add Monthly Revenue sheet to workbook
   */
  private addMonthlyRevenueSheet(workbook: XLSX.WorkBook, data: MonthlyRevenue[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - MONTHLY REVENUE COLLECTION'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['MONTHLY REVENUE COLLECTION'],
      [''],
      ['Period', 'Amount (₱)'],
      ...data.map(item => [item.timeLabel, item.value]),
      [''],
      ['SUMMARY'],
      ['Total Revenue:', data.reduce((sum, item) => sum + item.value, 0)],
      ['Average Monthly Revenue:', data.length > 0 ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0],
      ['Highest Month:', data.length > 0 ? data.reduce((max, item) => item.value > max.value ? item : max).timeLabel : 'N/A'],
      ['Lowest Month:', data.length > 0 ? data.reduce((min, item) => item.value < min.value ? item : min).timeLabel : 'N/A']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 20 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Monthly Revenue');
  }

  /**
   * Add Population Distribution by Street sheet to workbook
   */
  private addPopulationDistributionSheet(workbook: XLSX.WorkBook, data: PopulationDistributionByStreet[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - POPULATION DISTRIBUTION BY STREET'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['POPULATION DISTRIBUTION BY STREET'],
      [''],
      ['Street', 'Population'],
      ...data.map(item => [item.label, item.value]),
      [''],
      ['SUMMARY'],
      ['Total Population:', data.reduce((sum, item) => sum + item.value, 0)],
      ['Average per Street:', data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) : 0],
      ['Most Populated:', data.length > 0 ? data.reduce((max, item) => item.value > max.value ? item : max).label : 'N/A'],
      ['Least Populated:', data.length > 0 ? data.reduce((min, item) => item.value < min.value ? item : min).label : 'N/A']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 25 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Population by Street');
  }

  /**
   * Add Document Types Issued sheet to workbook
   */
  private addDocumentTypesSheet(workbook: XLSX.WorkBook, data: DocumentTypesIssued[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - DOCUMENT TYPES ISSUED'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['DOCUMENT TYPES ISSUED'],
      [''],
      ['Document Type', 'Count'],
      ...data.map(item => [item.label, item.value]),
      [''],
      ['SUMMARY'],
      ['Total Documents:', data.reduce((sum, item) => sum + item.value, 0)],
      ['Average per Type:', data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) : 0],
      ['Most Issued:', data.length > 0 ? data.reduce((max, item) => item.value > max.value ? item : max).label : 'N/A'],
      ['Least Issued:', data.length > 0 ? data.reduce((min, item) => item.value < min.value ? item : min).label : 'N/A']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Document Types');
  }

  /**
   * Add Most Requested Services sheet to workbook
   */
  private addMostRequestedServicesSheet(workbook: XLSX.WorkBook, data: MostRequestedService[], filters: ReportsFilters): void {
    const wsData = [
      ['BARANGAY MANAGEMENT SYSTEM - MOST REQUESTED SERVICES'],
      [''],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Filters Applied:'],
      ['Year:', filters.year || 'All'],
      ['Quarter:', filters.quarter || 'All'],
      ['Street:', filters.street || 'All'],
      [''],
      ['MOST REQUESTED SERVICES'],
      [''],
      ['Service', 'Requests', 'Completed', 'Completion Rate (%)', 'Avg Processing Time (Days)', 'Fees Collected (₱)'],
      ...data.map(item => [
        item.service,
        item.requested,
        item.completed,
        Math.round((item.completed / item.requested) * 100),
        item.avgProcessingTimeInDays,
        item.feesCollected
      ]),
      [''],
      ['SUMMARY'],
      ['Total Requests:', data.reduce((sum, item) => sum + item.requested, 0)],
      ['Total Completed:', data.reduce((sum, item) => sum + item.completed, 0)],
      ['Overall Completion Rate:', data.length > 0 ? Math.round((data.reduce((sum, item) => sum + item.completed, 0) / data.reduce((sum, item) => sum + item.requested, 0)) * 100) : 0],
      ['Total Fees Collected:', data.reduce((sum, item) => sum + item.feesCollected, 0)],
      ['Average Processing Time:', data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.avgProcessingTimeInDays, 0) / data.length) : 0]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 12 },
      { width: 12 },
      { width: 18 },
      { width: 20 },
      { width: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Most Requested Services');
  }

  /**
   * Generate HTML content for Word document
   */
  private generateWordHTML(data: ExportData): string {
    const filterInfo = `
      <p><strong>Year:</strong> ${data.filters.year || 'All'}</p>
      <p><strong>Quarter:</strong> ${data.filters.quarter || 'All'}</p>
      <p><strong>Street:</strong> ${data.filters.street || 'All'}</p>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Barangay Management System - Reports</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #367096;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #367096;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #367096;
              border-left: 4px solid #367096;
              padding-left: 10px;
              margin-bottom: 20px;
            }
            .filter-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            .stat-card {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e9ecef;
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #367096;
            }
            .stat-label {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #367096;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .summary {
              background-color: #e8f4f8;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BARANGAY MANAGEMENT SYSTEM</div>
            <div class="subtitle">Statistical Reports</div>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="filter-info">
            <h3>Report Filters Applied:</h3>
            ${filterInfo}
          </div>

          <div class="section">
            <h2 class="section-title">Statistics Overview</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${data.statisticsOverview.totalResidents.toLocaleString()}</div>
                <div class="stat-label">Total Residents</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.statisticsOverview.totalHouseholds.toLocaleString()}</div>
                <div class="stat-label">Total Households</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.statisticsOverview.activeBarangayOfficials.toLocaleString()}</div>
                <div class="stat-label">Active Barangay Officials</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.statisticsOverview.totalBlotterCases.toLocaleString()}</div>
                <div class="stat-label">Total Blotter Cases</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.statisticsOverview.totalIssuedClearance.toLocaleString()}</div>
                <div class="stat-label">Total Issued Clearance</div>
              </div>
            </div>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Age Group Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Age Group</th>
                  <th>Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                ${data.ageGroupDistribution.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Special Population Registry</h2>
            <table>
              <thead>
                <tr>
                  <th>Population Type</th>
                  <th>Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                ${data.specialPopulationRegistry.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Monthly Revenue Collection</h2>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount (₱)</th>
                </tr>
              </thead>
              <tbody>
                ${data.monthlyRevenue.map(item => `
                  <tr>
                    <td>${item.timeLabel}</td>
                    <td>₱${item.value.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <h3>Revenue Summary</h3>
              <p><strong>Total Revenue:</strong> ₱${data.monthlyRevenue.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</p>
              <p><strong>Average Monthly Revenue:</strong> ₱${data.monthlyRevenue.length > 0 ? Math.round(data.monthlyRevenue.reduce((sum, item) => sum + item.value, 0) / data.monthlyRevenue.length).toLocaleString() : 0}</p>
            </div>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Population Distribution by Street</h2>
            <table>
              <thead>
                <tr>
                  <th>Street</th>
                  <th>Population</th>
                </tr>
              </thead>
              <tbody>
                ${data.populationDistributionByStreet.map(item => `
                  <tr>
                    <td>${item.label}</td>
                    <td>${item.value.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <h3>Population Summary</h3>
              <p><strong>Total Population:</strong> ${data.populationDistributionByStreet.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</p>
              <p><strong>Average per Street:</strong> ${data.populationDistributionByStreet.length > 0 ? Math.round(data.populationDistributionByStreet.reduce((sum, item) => sum + item.value, 0) / data.populationDistributionByStreet.length).toLocaleString() : 0}</p>
            </div>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Document Types Issued</h2>
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${data.documentTypesIssued.map(item => `
                  <tr>
                    <td>${item.label}</td>
                    <td>${item.value.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <h3>Document Summary</h3>
              <p><strong>Total Documents:</strong> ${data.documentTypesIssued.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</p>
            </div>
          </div>

          <div class="section page-break">
            <h2 class="section-title">Most Requested Services</h2>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Requests</th>
                  <th>Completed</th>
                  <th>Completion Rate (%)</th>
                  <th>Avg Processing Time (Days)</th>
                  <th>Fees Collected (₱)</th>
                </tr>
              </thead>
              <tbody>
                ${data.mostRequestedServices.map(item => `
                  <tr>
                    <td>${item.service}</td>
                    <td>${item.requested.toLocaleString()}</td>
                    <td>${item.completed.toLocaleString()}</td>
                    <td>${Math.round((item.completed / item.requested) * 100)}%</td>
                    <td>${item.avgProcessingTimeInDays}</td>
                    <td>₱${item.feesCollected.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <h3>Services Summary</h3>
              <p><strong>Total Requests:</strong> ${data.mostRequestedServices.reduce((sum, item) => sum + item.requested, 0).toLocaleString()}</p>
              <p><strong>Total Completed:</strong> ${data.mostRequestedServices.reduce((sum, item) => sum + item.completed, 0).toLocaleString()}</p>
              <p><strong>Overall Completion Rate:</strong> ${data.mostRequestedServices.length > 0 ? Math.round((data.mostRequestedServices.reduce((sum, item) => sum + item.completed, 0) / data.mostRequestedServices.reduce((sum, item) => sum + item.requested, 0)) * 100) : 0}%</p>
              <p><strong>Total Fees Collected:</strong> ₱${data.mostRequestedServices.reduce((sum, item) => sum + item.feesCollected, 0).toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate filename based on format and filters
   */
  private generateFilename(format: 'excel' | 'word', filters: ReportsFilters): string {
    const date = new Date().toISOString().split('T')[0];
    const year = filters.year || 'All';
    const quarter = filters.quarter || 'All';
    const street = filters.street || 'All';
    
    const extension = format === 'excel' ? 'xlsx' : 'docx';
    
    return `Barangay_Reports_${year}_${quarter}_${street}_${date}.${extension}`;
  }

  /**
   * Convert string to array buffer (for Excel export)
   */
  private s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
}

// Create singleton instance
export const exportService = new ExportService();