const socketIO = require('socket.io');

class TerminalLogger {
  constructor(server) {
    this.io = socketIO(server);
    this.logs = [];
    this.metrics = {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      activeGenerations: 0,
      totalGenerations: 0
    };
    
    this.setupSocketHandlers();
    this.startMetricsInterval();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Terminal client connected');
      
      // Send existing logs to new client
      socket.emit('initial-logs', this.logs.slice(-1000));
      socket.emit('metrics-update', this.metrics);
      
      socket.on('clear-logs', () => {
        this.logs = [];
        this.io.emit('logs-cleared');
      });
      
      socket.on('export-logs', (format) => {
        socket.emit('export-data', this.exportLogs(format));
      });
      
      socket.on('disconnect', () => {
        console.log('Terminal client disconnected');
      });
    });
  }

  startMetricsInterval() {
    setInterval(() => {
      this.io.emit('metrics-update', this.metrics);
    }, 1000);
  }

  log(type, message, data = {}) {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    this.io.emit('new-log', logEntry);
    
    // Also log to console for standard logging
    const consoleMsg = `[${type.toUpperCase()}] ${message}`;
    if (type === 'error') {
      console.error(consoleMsg, data);
    } else {
      console.log(consoleMsg, data);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  success(message, data) {
    this.log('success', message, data);
    this.metrics.successCount++;
  }

  warning(message, data) {
    this.log('warning', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
    this.metrics.errorCount++;
  }

  startGeneration(id) {
    this.metrics.activeGenerations++;
    this.info(`🚀 Starting content generation`, { generationId: id });
  }

  endGeneration(id, success) {
    this.metrics.activeGenerations--;
    if (success) {
      this.metrics.totalGenerations++;
      this.success(`✅ Generation completed`, { generationId: id });
    } else {
      this.error(`❌ Generation failed`, { generationId: id });
    }
  }

  async measurePerformance(name, asyncFunction) {
    const start = Date.now();
    this.info(`⏱️ Starting ${name}`);
    
    try {
      const result = await asyncFunction();
      const duration = Date.now() - start;
      
      this.success(`✅ ${name} completed`, { duration: `${duration}ms` });
      this.metrics.totalResponseTime += duration;
      this.metrics.totalRequests++;
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`❌ ${name} failed`, { 
        duration: `${duration}ms`, 
        error: error.message 
      });
      throw error;
    }
  }

  exportLogs(format) {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      
      case 'csv':
        const headers = 'Timestamp,Type,Message,Data\n';
        const rows = this.logs.map(log => 
          `"${log.timestamp}","${log.type}","${log.message}","${JSON.stringify(log.data).replace(/"/g, '""')}"`
        ).join('\n');
        return headers + rows;
      
      case 'text':
        return this.logs.map(log => 
          `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message} ${JSON.stringify(log.data)}`
        ).join('\n');
      
      default:
        return '';
    }
  }
}

module.exports = TerminalLogger;