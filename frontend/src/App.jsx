import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [applications, setApplications] = useState([]);
  const [showReminders, setShowReminders] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewPrep, setInterviewPrep] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Applied");
  const [priority, setPriority] = useState("Medium");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [formError, setFormError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/applications"
        );

        setApplications(response.data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  const clearForm = () => {
    setCompanyName("");
    setJobTitle("");
    setLocation("");
    setApplicationDate("");
    setInterviewDate("");
    setFollowUpDate("");
    setJobLink("");
    setJobDescription("");
    setInterviewPrep("");
    setNotes("");
    setStatus("Applied");
    setPriority("Medium");
    setEditingId(null);
    setFormError("");
  };

  // FORM VALIDATION AND SUBMISSION

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanCompanyName = companyName.trim();
    const cleanJobTitle = jobTitle.trim();

    if (!cleanCompanyName || !cleanJobTitle) {
      setFormError(
        "Please enter both a company name and job title."
      );
      return;
    }

    setFormError("");

    try {
      if (editingId !== null) {
        const existingApplication = applications.find(
          (app) => app._id === editingId
        );

        const existingTimeline = Array.isArray(
          existingApplication?.timeline
        )
          ? existingApplication.timeline
          : [];

        const application = {
          companyName: cleanCompanyName,
          jobTitle: cleanJobTitle,
          location: location.trim(),
          applicationDate,
          interviewDate,
          followUpDate,
          jobLink: jobLink.trim(),
          jobDescription: jobDescription.trim(),
          interviewPrep: interviewPrep.trim(),
          notes: notes.trim(),
          status,
          priority,
          timeline: [
            ...existingTimeline,
            {
              action: "Application updated",
              date: new Date().toISOString(),
            },
          ],
        };

        const response = await axios.put(
          `http://localhost:5000/api/applications/${editingId}`,
          application
        );

        setApplications((previous) =>
          previous.map((app) =>
            app._id === editingId ? response.data : app
          )
        );

        alert("Application updated successfully!");
      } else {
        const application = {
          companyName: cleanCompanyName,
          jobTitle: cleanJobTitle,
          location: location.trim(),
          applicationDate,
          interviewDate,
          followUpDate,
          jobLink: jobLink.trim(),
          jobDescription: jobDescription.trim(),
          interviewPrep: interviewPrep.trim(),
          notes: notes.trim(),
          status,
          priority,
          timeline: [
            {
              action: "Application created",
              date: new Date().toISOString(),
            },
          ],
        };

        const response = await axios.post(
          "http://localhost:5000/api/applications",
          application
        );

        setApplications((previous) => [...previous, response.data]);

        alert("Application saved successfully!");
      }

      clearForm();
    } catch (error) {
      console.error("Error saving application:", error);
      alert("Failed to save application.");
    }
  };

  // QUICK STATUS UPDATE

  const updateStatus = async (application, newStatus) => {
    const previousStatus = application.status || "Applied";

    if (newStatus === previousStatus) return;

    setUpdatingStatusId(application._id);

    try {
      const existingTimeline = Array.isArray(application.timeline)
        ? application.timeline
        : [];

      const updatedApplication = {
        ...application,
        status: newStatus,
        timeline: [
          ...existingTimeline,
          {
            action: `Status changed: ${previousStatus} → ${newStatus}`,
            date: new Date().toISOString(),
          },
        ],
      };

      const response = await axios.put(
        `http://localhost:5000/api/applications/${application._id}`,
        updatedApplication
      );

      setApplications((previous) =>
        previous.map((app) =>
          app._id === application._id ? response.data : app
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // EDIT APPLICATION AND SCROLL TO FORM

  const editApplication = (application) => {
    setCompanyName(application.companyName || "");
    setJobTitle(application.jobTitle || "");
    setLocation(application.location || "");
    setApplicationDate(application.applicationDate || "");
    setInterviewDate(application.interviewDate || "");
    setFollowUpDate(application.followUpDate || "");
    setJobLink(application.jobLink || "");
    setJobDescription(application.jobDescription || "");
    setInterviewPrep(application.interviewPrep || "");
    setNotes(application.notes || "");
    setStatus(application.status || "Applied");
    setPriority(application.priority || "Medium");
    setEditingId(application._id);
    setFormError("");

    document
      .getElementById("application-form-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/applications/${id}`
      );

      setApplications((previous) =>
        previous.filter((app) => app._id !== id)
      );

      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete application.");
    }
  };

  // EXPORT APPLICATIONS TO CSV

  const exportApplications = () => {
    if (applications.length === 0) {
      alert("No applications available to export.");
      return;
    }

    const headers = [
      "Company Name",
      "Job Title",
      "Location",
      "Application Date",
      "Interview Date",
      "Follow-up Date",
      "Status",
      "Priority",
      "Job Description",
      "Interview Preparation",
      "Job Link",
      "Notes",
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = applications.map((app) => [
      app.companyName,
      app.jobTitle,
      app.location,
      app.applicationDate,
      app.interviewDate,
      app.followUpDate,
      app.status,
      app.priority || "Medium",
      app.jobDescription,
      app.interviewPrep,
      app.jobLink,
      app.notes,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "job-applications.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // CLEAR SEARCH, FILTER AND SORT

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setSortBy("newest");
  };

  // SEARCH AND FILTER APPLICATIONS

  const filteredApplications = applications.filter((application) => {
    const company = (application.companyName || "").toLowerCase();
    const title = (application.jobTitle || "").toLowerCase();
    const searchText = search.toLowerCase();

    const matchesSearch =
      company.includes(searchText) || title.includes(searchText);

    const matchesStatus =
      filterStatus === "All" || application.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // SORT APPLICATIONS

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(a.applicationDate || 0) -
          new Date(b.applicationDate || 0)
        );

      case "company-az":
        return (a.companyName || "").localeCompare(b.companyName || "");

      case "company-za":
        return (b.companyName || "").localeCompare(a.companyName || "");

      case "newest":
      default:
        return (
          new Date(b.applicationDate || 0) -
          new Date(a.applicationDate || 0)
        );
    }
  });

  // DASHBOARD COUNTS

  const totalApplications = applications.length;

  const appliedCount = applications.filter(
    (app) => app.status === "Applied"
  ).length;

  const interviewCount = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const selectedCount = applications.filter(
    (app) => app.status === "Selected"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  // DASHBOARD INSIGHTS

  const highPriorityCount = applications.filter(
    (app) => (app.priority || "Medium") === "High"
  ).length;

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;

  const successRate =
    totalApplications > 0
      ? Math.round((selectedCount / totalApplications) * 100)
      : 0;

  const responseRate =
    totalApplications > 0
      ? Math.round(
          ((interviewCount + selectedCount) / totalApplications) * 100
        )
      : 0;

  const statusCounts = [
    { name: "Applied", count: appliedCount },
    { name: "Interview", count: interviewCount },
    { name: "Selected", count: selectedCount },
    { name: "Rejected", count: rejectedCount },
  ];

  const mostCommonStatus = statusCounts.reduce(
    (highest, current) =>
      current.count > highest.count ? current : highest,
    { name: "None", count: 0 }
  );

  let jobSearchInsight = "Start adding applications to see your insights.";

  if (totalApplications > 0) {
    if (selectedCount > 0) {
      jobSearchInsight =
        "Great work! You already have a selected application. Keep building on that momentum.";
    } else if (interviewCount > 0) {
      jobSearchInsight =
        "You're getting interviews! Keep preparing carefully and continue applying consistently.";
    } else if (appliedCount > 0) {
      jobSearchInsight =
        "Your applications are getting started. Keep applying and track every follow-up.";
    } else {
      jobSearchInsight =
        "Keep your application statuses updated to get better insights.";
    }
  }

  const statusData = [
    { name: "Applied", count: appliedCount, color: "#5579ad" },
    { name: "Interview", count: interviewCount, color: "#c5a66d" },
    { name: "Selected", count: selectedCount, color: "#27836a" },
    { name: "Rejected", count: rejectedCount, color: "#c75b5b" },
  ];

  const upcomingInterviews = applications.filter(
    (app) => app.interviewDate
  );

  const upcomingFollowUps = applications.filter(
    (app) => app.followUpDate
  );

  // REMINDER DATE CALCULATION

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;

    const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) return null;

    return Math.round(
      (date.getTime() - today.getTime()) / 86400000
    );
  };

  const reminders = applications
    .flatMap((app) => [
      {
        ...app,
        reminderType: "Interview",
        reminderDate: app.interviewDate,
      },
      {
        ...app,
        reminderType: "Follow-up",
        reminderDate: app.followUpDate,
      },
    ])
    .filter((item) => item.reminderDate)
    .map((item) => ({
      ...item,
      daysLeft: getDaysUntil(item.reminderDate),
    }))
    .filter(
      (item) => item.daysLeft !== null && item.daysLeft <= 7
    )
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const getReminderLabel = (daysLeft) => {
    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Today";
    if (daysLeft === 1) return "Tomorrow";
    return `In ${daysLeft} days`;
  };

  const getReminderColor = (daysLeft) => {
    if (daysLeft < 0) return "#c75b5b";
    if (daysLeft === 0) return "#c58b32";
    return "#557d62";
  };

  const getPriorityStyle = (priorityValue) => {
    switch (priorityValue) {
      case "High":
        return {
          background: "#fbe9e7",
          color: "#b94d48",
        };

      case "Low":
        return {
          background: "#e5f2e8",
          color: "#3f7550",
        };

      case "Medium":
      default:
        return {
          background: "#fff2d9",
          color: "#9b6a1e",
        };
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">CAREER ORGANIZER</p>
          <h1>Online Job Application Tracker</h1>
          <p className="hero-text">
            Organize your applications, track your progress,
            and stay on top of your job search.
          </p>
        </div>
        <div className="hero-icon">💼</div>
      </header>

      <main className="main-content">
        <section>
          <div className="section-heading">
            <div>
              <h2>Dashboard</h2>
              <p className="section-description">
                A quick overview of your job search.
              </p>
            </div>
          </div>

          <div className="dashboard">
            <div className="card">
              <span className="stat-label">Total Applications</span>
              <p className="stat-number">{totalApplications}</p>
              <span className="stat-caption">All applications</span>
            </div>

            <div className="card">
              <span className="stat-label">Applied</span>
              <p className="stat-number">{appliedCount}</p>
              <span className="stat-caption">Applications submitted</span>
            </div>

            <div className="card">
              <span className="stat-label">Interviews</span>
              <p className="stat-number">{interviewCount}</p>
              <span className="stat-caption">Interview stage</span>
            </div>

            <div className="card">
              <span className="stat-label">Selected</span>
              <p className="stat-number">{selectedCount}</p>
              <span className="stat-caption">Selected applications</span>
            </div>
          </div>
        </section>

        {/* DASHBOARD INSIGHTS */}

        <section
          className="form-card"
          style={{ marginBottom: "38px" }}
        >
          <div className="section-heading">
            <div>
              <h2>💡 Dashboard Insights</h2>
              <p className="section-description">
                Understand how your job search is progressing.
              </p>
            </div>
          </div>

          {totalApplications === 0 ? (
            <p className="empty-message">
              Add applications to generate useful job search insights.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "18px",
                    background: "#f7f9fc",
                    border: "1px solid #e4e9f0",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#78869a",
                      fontWeight: "600",
                      marginBottom: "7px",
                    }}
                  >
                    📈 Interview Rate
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      color: "#263d5b",
                    }}
                  >
                    {interviewRate}%
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#78869a",
                    }}
                  >
                    Applications reaching interview stage
                  </span>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#f7f9fc",
                    border: "1px solid #e4e9f0",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#78869a",
                      fontWeight: "600",
                      marginBottom: "7px",
                    }}
                  >
                    🏆 Success Rate
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      color: "#27836a",
                    }}
                  >
                    {successRate}%
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#78869a",
                    }}
                  >
                    Applications marked selected
                  </span>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#f7f9fc",
                    border: "1px solid #e4e9f0",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#78869a",
                      fontWeight: "600",
                      marginBottom: "7px",
                    }}
                  >
                    🔄 Response Rate
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      color: "#5579ad",
                    }}
                  >
                    {responseRate}%
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#78869a",
                    }}
                  >
                    Interviews or selections
                  </span>
                </div>

                <div
                  style={{
                    padding: "18px",
                    background: "#fffaf0",
                    border: "1px solid #eadfca",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#78869a",
                      fontWeight: "600",
                      marginBottom: "7px",
                    }}
                  >
                    ⭐ High Priority
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      color: "#9b6a1e",
                    }}
                  >
                    {highPriorityCount}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#78869a",
                    }}
                  >
                    Applications needing extra attention
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#f7f9fc",
                  border: "1px solid #e4e9f0",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#344b3a",
                      fontSize: "13px",
                      marginBottom: "5px",
                    }}
                  >
                    📌 Most Common Status
                  </strong>

                  <span
                    style={{
                      color: "#78869a",
                      fontSize: "13px",
                    }}
                  >
                    {mostCommonStatus.name} is currently your most common
                    application status.
                  </span>
                </div>

                <span
                  style={{
                    background: "#e8eef7",
                    color: "#5579ad",
                    padding: "8px 13px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {mostCommonStatus.count} applications
                </span>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#eef6f1",
                  border: "1px solid #d8e8de",
                  borderRadius: "12px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#344b3a",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  💬 Job Search Insight
                </strong>

                <p
                  style={{
                    margin: 0,
                    color: "#5f6f65",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {jobSearchInsight}
                </p>
              </div>
            </>
          )}
        </section>

        {/* APPLICATION ANALYTICS */}

        <section
          className="form-card"
          style={{ marginBottom: "38px" }}
        >
          <div className="section-heading">
            <div>
              <h2>Application Analytics</h2>
              <p className="section-description">
                Visual breakdown of your application progress.
              </p>
            </div>
          </div>

          {totalApplications === 0 ? (
            <p className="empty-message">
              Add your first application to see your analytics.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "22px" }}>
              {statusData.map((item) => {
                const percentage =
                  (item.count / totalApplications) * 100;

                return (
                  <div key={item.name}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "9px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ color: "#78869a" }}>
                        {item.count} ({Math.round(percentage)}%)
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "12px",
                        background: "#edf0f5",
                        borderRadius: "20px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: item.color,
                          borderRadius: "20px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{
              marginTop: "25px",
              paddingTop: "18px",
              borderTop: "1px solid #e4e9f0",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              color: "#78869a",
              fontSize: "13px",
            }}
          >
            <span>Total tracked applications</span>
            <strong style={{ color: "#263d5b", fontSize: "18px" }}>
              {totalApplications}
            </strong>
          </div>
        </section>

        {/* REMINDER ALERTS */}

        <section
          className="form-card"
          style={{ marginBottom: "38px" }}
        >
          <div className="section-heading">
            <div>
              <h2>🔔 Reminder Alerts</h2>
              <p className="section-description">
                Stay on top of important interview and follow-up dates.
              </p>
            </div>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowReminders((previous) => !previous)}
            >
              {showReminders ? "Hide" : "Show"}
            </button>
          </div>

          {showReminders && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    background: "#fbe9e7",
                    color: "#b94d48",
                    padding: "8px 13px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {reminders.filter((r) => r.daysLeft < 0).length} Overdue
                </span>

                <span
                  style={{
                    background: "#fff2d9",
                    color: "#9b6a1e",
                    padding: "8px 13px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {reminders.filter((r) => r.daysLeft === 0).length} Today
                </span>

                <span
                  style={{
                    background: "#e5f2e8",
                    color: "#3f7550",
                    padding: "8px 13px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {reminders.filter((r) => r.daysLeft > 0).length} Upcoming
                </span>
              </div>

              {reminders.length === 0 ? (
                <p className="empty-message">
                  🎉 No reminders due right now. You're all caught up!
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {reminders.map((item, index) => (
                    <div
                      key={`${item._id}-${item.reminderType}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        padding: "15px",
                        border: "1px solid #e5e8df",
                        borderRadius: "12px",
                        background: "#fffefa",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#344b3a" }}>
                          {item.companyName}
                        </strong>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#788276",
                          }}
                        >
                          {item.reminderType} · {item.jobTitle}
                        </p>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            color: "#788276",
                          }}
                        >
                          Date: {item.reminderDate.slice(0, 10)}
                        </p>
                      </div>

                      <span
                        style={{
                          background:
                            item.daysLeft < 0
                              ? "#fbe9e7"
                              : item.daysLeft === 0
                              ? "#fff2d9"
                              : "#e5f2e8",
                          color: getReminderColor(item.daysLeft),
                          padding: "8px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {getReminderLabel(item.daysLeft)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* UPCOMING EVENTS */}

        <section className="upcoming-section">
          <div className="upcoming-card">
            <div className="section-card-heading">
              <div className="section-icon">🎤</div>
              <div>
                <h3>Upcoming Interviews</h3>
                <p>Keep track of interview dates</p>
              </div>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="empty-message">No interviews scheduled.</p>
            ) : (
              upcomingInterviews.map((app) => (
                <div className="upcoming-item" key={app._id}>
                  <strong>{app.companyName}</strong>
                  <span>{app.interviewDate}</span>
                </div>
              ))
            )}
          </div>

          <div className="upcoming-card">
            <div className="section-card-heading">
              <div className="section-icon">🔔</div>
              <div>
                <h3>Follow-ups</h3>
                <p>Remember when to follow up</p>
              </div>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <p className="empty-message">No follow-ups scheduled.</p>
            ) : (
              upcomingFollowUps.map((app) => (
                <div className="upcoming-item" key={app._id}>
                  <strong>{app.companyName}</strong>
                  <span>{app.followUpDate}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ADD APPLICATION FORM */}

        <section
          id="application-form-section"
          className="form-card"
        >
          <div className="section-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Application"
                  : "Add New Application"}
              </h2>
              <p className="section-description">
                Enter the details of a job application.
              </p>
            </div>
          </div>

          <form className="application-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setFormError("");
                }}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="form-field">
              <label>Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  setFormError("");
                }}
                placeholder="Enter job title"
                required
              />
            </div>

            <div className="form-field">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or remote"
              />
            </div>

            <div className="form-field">
              <label>Application Date</label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Interview Date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Job Posting Link</label>
              <input
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-field">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>Job Description / Requirements</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Add important job requirements, skills, qualifications, or responsibilities..."
                rows="5"
              />
            </div>

            <div className="form-field full-width">
              <label>Interview Preparation Notes</label>
              <textarea
                value={interviewPrep}
                onChange={(e) => setInterviewPrep(e.target.value)}
                placeholder="Add interview questions, topics to revise, talking points, or preparation notes..."
                rows="5"
              />
            </div>

            <div className="form-field full-width">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows="4"
              />
            </div>

            {formError && (
              <p
                role="alert"
                style={{
                  color: "#c75b5b",
                  background: "#fbe9e7",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {formError}
              </p>
            )}

            <div className="form-actions full-width">
              <button className="primary-button" type="submit">
                {editingId !== null
                  ? "Update Application"
                  : "Add Application"}
              </button>

              {editingId !== null && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* MY APPLICATIONS */}

        <section className="applications-section">
          <div className="section-heading">
            <div>
              <h2>My Applications</h2>
              <p className="section-description">
                View and manage your saved applications.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span className="application-count">
                {filteredApplications.length} records
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={exportApplications}
                style={{ whiteSpace: "nowrap" }}
              >
                ⬇ Export CSV
              </button>
            </div>
          </div>

          {/* SEARCH, FILTER AND SORT */}

          <div className="filter-bar">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or job title..."
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="company-az">Company A–Z</option>
              <option value="company-za">Company Z–A</option>
            </select>

            <button
              type="button"
              className="cancel-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          {sortedApplications.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              <h3>No applications found</h3>
              <p>Add an application above or adjust your search.</p>
            </div>
          ) : (
            <div className="applications-list">
              {sortedApplications.map((application) => (
                <div className="application-card" key={application._id}>
                  <div className="application-main">
                    <div className="application-heading">
                      <div>
                        <h3>{application.companyName}</h3>
                        <p className="job-title">{application.jobTitle}</p>
                      </div>

                      {/* QUICK STATUS UPDATE */}

                      <select
                        className={`status ${String(
                          application.status || "Applied"
                        ).toLowerCase()}`}
                        value={application.status || "Applied"}
                        disabled={updatingStatusId === application._id}
                        aria-label={`Update status for ${application.companyName}`}
                        onChange={(e) =>
                          updateStatus(application, e.target.value)
                        }
                        style={{
                          cursor: "pointer",
                          border: "none",
                          outline: "none",
                        }}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          ...getPriorityStyle(
                            application.priority || "Medium"
                          ),
                          display: "inline-block",
                          padding: "6px 11px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        ⭐ {application.priority || "Medium"} Priority
                      </span>
                    </div>

                    <div className="application-details">
                      <p>
                        📍 {application.location || "Location not added"}
                      </p>

                      <p>
                        📅 Application:{" "}
                        {application.applicationDate || "Not added"}
                      </p>

                      <p>
                        🎤 Interview:{" "}
                        {application.interviewDate || "Not scheduled"}
                      </p>

                      <p>
                        🔔 Follow-up:{" "}
                        {application.followUpDate || "Not scheduled"}
                      </p>
                    </div>

                    {application.jobDescription && (
                      <div
                        style={{
                          marginTop: "15px",
                          padding: "14px",
                          background: "#f7f9fc",
                          border: "1px solid #e4e9f0",
                          borderRadius: "10px",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "7px",
                            color: "#344b3a",
                            fontSize: "13px",
                          }}
                        >
                          📋 Job Description / Requirements
                        </strong>

                        <p
                          style={{
                            margin: 0,
                            color: "#667085",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {application.jobDescription}
                        </p>
                      </div>
                    )}

                    {application.interviewPrep && (
                      <div
                        style={{
                          marginTop: "15px",
                          padding: "14px",
                          background: "#fffaf0",
                          border: "1px solid #eadfca",
                          borderRadius: "10px",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "7px",
                            color: "#5f5138",
                            fontSize: "13px",
                          }}
                        >
                          🎯 Interview Preparation
                        </strong>

                        <p
                          style={{
                            margin: 0,
                            color: "#667085",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {application.interviewPrep}
                        </p>
                      </div>
                    )}

                    {/* APPLICATION TIMELINE */}

                    {Array.isArray(application.timeline) &&
                      application.timeline.length > 0 && (
                        <div
                          style={{
                            marginTop: "15px",
                            padding: "14px",
                            background: "#f7f9fc",
                            border: "1px solid #e4e9f0",
                            borderRadius: "10px",
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              marginBottom: "10px",
                              color: "#344b3a",
                              fontSize: "13px",
                            }}
                          >
                            🕒 Application Timeline
                          </strong>

                          <div
                            style={{
                              display: "grid",
                              gap: "10px",
                            }}
                          >
                            {application.timeline
                              .slice()
                              .reverse()
                              .map((event, index) => (
                                <div
                                  key={`${event.date}-${index}`}
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      marginTop: "6px",
                                      borderRadius: "50%",
                                      background: "#5579ad",
                                      flexShrink: 0,
                                    }}
                                  />

                                  <div>
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#344b3a",
                                      }}
                                    >
                                      {event.action}
                                    </div>

                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#78869a",
                                        marginTop: "3px",
                                      }}
                                    >
                                      {event.date
                                        ? new Date(
                                            event.date
                                          ).toLocaleString()
                                        : "Date not available"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {application.jobLink && (
                      <a
                        className="job-link"
                        href={application.jobLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🔗 View Job Posting
                      </a>
                    )}

                    {application.notes && (
                      <p className="application-notes">
                        📝 {application.notes}
                      </p>
                    )}
                  </div>

                  <div className="card-buttons">
                    <button
                      className="edit-button"
                      onClick={() => editApplication(application)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteApplication(application._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;