// auditAnalyzer.js - CommonJS version for your backend
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class AuditToolAnalyzer {
  constructor() {
    this.backendServices = [];
    this.frontendTabs = [];
    this.dataStructure = {};
    this.missingConnections = [];
    this.recommendations = [];
    
    // Initialize Anthropic client if API key exists
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      console.log('⚠️  No ANTHROPIC_API_KEY found. Running local analysis only.');
    }
  }

  // Scan all backend services
  async scanBackendServices() {
    const servicesPath = './services';
    try {
      const files = await fs.readdir(servicesPath);
      
      for (const file of files) {
        if (file.endsWith('.js') && file !== 'auditProcessor.js') {
          const filePath = path.join(servicesPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          this.backendServices.push({
            name: file.replace('.js', ''),
            file: file,
            content: content,
            exports: this.extractExports(content),
            dataPoints: this.extractDataPoints(content)
          });
        }
      }
    } catch (error) {
      console.error('Error scanning backend services:', error.message);
    }
  }

  // Scan all frontend tabs
  async scanFrontendTabs() {
    const tabsPath = '../frontend/src/components/tabs';
    try {
      const files = await fs.readdir(tabsPath);
      
      for (const file of files) {
        if (file.endsWith('.jsx')) {
          const filePath = path.join(tabsPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          this.frontendTabs.push({
            name: file.replace('Tab.jsx', '').replace('.jsx', ''),
            file: file,
            content: content,
            dataUsage: this.extractDataUsage(content),
            missingData: []
          });
        }
      }
    } catch (error) {
      console.error('Error scanning frontend tabs:', error.message);
    }
  }

  // Extract what data each service exports
  extractExports(content) {
    const exports = [];
    
    // Look for return statements and object properties
    const returnMatches = content.match(/return\s*{[\s\S]*?}/g);
    if (returnMatches) {
      returnMatches.forEach(match => {
        const properties = match.match(/(\w+):/g);
        if (properties) {
          properties.forEach(prop => {
            exports.push(prop.replace(':', '').trim());
          });
        }
      });
    }

    // Look for module.exports patterns
    const moduleExports = content.match(/module\.exports\s*=\s*{[\s\S]*?}/g);
    if (moduleExports) {
      moduleExports.forEach(match => {
        const properties = match.match(/(\w+):/g);
        if (properties) {
          properties.forEach(prop => {
            exports.push(prop.replace(':', '').trim());
          });
        }
      });
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  // Extract what data points are being generated
  extractDataPoints(content) {
    const dataPoints = [];
    
    // Common patterns in your services
    const patterns = [
      /(\w+Score)/g,
      /(\w+Analysis)/g,
      /(\w+Data)/g,
      /(\w+Count)/g,
      /(\w+Rating)/g,
      /(\w+Performance)/g,
      /(\w+Results)/g,
      /(\w+Metrics)/g
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        dataPoints.push(...matches);
      }
    });

    return [...new Set(dataPoints)]; // Remove duplicates
  }

  // Extract what data each tab is trying to use
  extractDataUsage(content) {
    const dataUsage = [];
    
    // Look for data.something patterns
    const dataMatches = content.match(/data\.(\w+)/g);
    if (dataMatches) {
      dataMatches.forEach(match => {
        const property = match.replace('data.', '');
        dataUsage.push(property);
      });
    }

    return [...new Set(dataUsage)]; // Remove duplicates
  }

  // Use Claude to analyze everything (if API key available)
  async claudeAnalysis() {
    if (!this.anthropic) {
      console.log('📝 Skipping Claude analysis (no API key)');
      return null;
    }

    const analysisPrompt = `
You are analyzing a local business audit tool. Here's the complete structure:

BACKEND SERVICES:
${this.backendServices.map(service => `
Service: ${service.name}
File: ${service.file}
Exports: ${service.exports.join(', ')}
Data Points: ${service.dataPoints.join(', ')}
`).join('\n')}

FRONTEND TABS:
${this.frontendTabs.map(tab => `
Tab: ${tab.name}
File: ${tab.file}
Data Usage: ${tab.dataUsage.join(', ')}
`).join('\n')}

ANALYSIS TASKS:
1. Identify which backend services are NOT being used by any frontend tab
2. Identify which frontend tabs are trying to use data that doesn't exist
3. Find gaps where backend generates data but frontend doesn't display it
4. Suggest missing analyzers based on common audit tool features
5. Recommend data structure improvements

Please provide a detailed analysis with specific recommendations for:
- Missing connections between backend and frontend
- Unused backend data
- Frontend tabs missing data
- Suggested new analyzers to add
- Data structure optimization

Format as JSON with clear categories.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: analysisPrompt }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Claude analysis failed:', error.message);
      return null;
    }
  }

  // Run complete analysis
  async analyze() {
    console.log('🔍 Starting comprehensive audit tool analysis...\n');

    await this.scanBackendServices();
    await this.scanFrontendTabs();

    console.log(`📊 Found ${this.backendServices.length} backend services`);
    console.log(`📱 Found ${this.frontendTabs.length} frontend tabs\n`);

    // Local analysis first
    this.performLocalAnalysis();

    // Then Claude's deep analysis if available
    if (this.anthropic) {
      console.log('🤖 Running Claude analysis...');
      const claudeResults = await this.claudeAnalysis();
      this.generateReport(claudeResults);
    } else {
      this.generateReport(null);
    }
  }

  // Basic local analysis before Claude
  performLocalAnalysis() {
    console.log('📋 LOCAL ANALYSIS RESULTS:\n');

    // Check for obvious missing connections
    this.frontendTabs.forEach(tab => {
      const missingData = tab.dataUsage.filter(dataPoint => {
        return !this.backendServices.some(service => 
          service.exports.includes(dataPoint) || 
          service.dataPoints.includes(dataPoint)
        );
      });

      if (missingData.length > 0) {
        console.log(`❌ ${tab.name} Tab missing data:`, missingData);
        tab.missingData = missingData;
      } else {
        console.log(`✅ ${tab.name} Tab: All data connected`);
      }
    });

    console.log('\n📊 BACKEND SERVICES STATUS:');
    // Check for unused backend services
    this.backendServices.forEach(service => {
      const isUsed = this.frontendTabs.some(tab => 
        tab.dataUsage.some(usage => 
          service.exports.includes(usage) || 
          service.dataPoints.includes(usage)
        )
      );

      if (!isUsed) {
        console.log(`⚠️  Potentially unused service: ${service.name}`);
      } else {
        console.log(`✅ ${service.name}: Being used by frontend`);
      }
    });
  }

  // Generate comprehensive report
  generateReport(claudeResults) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE AUDIT TOOL ANALYSIS REPORT');
    console.log('='.repeat(60) + '\n');

    // Backend services summary
    console.log('🔧 BACKEND SERVICES:');
    this.backendServices.forEach(service => {
      console.log(`  ✅ ${service.name}: ${service.dataPoints.length} data points`);
    });

    // Frontend tabs summary
    console.log('\n📱 FRONTEND TABS:');
    this.frontendTabs.forEach(tab => {
      const status = tab.missingData && tab.missingData.length > 0 ? '❌' : '✅';
      console.log(`  ${status} ${tab.name}: ${tab.dataUsage.length} data points used`);
    });

    // Claude's insights
    if (claudeResults) {
      console.log('\n🤖 CLAUDE AI INSIGHTS:');
      console.log(JSON.stringify(claudeResults, null, 2));
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Review missing data connections above');
    console.log('2. Consider implementing unused service data in frontend');
    console.log('3. Add error handling for missing data points');
    console.log('4. Implement data validation between backend and frontend');

    if (!this.anthropic) {
      console.log('5. Add ANTHROPIC_API_KEY to .env for AI-powered insights');
    }

    console.log('\n✨ Analysis complete!');
  }
}

// Run the analysis
async function main() {
  const analyzer = new AuditToolAnalyzer();
  await analyzer.analyze();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AuditToolAnalyzer };