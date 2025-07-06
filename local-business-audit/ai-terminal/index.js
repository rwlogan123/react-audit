#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import chokidar from 'chokidar';

const execAsync = promisify(exec);

class MarketingAI {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.projectRoot = process.cwd();
    this.conversationHistory = [];
    this.isWatching = false;
    this.contextCache = null;
    this.cacheExpiry = null;
    this.retryAttempts = 3;
    
    console.log(chalk.blue('🤖 Marketing Platform AI Terminal v2.0'));
    console.log(chalk.gray('Enhanced with marketing-specific intelligence...\n'));
  }

  // Core AI execution with enhanced error handling and retries
  async executeCommand(userInput, retryCount = 0) {
    try {
      const context = await this.getEnhancedProjectContext();
      
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `You are an AI assistant for a digital marketing agency platform. This platform includes:
- Local business audit tool (React frontend + Express backend)
- Marketing automation with Ligna CRM integration
- Email sequences for lead nurturing
- Client portal for project delivery
- MongoDB database for storing audit results and clients
- Real-time file monitoring and optimization

ENHANCED PROJECT CONTEXT:
${context}

CONVERSATION HISTORY:
${this.conversationHistory.slice(-3).map(h => `User: ${h.user}\nAI: ${h.ai.substring(0, 200)}...`).join('\n')}

USER REQUEST: ${userInput}

You can help with:
1. React component analysis and optimization
2. Express API route debugging and enhancement
3. MongoDB query optimization and schema design
4. Ligna CRM integration planning and implementation
5. Email marketing automation strategies
6. Local business audit improvements
7. Performance monitoring and optimization
8. Deployment and scaling assistance
9. Marketing funnel conversion optimization
10. Content generation for local businesses

Provide specific, actionable responses with exact code when needed. For marketing strategies, include conversion optimization tactics. For technical issues, provide complete solutions.`
          }
        ]
      });

      const aiResponse = response.content[0].text;
      
      // Store conversation with timestamp
      this.conversationHistory.push({
        user: userInput,
        ai: aiResponse,
        timestamp: new Date()
      });

      // Keep only last 10 conversations to manage memory
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return aiResponse;
    } catch (error) {
      if (retryCount < this.retryAttempts && error.message.includes('rate_limit')) {
        console.log(chalk.yellow(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`));
        await this.sleep((retryCount + 1) * 2000);
        return this.executeCommand(userInput, retryCount + 1);
      }
      
      return chalk.red(`Error (attempt ${retryCount + 1}/${this.retryAttempts + 1}): ${error.message}`);
    }
  }

  // Enhanced project context with caching and marketing-specific analysis
  async getEnhancedProjectContext() {
    // Use cache if still valid (5 minutes)
    if (this.contextCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.contextCache;
    }

    const context = {
      timestamp: new Date().toISOString(),
      currentDirectory: process.cwd(),
      gitStatus: await this.safeExec('git status --porcelain'),
      gitBranch: await this.safeExec('git branch --show-current'),
      recentCommits: await this.safeExec('git log --oneline -5'),
      
      // Project Structure Analysis
      projectStructure: await this.getProjectStructure(),
      
      // Marketing Platform Specific
      marketingPlatform: await this.getMarketingPlatformContext(),
      
      // Technical Analysis
      dependencies: this.analyzeDependencies(),
      apiEndpoints: await this.discoverApiEndpoints(),
      reactComponents: await this.analyzeReactComponents(),
      databaseInfo: await this.analyzeDatabaseStructure(),
      
      // System Info
      environment: this.getSafeEnvVars(),
      systemHealth: await this.getSystemHealth(),
      
      // Performance Metrics
      performanceMetrics: await this.getPerformanceMetrics()
    };
    
    // Cache for 5 minutes
    this.contextCache = JSON.stringify(context, null, 2);
    this.cacheExpiry = Date.now() + (5 * 60 * 1000);
    
    return this.contextCache;
  }

  // Analyze marketing platform specific structure
  async getMarketingPlatformContext() {
    const context = {
      auditTool: {
        backend: this.readFileIfExists('../backend/server.js') || this.readFileIfExists('../backend/index.js'),
        routes: await this.findFiles('../backend', 'routes'),
        services: await this.findFiles('../backend', 'services'),
        models: await this.findFiles('../backend', 'models')
      },
      frontend: {
        mainApp: this.readFileIfExists('../frontend/src/App.js') || this.readFileIfExists('../frontend/src/App.jsx'),
        components: await this.findFiles('../frontend/src', 'components'),
        pages: await this.findFiles('../frontend/src', 'pages'),
        utils: await this.findFiles('../frontend/src', 'utils')
      },
      config: {
        packageJson: this.readFileIfExists('../package.json'),
        envExample: this.readFileIfExists('../.env.example'),
        readme: this.readFileIfExists('../README.md'),
        dockerFile: this.readFileIfExists('../Dockerfile')
      },
      database: {
        migrations: await this.findFiles('.', 'migrations'),
        schemas: await this.findFiles('.', 'schema'),
        seeders: await this.findFiles('.', 'seeds')
      }
    };

    return context;
  }

  // Enhanced project structure analysis
  async getProjectStructure() {
    const structure = await this.getFileTree('..', 4, 0);
    
    // Add analysis of key directories
    const analysis = {
      structure: structure,
      keyDirectories: {
        hasBackend: fs.existsSync('../backend'),
        hasFrontend: fs.existsSync('../frontend'),
        hasDatabase: fs.existsSync('../database') || fs.existsSync('../db'),
        hasTests: fs.existsSync('../tests') || fs.existsSync('../test'),
        hasDocumentation: fs.existsSync('../docs') || fs.existsSync('../README.md')
      },
      projectType: this.detectProjectType()
    };

    return analysis;
  }

  // Detect project architecture type
  detectProjectType() {
    const hasReact = this.readFileIfExists('../frontend/package.json')?.includes('react');
    const hasExpress = this.readFileIfExists('../backend/package.json')?.includes('express');
    const hasVite = this.readFileIfExists('../frontend/package.json')?.includes('vite');
    const hasNextJs = this.readFileIfExists('../package.json')?.includes('next');

    if (hasReact && hasExpress) return 'Full-Stack React + Express';
    if (hasNextJs) return 'Next.js Application';
    if (hasReact && hasVite) return 'React + Vite Application';
    if (hasExpress) return 'Express API Server';
    if (hasReact) return 'React Application';
    
    return 'Node.js Project';
  }

  // Discover API endpoints from Express routes
  async discoverApiEndpoints() {
    const routeFiles = await this.findFiles('../backend', 'routes');
    const endpoints = [];

    for (const file of routeFiles) {
      const content = this.readFileIfExists(file);
      if (content) {
        // Extract routes using regex
        const routeMatches = content.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
        if (routeMatches) {
          routeMatches.forEach(match => {
            const [, method, path] = match.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
            endpoints.push({
              method: method.toUpperCase(),
              path: path,
              file: file
            });
          });
        }
      }
    }

    return endpoints;
  }

  // Analyze React components
  async analyzeReactComponents() {
    const componentFiles = await this.findFiles('../frontend/src', '.jsx', '.js');
    const components = [];

    for (const file of componentFiles.slice(0, 10)) { // Limit to first 10 to avoid overload
      const content = this.readFileIfExists(file);
      if (content && (content.includes('function ') || content.includes('const ') || content.includes('class '))) {
        const componentName = path.basename(file, path.extname(file));
        const hasHooks = content.includes('useState') || content.includes('useEffect');
        const hasProps = content.includes('props.') || content.includes('{') && content.includes('}');
        
        components.push({
          name: componentName,
          file: file,
          hasHooks,
          hasProps,
          linesOfCode: content.split('\n').length
        });
      }
    }

    return components;
  }

  // Analyze database structure
  async analyzeDatabaseStructure() {
    const analysis = {
      type: 'Unknown',
      connectionString: process.env.MONGODB_URI ? 'MongoDB' : 'Unknown',
      models: [],
      migrations: []
    };

    // Look for MongoDB models
    const modelFiles = await this.findFiles('../backend', 'models');
    for (const file of modelFiles) {
      const content = this.readFileIfExists(file);
      if (content && content.includes('Schema')) {
        analysis.models.push({
          file: file,
          name: path.basename(file, '.js'),
          hasValidation: content.includes('required:') || content.includes('validate:')
        });
      }
    }

    return analysis;
  }

  // Analyze project dependencies
  analyzeDependencies() {
    const backendPkg = this.readJsonIfExists('../backend/package.json');
    const frontendPkg = this.readJsonIfExists('../frontend/package.json');
    const rootPkg = this.readJsonIfExists('../package.json');

    return {
      backend: backendPkg ? {
        dependencies: Object.keys(backendPkg.dependencies || {}),
        devDependencies: Object.keys(backendPkg.devDependencies || {}),
        scripts: Object.keys(backendPkg.scripts || {})
      } : null,
      frontend: frontendPkg ? {
        dependencies: Object.keys(frontendPkg.dependencies || {}),
        devDependencies: Object.keys(frontendPkg.devDependencies || {}),
        scripts: Object.keys(frontendPkg.scripts || {})
      } : null,
      root: rootPkg ? {
        dependencies: Object.keys(rootPkg.dependencies || {}),
        devDependencies: Object.keys(rootPkg.devDependencies || {}),
        scripts: Object.keys(rootPkg.scripts || {})
      } : null
    };
  }

  // Get system health metrics
  async getSystemHealth() {
    return {
      uptime: await this.safeExec('uptime'),
      diskUsage: await this.safeExec('df -h'),
      memoryUsage: await this.safeExec('free -h'),
      networkConnections: await this.safeExec('netstat -tulpn | grep LISTEN | head -10'),
      runningProcesses: await this.safeExec('ps aux | grep -E "(node|npm)" | grep -v grep')
    };
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    return {
      nodeVersion: await this.safeExec('node --version'),
      npmVersion: await this.safeExec('npm --version'),
      gitStatus: await this.safeExec('git status --porcelain | wc -l'),
      lastCommit: await this.safeExec('git log -1 --format="%h %s %cr"')
    };
  }

  // Find files with specific patterns
  async findFiles(dir, ...patterns) {
    if (!fs.existsSync(dir)) return [];
    
    try {
      const files = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, ...patterns);
          files.push(...subFiles);
        } else {
          const matchesPattern = patterns.some(pattern => 
            item.name.includes(pattern) || item.name.endsWith(pattern)
          );
          if (matchesPattern) {
            files.push(fullPath);
          }
        }
      }
      
      return files.slice(0, 20); // Limit results
    } catch (error) {
      return [];
    }
  }

  // Enhanced file tree with better filtering
  async getFileTree(dir = '.', maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return {};
    
    try {
      const tree = {};
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        // Skip hidden files, node_modules, etc.
        if (item.name.startsWith('.') && !['gitignore', 'env.example', 'env'].includes(item.name.slice(1))) continue;
        if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item.name)) continue;
        
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          tree[item.name] = await this.getFileTree(fullPath, maxDepth, currentDepth + 1);
        } else {
          const stats = fs.statSync(fullPath);
          tree[item.name] = {
            size: stats.size,
            modified: stats.mtime,
            isExecutable: !!(stats.mode & parseInt('111', 8)),
            extension: path.extname(item.name)
          };
        }
      }
      
      return tree;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Read JSON files safely
  readJsonIfExists(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Enhanced file reading with better size limits
  readFileIfExists(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Different limits for different file types
        const ext = path.extname(filePath);
        let limit = 5000;
        
        if (['.md', '.txt'].includes(ext)) limit = 10000;
        if (['.json'].includes(ext)) limit = 3000;
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) limit = 8000;
        
        return content.length > limit ? content.substring(0, limit) + '\n... (truncated)' : content;
      }
      return null;
    } catch (error) {
      return `Error reading ${filePath}: ${error.message}`;
    }
  }

  // Enhanced safe command execution with timeout
  async safeExec(command, timeout = 5000) {
    try {
      const { stdout } = await Promise.race([
        execAsync(command),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Command timeout')), timeout))
      ]);
      return stdout.trim();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // Get enhanced environment variables
  getSafeEnvVars() {
    const safeVars = {};
    const allowedKeys = [
      'NODE_ENV', 'PORT', 'DATABASE_NAME', 'PLATFORM_NAME',
      'MONGODB_URI', 'LIGNA_API_KEY', 'ANTHROPIC_API_KEY'
    ];
    
    for (const key of allowedKeys) {
      if (process.env[key]) {
        // Mask sensitive values
        if (key.includes('KEY') || key.includes('URI')) {
          safeVars[key] = `${process.env[key].substring(0, 10)}...***`;
        } else {
          safeVars[key] = process.env[key];
        }
      }
    }
    
    return safeVars;
  }

  // Enhanced file watcher with better filtering
  startWatching() {
    if (this.isWatching) return;
    
    console.log(chalk.yellow('👁️  Starting enhanced file watcher...'));
    
    this.watcher = chokidar.watch(['../backend', '../frontend', '../'], {
      ignored: /(^|[\/\\])\..|(node_modules|dist|build|coverage)/,
      persistent: true,
      ignoreInitial: true
    });
    
    this.watcher.on('change', async (filePath) => {
      if (this.isImportantFile(filePath)) {
        console.log(chalk.cyan(`\n📝 File changed: ${path.relative(process.cwd(), filePath)}`));
        const analysis = await this.analyzeFileChange(filePath);
        console.log(chalk.gray(analysis));
        console.log(chalk.green('> ')); // Re-prompt
        
        // Invalidate cache on important changes
        this.contextCache = null;
        this.cacheExpiry = null;
      }
    });
    
    this.isWatching = true;
  }

  // Enhanced file importance checking
  isImportantFile(filePath) {
    const important = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.sql', '.env'];
    const isImportantExt = important.some(ext => filePath.endsWith(ext));
    const isConfigFile = ['package.json', 'vite.config.js', 'server.js', 'index.js'].some(file => 
      filePath.endsWith(file)
    );
    
    return isImportantExt || isConfigFile;
  }

  // Enhanced file change analysis
  async analyzeFileChange(filePath) {
    const fileContent = this.readFileIfExists(filePath);
    
    if (!fileContent) return '';
    
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Quick analysis of this file change in the marketing platform:
          File: ${filePath}
          Type: ${this.getFileType(filePath)}
          Content: ${fileContent.substring(0, 1000)}
          
          Brief impact analysis and any immediate concerns?`
        }]
      });
      
      return response.content[0].text;
    } catch (error) {
      return `Analysis error: ${error.message}`;
    }
  }

  // Determine file type for better analysis
  getFileType(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    if (fileName === 'package.json') return 'Package Configuration';
    if (fileName.includes('server') || fileName.includes('app')) return 'Server/Application File';
    if (ext === '.jsx' || ext === '.tsx') return 'React Component';
    if (ext === '.js' && filePath.includes('frontend')) return 'Frontend JavaScript';
    if (ext === '.js' && filePath.includes('backend')) return 'Backend JavaScript';
    if (ext === '.json') return 'Configuration File';
    if (ext === '.md') return 'Documentation';
    if (ext === '.env') return 'Environment Configuration';
    
    return 'Code File';
  }

  // Enhanced marketing platform commands
  async handleMarketingCommand(command, args) {
    // Clear cache for fresh analysis
    this.contextCache = null;
    this.cacheExpiry = null;
    
    switch (command) {
      case 'audit':
        return await this.handleAuditCommand(args);
      case 'ligna':
        return await this.handleLignaCommand(args);
      case 'email':
        return await this.handleEmailCommand(args);
      case 'performance':
        return await this.handlePerformanceCommand(args);
      case 'deploy':
        return await this.handleDeployCommand(args);
      case 'analyze':
        return await this.handleAnalyzeCommand(args);
      case 'generate':
        return await this.handleGenerateCommand(args);
      case 'test':
        return await this.handleTestCommand(args);
      default:
        return chalk.red(`Unknown marketing command: ${command}\nType 'help' for available commands.`);
    }
  }

  // Enhanced audit commands
  async handleAuditCommand(args) {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'status':
        return await this.executeCommand('Analyze the current status of the audit tool, including recent completions, conversion rates, and performance metrics. Check database connections and API health.');
      case 'analyze':
        const auditId = args[1];
        return await this.executeCommand(`Perform detailed analysis of audit ${auditId || 'system'}. Include technical recommendations, conversion optimization, and marketing strategy suggestions.`);
      case 'conversions':
        return await this.executeCommand('Deep dive into audit-to-client conversion rates. Analyze the funnel, identify bottlenecks, and provide specific optimization strategies.');
      case 'optimize':
        return await this.executeCommand('Analyze the audit tool codebase and suggest optimizations for performance, user experience, and conversion rates.');
      default:
        return chalk.yellow('Available audit commands: status, analyze [id], conversions, optimize');
    }
  }

  // Enhanced Ligna commands
  async handleLignaCommand(args) {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'health':
        return await this.executeCommand('Check Ligna API integration health, webhook status, and connection reliability. Provide troubleshooting steps if needed.');
      case 'sync':
        return await this.executeCommand('Verify audit data is syncing properly to Ligna. Check webhook implementation and data mapping.');
      case 'contacts':
        return await this.executeCommand('Analyze recent contact creation activity in Ligna and sync status with audit completions.');
      case 'setup':
        return await this.executeCommand('Provide step-by-step guidance for setting up Ligna integration, including webhook creation and API configuration.');
      default:
        return chalk.yellow('Available ligna commands: health, sync, contacts, setup');
    }
  }

  // Enhanced email commands
  async handleEmailCommand(args) {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'performance':
        return await this.executeCommand('Analyze email sequence performance, open rates, click-through rates, and conversion metrics. Suggest improvements.');
      case 'optimize':
        return await this.executeCommand('Provide specific optimization suggestions for email sequences including subject lines, content, and timing.');
      case 'generate':
        const industry = args[1] || 'general local business';
        return await this.executeCommand(`Generate a complete email marketing sequence for ${industry}. Include subject lines, content, and call-to-actions optimized for local businesses.`);
      case 'templates':
        return await this.executeCommand('Create email templates for different stages of the marketing funnel: lead magnet, nurture sequence, and conversion emails.');
      default:
        return chalk.yellow('Available email commands: performance, optimize, generate [industry], templates');
    }
  }

  // New analyze command for deep technical analysis
  async handleAnalyzeCommand(args) {
    const target = args[0];
    
    switch (target) {
      case 'frontend':
        return await this.executeCommand('Analyze the React frontend code structure, components, performance, and suggest improvements for user experience and conversion optimization.');
      case 'backend':
        return await this.executeCommand('Analyze the Express backend code, API endpoints, database queries, and suggest optimizations for performance and scalability.');
      case 'database':
        return await this.executeCommand('Analyze database structure, query performance, and suggest schema optimizations for the audit and client data.');
      case 'security':
        return await this.executeCommand('Perform security analysis of the marketing platform, checking for vulnerabilities, authentication issues, and data protection concerns.');
      default:
        return chalk.yellow('Available analyze commands: frontend, backend, database, security');
    }
  }

  // New generate command for creating marketing assets
  async handleGenerateCommand(args) {
    const type = args[0];
    const target = args.slice(1).join(' ') || 'local businesses';
    
    switch (type) {
      case 'webhook':
        return await this.executeCommand('Generate complete webhook implementation code for Ligna integration, including error handling and data validation.');
      case 'email':
        return await this.executeCommand(`Generate email marketing content for ${target}, including subject lines and body content optimized for conversions.`);
      case 'landing':
        return await this.executeCommand(`Generate landing page copy and structure for ${target} audit tool, optimized for lead generation.`);
      case 'api':
        return await this.executeCommand('Generate API endpoint code for common marketing platform operations like audit creation, result retrieval, and client management.');
      default:
        return chalk.yellow('Available generate commands: webhook, email [target], landing [target], api');
    }
  }

  // New test command for checking integrations
  async handleTestCommand(args) {
    const target = args[0];
    
    switch (target) {
      case 'connections':
        return await this.executeCommand('Test all system connections including database, APIs, and external services. Provide status report and troubleshooting steps.');
      case 'api':
        return await this.executeCommand('Generate test cases and test the API endpoints for functionality, performance, and error handling.');
      case 'integration':
        return await this.executeCommand('Test the complete audit-to-client pipeline, including Ligna integration and email automation.');
      default:
        return chalk.yellow('Available test commands: connections, api, integration');
    }
  }

  // Enhanced performance command
  async handlePerformanceCommand(args) {
    return await this.executeCommand('Comprehensive performance analysis of the marketing platform including API response times, database query efficiency, frontend load times, and conversion funnel performance. Provide specific optimization recommendations.');
  }

  // Enhanced deploy command
  async handleDeployCommand(args) {
    return await this.executeCommand('Provide deployment assistance including pre-deployment checks, environment configuration, database migrations, and post-deployment verification steps.');
  }

  // Utility function for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Interactive chat mode with enhanced prompts
  async startInteractiveMode() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(chalk.green('\n🤖 Enhanced AI Terminal Ready! Type "help" for commands or "exit" to quit\n'));
    console.log(chalk.gray('Pro tip: Try "analyze frontend" or "generate email restaurants" for marketing-specific help\n'));
    
    const askQuestion = () => {
      rl.question(chalk.green('> '), async (input) => {
        if (input.toLowerCase() === 'exit') {
          this.stopWatching();
          console.log(chalk.blue('\n👋 Enhanced AI Terminal closed'));
          rl.close();
          return;
        }
        
        if (input.toLowerCase() === 'watch') {
          this.startWatching();
          askQuestion();
          return;
        }
        
        if (input.toLowerCase() === 'unwatch') {
          this.stopWatching();
          askQuestion();
          return;
        }
        
        if (input.toLowerCase() === 'clear') {
          console.clear();
          console.log(chalk.blue('🤖 Marketing Platform AI Terminal v2.0'));
          console.log(chalk.gray('Enhanced with marketing-specific intelligence...\n'));
          askQuestion();
          return;
        }
        
        if (input.toLowerCase() === 'help') {
          this.showHelp();
          askQuestion();
          return;
        }
        
        // Handle marketing platform commands
        const parts = input.split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        
        const marketingCommands = ['audit', 'ligna', 'email', 'performance', 'deploy', 'analyze', 'generate', 'test'];
        
        if (marketingCommands.includes(command)) {
          console.log(chalk.yellow('\n🔄 Processing marketing command...\n'));
          const response = await this.handleMarketingCommand(command, args);
          console.log('\n' + response + '\n');
        } else {
          // General AI assistance
          console.log(chalk.yellow('\n🤔 Analyzing your request...\n'));
          const response = await this.executeCommand(input);
          console.log('\n' + chalk.cyan(response) + '\n');
        }
        
        askQuestion();
      });
    };
    
    askQuestion();
  }

  // Enhanced help with new commands
  showHelp() {
    console.log(chalk.blue('\n🤖 Enhanced Marketing AI Terminal v2.0 Commands:\n'));
    
    console.log(chalk.yellow('Marketing Platform Commands:'));
    console.log('  audit status              - Check audit tool status and metrics');
    console.log('  audit analyze [id]        - Analyze specific audit or system');
    console.log('  audit conversions         - Analyze conversion funnel');
    console.log('  audit optimize            - Optimize audit tool performance');
    console.log('  ligna health              - Check Ligna integration');
    console.log('  ligna setup               - Ligna integration setup guide');
    console.log('  email performance         - Email metrics analysis');
    console.log('  email optimize            - Email optimization suggestions');
    console.log('  email generate [industry] - Generate email content');
    console.log('  performance               - Full platform performance analysis');
    console.log('  deploy                    - Deployment assistance');
    
    console.log(chalk.yellow('\nAnalysis Commands:'));
    console.log('  analyze frontend          - React components analysis');
    console.log('  analyze backend           - Express API analysis');
    console.log('  analyze database          - Database optimization');
    console.log('  analyze security          - Security audit');
    
    console.log(chalk.yellow('\nGeneration Commands:'));
    console.log('  generate webhook          - Create Ligna webhook code');
    console.log('  generate email [target]   - Create email content');
    console.log('  generate landing [target] - Create landing page copy');
    console.log('  generate api              - Create API endpoints');
    
    console.log(chalk.yellow('\nTesting Commands:'));
    console.log('  test connections          - Test all system connections');
    console.log('  test api                  - Test API endpoints');
    console.log('  test integration          - Test complete pipeline');
    
    console.log(chalk.yellow('\nGeneral Commands:'));
    console.log('  watch                     - Start file monitoring');
    console.log('  unwatch                   - Stop file monitoring');
    console.log('  clear                     - Clear terminal screen');
    console.log('  help                      - Show this help');
    console.log('  exit                      - Exit terminal');
    
    console.log(chalk.yellow('\nNatural Language Examples:'));
    console.log('  "Why are my conversions low this week?"');
    console.log('  "How do I optimize my React components?"');
    console.log('  "Generate a complete email sequence for restaurants"');
    console.log('  "Check if my database queries are optimized"');
    console.log('  "Help me set up the Ligna webhook integration"\n');
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.isWatching = false;
      console.log(chalk.yellow('👁️  Enhanced file watcher stopped'));
    }
  }
}

