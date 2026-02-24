import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [startTime, setStartTime] = useState('')
  const [hours, setHours] = useState('09')
  const [minutes, setMinutes] = useState('00')
  const [period, setPeriod] = useState('AM')
  const [shiftHours, setShiftHours] = useState('8')
  const [shiftMinutes, setShiftMinutes] = useState('30')
  const [breakHours, setBreakHours] = useState('0')
  const [breakMinutes, setBreakMinutes] = useState('0')
  const [endTime, setEndTime] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [totalHours, setTotalHours] = useState('0.00')
  const [shiftProgress, setShiftProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem('activeView')
    return savedView || 'calculator'
  }) // 'calculator' or 'logger'
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('workLoggerProjects')
    return savedProjects ? JSON.parse(savedProjects) : []
  })
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [newLogDescription, setNewLogDescription] = useState('')
  const [deleteLogConfirmId, setDeleteLogConfirmId] = useState(null)

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workLoggerProjects', JSON.stringify(projects))
  }, [projects])

  // Save active view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeView', activeView)
  }, [activeView])

  const addProject = () => {
    if (!newProjectName.trim()) return
    const newProject = {
      id: Date.now(),
      name: newProjectName,
      description: newProjectDescription,
      createdAt: new Date().toLocaleDateString(),
      workLogs: []
    }
    setProjects([newProject, ...projects])
    setNewProjectName('')
    setNewProjectDescription('')
  }

  const confirmDelete = (id) => {
    setDeleteConfirmId(id)
  }

  const deleteProject = () => {
    setProjects(projects.filter(project => project.id !== deleteConfirmId))
    setDeleteConfirmId(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const openProject = (project) => {
    setSelectedProject(project)
  }

  const closeProject = () => {
    setSelectedProject(null)
    setNewLogDescription('')
  }

  const addWorkLog = () => {
    if (!newLogDescription.trim()) return
    
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject.id) {
        const newLog = {
          id: Date.now(),
          description: newLogDescription,
          date: new Date().toLocaleDateString()
        }
        return {
          ...project,
          workLogs: [newLog, ...project.workLogs]
        }
      }
      return project
    })
    
    setProjects(updatedProjects)
    setSelectedProject({
      ...selectedProject,
      workLogs: [{
        id: Date.now(),
        description: newLogDescription,
        date: new Date().toLocaleDateString()
      }, ...selectedProject.workLogs]
    })
    setNewLogDescription('')
  }

  const deleteWorkLog = (logId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject.id) {
        return {
          ...project,
          workLogs: project.workLogs.filter(log => log.id !== deleteLogConfirmId)
        }
      }
      return project
    })
    
    setProjects(updatedProjects)
    setSelectedProject({
      ...selectedProject,
      workLogs: selectedProject.workLogs.filter(log => log.id !== deleteLogConfirmId)
    })
    setDeleteLogConfirmId(null)
  }

  const confirmDeleteLog = (logId) => {
    setDeleteLogConfirmId(logId)
  }

  const cancelDeleteLog = () => {
    setDeleteLogConfirmId(null)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      calculateProgress()
    }, 1000)
    return () => clearInterval(timer)
  }, [hours, minutes, period, shiftHours, shiftMinutes, breakHours, breakMinutes])

  useEffect(() => {
    calculateEndTime()
    calculateProgress()
  }, [hours, minutes, period, shiftHours, shiftMinutes, breakHours, breakMinutes])

  const calculateEndTime = () => {
    if (!hours || !minutes) return

    let hour24 = parseInt(hours)
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    if (period === 'AM' && hour24 === 12) hour24 = 0

    const start = new Date()
    start.setHours(hour24, parseInt(minutes), 0, 0)

    const totalMinutes = (parseInt(shiftHours || 0) * 60) + parseInt(shiftMinutes || 0) + (parseInt(breakHours || 0) * 60) + parseInt(breakMinutes || 0)
    const end = new Date(start.getTime() + totalMinutes * 60000)

    const endHours = String(end.getHours()).padStart(2, '0')
    const endMinutes = String(end.getMinutes()).padStart(2, '0')
    setEndTime(`${endHours}:${endMinutes}`)

    // Calculate total working hours (excluding break)
    const workMinutes = (parseInt(shiftHours || 0) * 60) + parseInt(shiftMinutes || 0)
    const workHours = (workMinutes / 60).toFixed(2)
    setTotalHours(workHours)
  }

  const calculateProgress = () => {
    if (!hours || !minutes) {
      setShiftProgress(0)
      setTimeRemaining('Not started')
      return
    }

    let hour24 = parseInt(hours)
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    if (period === 'AM' && hour24 === 12) hour24 = 0

    const start = new Date()
    start.setHours(hour24, parseInt(minutes), 0, 0)

    const totalMinutes = (parseInt(shiftHours || 0) * 60) + parseInt(shiftMinutes || 0) + (parseInt(breakHours || 0) * 60) + parseInt(breakMinutes || 0)
    const end = new Date(start.getTime() + totalMinutes * 60000)

    const now = new Date()
    const totalDuration = end - start
    const elapsed = now - start

    if (elapsed < 0) {
      setShiftProgress(0)
      setTimeRemaining('Not started')
    } else if (elapsed > totalDuration) {
      setShiftProgress(100)
      setTimeRemaining('Completed')
    } else {
      const progress = (elapsed / totalDuration) * 100
      setShiftProgress(progress)

      const remaining = end - now
      const remainingHours = Math.floor(remaining / (1000 * 60 * 60))
      const remainingMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      setTimeRemaining(`${remainingHours}h ${remainingMinutes}m left`)
    }
  }

  const handleHourChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setHours('')
      return
    }
    if (value.length > 2) {
      value = value.slice(0, 2)
    }
    const numValue = parseInt(value)
    if (numValue > 12) {
      setHours('12')
    } else {
      setHours(value)
    }
  }

  const handleMinuteChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setMinutes('')
      return
    }
    if (value.length > 2) {
      value = value.slice(0, 2)
    }
    const numValue = parseInt(value)
    if (numValue > 59) {
      setMinutes('59')
    } else {
      setMinutes(value)
    }
  }

  const handleHourBlur = () => {
    if (hours === '') {
      setHours('09')
    } else if (parseInt(hours) < 1) {
      setHours('01')
    } else {
      setHours(hours.padStart(2, '0'))
    }
  }

  const handleMinuteBlur = () => {
    if (minutes === '') {
      setMinutes('00')
    } else {
      setMinutes(minutes.padStart(2, '0'))
    }
  }

  const handleShiftHoursChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setShiftHours('')
      return
    }
    const numValue = parseInt(value)
    if (numValue > 24) {
      setShiftHours('24')
    } else {
      setShiftHours(value)
    }
  }

  const handleShiftMinutesChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setShiftMinutes('')
      return
    }
    const numValue = parseInt(value)
    if (numValue > 59) {
      setShiftMinutes('59')
    } else {
      setShiftMinutes(value)
    }
  }

  const handleBreakMinutesChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setBreakMinutes('')
      return
    }
    const numValue = parseInt(value)
    if (numValue > 120) {
      setBreakMinutes('120')
    } else {
      setBreakMinutes(value)
    }
  }

  const handleShiftHoursBlur = () => {
    if (shiftHours === '') {
      setShiftHours('8')
    } else {
      setShiftHours(shiftHours)
    }
  }

  const handleShiftMinutesBlur = () => {
    if (shiftMinutes === '') {
      setShiftMinutes('30')
    } else {
      setShiftMinutes(shiftMinutes)
    }
  }

  const handleBreakMinutesBlur = () => {
    if (breakMinutes === '') {
      setBreakMinutes('0')
    } else {
      setBreakMinutes(breakMinutes)
    }
  }

  const handleBreakHoursChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value === '') {
      setBreakHours('')
      return
    }
    const numValue = parseInt(value)
    if (numValue > 24) {
      setBreakHours('24')
    } else {
      setBreakHours(value)
    }
  }

  const handleBreakHoursBlur = () => {
    if (breakHours === '') {
      setBreakHours('0')
    } else {
      setBreakHours(breakHours)
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-menu">
          <button 
            className={`nav-item ${activeView === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveView('calculator')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Calculator
          </button>
          <button 
            className={`nav-item ${activeView === 'logger' ? 'active' : ''}`}
            onClick={() => setActiveView('logger')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Work Logger
          </button>
        </div>
      </nav>
      
      {activeView === 'calculator' ? (
        <div className="main-container">
        <div className="left-section">
          <div className="current-time-card">
            <div className="time-label">Current Time</div>
            <div className="current-time">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="current-date">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {endTime && (
            <>
              <div className="result-card">
                <h2>Shift Ends At</h2>
                <div className="end-time">{endTime}</div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${shiftProgress}%` }}></div>
                  </div>
                  <div className="progress-label">{timeRemaining}</div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Work Hours</div>
                  <div className="stat-value">{totalHours}h</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Break</div>
                  <div className="stat-value">{breakHours}h {breakMinutes}m</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="calculator-card">
          <div className="input-group">
            <label>Shift Start Time</label>
            <div className="time-picker">
              <input
                type="text"
                className="time-input"
                value={hours}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                placeholder="09"
                maxLength="2"
              />
              <span className="time-separator">:</span>
              <input
                type="text"
                className="time-input"
                value={minutes}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                placeholder="00"
                maxLength="2"
              />
              <div className="period-selector">
                <button
                  type="button"
                  className={period === 'AM' ? 'active' : ''}
                  onClick={() => setPeriod('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={period === 'PM' ? 'active' : ''}
                  onClick={() => setPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Shift Duration</label>
            <div className="duration-inputs">
              <div>
                <input
                  type="text"
                  min="0"
                  max="24"
                  value={shiftHours}
                  onChange={handleShiftHoursChange}
                  onBlur={handleShiftHoursBlur}
                  placeholder="8"
                />
                <span>hours</span>
              </div>
              <div>
                <input
                  type="text"
                  min="0"
                  max="59"
                  value={shiftMinutes}
                  onChange={handleShiftMinutesChange}
                  onBlur={handleShiftMinutesBlur}
                  placeholder="30"
                />
                <span>minutes</span>
              </div>
              <div>
                <input
                  type="text"
                  min="0"
                  max="24"
                  value={breakHours}
                  onChange={handleBreakHoursChange}
                  onBlur={handleBreakHoursBlur}
                  placeholder="0"
                />
                <span>break h</span>
              </div>
              <div>
                <input
                  type="text"
                  min="0"
                  max="59"
                  value={breakMinutes}
                  onChange={handleBreakMinutesChange}
                  onBlur={handleBreakMinutesBlur}
                  placeholder="30"
                />
                <span>break m</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="work-logger-view">
          <div className="logger-container">
            <div className="add-project-card">
              <h3>Add New Project</h3>
              <div className="project-form">
                <input
                  type="text"
                  className="project-input"
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                />
                <textarea
                  className="project-textarea"
                  placeholder="Project description (optional)"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows="2"
                />
                <button 
                  className="add-project-btn"
                  onClick={addProject}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Project
                </button>
              </div>
            </div>

            <div className="projects-section">
              <div className="projects-header">
                <h3>My Projects</h3>
                {projects.length > 0 && (
                  <div className="project-count">
                    {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                  </div>
                )}
              </div>

              {projects.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                  <p>No projects yet</p>
                  <span>Create your first project above</span>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project) => (
                    <div key={project.id} className="project-card" onClick={() => openProject(project)}>
                      <div className="project-header">
                        <div className="project-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                          </svg>
                        </div>
                        <button 
                          className="delete-project-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(project.id)
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="project-content">
                        <h4 className="project-name">{project.name}</h4>
                        {project.description && (
                          <p className="project-description">{project.description}</p>
                        )}
                        <div className="project-meta">
                          <span className="project-date">Created {project.createdAt}</span>
                          {project.workLogs && project.workLogs.length > 0 && (
                            <span className="project-logs">{project.workLogs.length} logs</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {deleteConfirmId && (
            <div className="modal-overlay" onClick={cancelDelete}>
              <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3>Delete Project?</h3>
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="confirm-actions">
                  <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                  <button className="delete-btn-confirm" onClick={deleteProject}>Delete</button>
                </div>
              </div>
            </div>
          )}

          {selectedProject && (
            <div className="modal-overlay" onClick={closeProject}>
              <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h2>{selectedProject.name}</h2>
                    {selectedProject.description && (
                      <p className="modal-description">{selectedProject.description}</p>
                    )}
                  </div>
                  <button className="close-btn" onClick={closeProject}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="work-log-form">
                  <h3>Add Work Log</h3>
                  <div className="log-inputs">
                    <input
                      type="text"
                      className="log-input"
                      placeholder="What did you work on?"
                      value={newLogDescription}
                      onChange={(e) => setNewLogDescription(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWorkLog()}
                    />
                    <button className="add-log-btn" onClick={addWorkLog}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add
                    </button>
                  </div>
                </div>

                <div className="work-logs-section">
                  <div className="logs-section-header">
                    <h3>Work Logs</h3>
                  </div>

                  {!selectedProject.workLogs || selectedProject.workLogs.length === 0 ? (
                    <div className="empty-logs">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <p>No work logs yet</p>
                      <span>Add your first work log above</span>
                    </div>
                  ) : (
                    <div className="work-logs-list">
                      {selectedProject.workLogs.map((log) => (
                        <div key={log.id} className="work-log-item">
                          <div className="log-info">
                            <div className="log-desc">{log.description}</div>
                            <div className="log-details">
                              <span className="log-date">{log.date}</span>
                            </div>
                          </div>
                          <button 
                            className="delete-log-btn"
                            onClick={() => confirmDeleteLog(log.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {deleteLogConfirmId && (
                  <div className="modal-overlay" onClick={cancelDeleteLog} style={{ zIndex: 1001 }}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                      <div className="confirm-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <h3>Delete Work Log?</h3>
                      <p>Are you sure you want to delete this work log? This action cannot be undone.</p>
                      <div className="confirm-actions">
                        <button className="cancel-btn" onClick={cancelDeleteLog}>Cancel</button>
                        <button className="delete-btn-confirm" onClick={deleteWorkLog}>Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
