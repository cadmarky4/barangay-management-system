import { useState, useEffect } from "react";
import { ReportsService } from "../../services/reports/reports.service";
import type {
  StatisticsOverview,
  FilterOptions,
} from "../../services/reports/reports.types";

export default function ReportsPageSimple() {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [statisticsData, setStatisticsData] = useState<StatisticsOverview | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    years: [],
    quarters: ["Q1", "Q2", "Q3", "Q4", "All Quarters"],
    puroks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportsService = new ReportsService();

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await reportsService.getFilterOptions();
        if (response.data) {
          setFilterOptions(response.data);
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const response = await reportsService.getStatisticsOverview({ year: selectedYear });
        if (response.data) {
          setStatisticsData(response.data);
        }
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (filterOptions.years.length > 0) {
      loadStatistics();
    }
  }, [selectedYear, filterOptions.years.length]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Reports - Testing Backend Integration</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">Loading...</div>
      )}

      {!loading && (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {statisticsData && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Statistics Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statisticsData.totalResidents}</div>
                  <div className="text-sm text-gray-600">Total Residents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statisticsData.totalHouseholds}</div>
                  <div className="text-sm text-gray-600">Total Households</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statisticsData.activeBarangayOfficials}</div>
                  <div className="text-sm text-gray-600">Active Officials</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{statisticsData.totalBlotterCases}</div>
                  <div className="text-sm text-gray-600">Blotter Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statisticsData.totalIssuedClearance}</div>
                  <div className="text-sm text-gray-600">Issued Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{statisticsData.ongoingProjects}</div>
                  <div className="text-sm text-gray-600">Ongoing Projects</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
