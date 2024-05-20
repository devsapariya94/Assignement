import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [selectedYearData, setSelectedYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [maxAvg_salary, setMaxAvg_salary] = useState(0);

  useEffect(() => {
    fetch("https://backend.assignment.devsdemo.co/get_aggregated_data")
      .then((res) => res.json())
      .then(
        (result) => {
          const formattedData = result.map((item, index) => ({
            id: index + 1,
            year: item.year,
            totalJobs: item.total_jobs,
            averageSalary: item.average_salary.toFixed(2),
            jobs: item.jobs,
          }));
          setRows(formattedData);
        },
        (error) => {
          setError(error);
        }
      );
  }, []);

  const handleRowClick = (params) => {
    const year = params.row.year;
    setSelectedYear(year);
    fetch(`https://backend.assignment.devsdemo.co/get_jobs_by_year/${year}`)
      .then((res) => res.json())
      .then(
        (result) => {
          const formattedJobData = result.map((item, index) => ({
            id: index + 1,
            jobTitle: item.job_title,
            count: item.count,
            avg_salary: item.avg_salary.toFixed(2),
          }));

          // Find the maximum average salary
          const maxAvgSalary = Math.max(
            ...formattedJobData.map((item) => item.avg_salary)
          );
          setMaxAvg_salary(maxAvgSalary);

          setSelectedYearData(formattedJobData);
        },
        (error) => {
          setError(error);
        }
      );
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    { field: "year", headerName: "Year", width: 130 },
    { field: "totalJobs", headerName: "Number of Total Jobs", width: 200 },
    { field: "averageSalary", headerName: "Average Salary in USD", width: 200 },
  ];

  const jobTitleColumns = [
    { field: "jobTitle", headerName: "Job Title", width: 200 },
    { field: "count", headerName: "Number of Jobs", width: 200 },
    { field: "avg_salary", headerName: "Average Salary", width: 200 },
  ];

  return (
    <>
    <h1>Assignment</h1>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableSelectionOnClick
          onRowClick={handleRowClick}
        />
      </div>

      <h3>Job Trends (2020-2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={rows}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalJobs"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {selectedYear && (
        <>
          <h3>Job Titles in {selectedYear}</h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={selectedYearData}
              columns={jobTitleColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>

          <h3>Job Trends of {selectedYear}</h3>
          <ResponsiveContainer width="100%" height={800}>
            {" "}
            {/* Increased height */}
            <LineChart
              data={selectedYearData}
              margin={{ top: 30, right: 30, left: 20, bottom: 350 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="jobTitle"
                angle={-90} // Rotate labels vertically
                textAnchor="end" // Align text to end of axis
                interval={0} // Show all labels
              />
              <YAxis />
              <Tooltip />
              {/* <Legend /> */}
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <h3>Salary Trend of {selectedYear}</h3>
          <ResponsiveContainer width="100%" height={1000}>
            <LineChart
              data={selectedYearData}
              margin={{ top: 30, right: 30, left: 20, bottom: 50 }} // Adjusted margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="jobTitle"
                angle={-90} // Rotate labels vertically
                textAnchor="end" // Align text to end of axis
                interval={0} // Show all labels
              />
              <YAxis
                domain={[0, maxAvg_salary]}
                type="number" // Set Y-axis type to number
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avg_salary"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </>
  );
}