// CLI Setup with enhanced commands
const program = new Command();
const ai = new MarketingAI();

program
  .name('ai')
  .description('Enhanced AI Terminal for Marketing Platform')
  .version('2.0.0');

// Interactive mode (default)
program
  .command('chat')
  .description('Start interactive AI chat')
  .action(async () => {
    await ai.startInteractiveMode();
  });

// Quick command execution
program
  .command('ask <question>')
  .description('Ask a quick question')
  .action(async (question) => {
    const response = await ai.executeCommand(question);
    console.log(chalk.cyan(response));
  });

// Enhanced marketing platform commands
program
  .command('audit <subcommand> [args...]')
  .description('Audit-related commands (status, analyze, conversions, optimize)')
  .action(async (subcommand, args) => {
    const response = await ai.handleMarketingCommand('audit', [subcommand, ...args]);
    console.log(response);
  });

program
  .command('ligna <subcommand> [args...]')
  .description('Ligna integration commands (health, sync, contacts, setup)')
  .action(async (subcommand, args) => {
    const response = await ai.handleMarketingCommand('ligna', [subcommand, ...args]);
    console.log(response);
  });

program
  .command('analyze <target>')
  .description('Deep analysis commands (frontend, backend, database, security)')
  .action(async (target) => {
    const response = await ai.handleMarketingCommand('analyze', [target]);
    console.log(response);
  });

program
  .command('generate <type> [target...]')
  .description('Generate marketing assets (webhook, email, landing, api)')
  .action(async (type, target) => {
    const response = await ai.handleMarketingCommand('generate', [type, ...target]);
    console.log(response);
  });

program
  .command('test <target>')
  .description('Test system components (connections, api, integration)')
  .action(async (target) => {
    const response = await ai.handleMarketingCommand('test', [target]);
    console.log(response);
  });

// Default to interactive mode if no command specified
if (process.argv.length <= 2) {
  ai.startInteractiveMode();
} else {
  program.parse();
}