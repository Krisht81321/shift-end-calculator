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
      <h1>Shift End Calculator</h1>
      
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
    </div>
  )
}

export default App
