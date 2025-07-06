#!/usr/bin/env python3
"""
Audit System Troubleshooter - Terminal Version for Codespaces
Run with: python troubleshoot.py
"""

import os
import sys
import json
import requests
import time
from pathlib import Path

class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class AuditTroubleshooter:
    def __init__(self):
        self.colors = Colors()
        self.project_path = self.find_project_path()
        self.service_issues = []
        self.diagnosis = "unknown"
        
    def find_project_path(self):
        """Find the project directory"""
        current = Path.cwd()
        
        # Check current directory and parents for the project
        possible_paths = [
            current,
            current / "local-business-audit",
            current.parent / "local-business-audit", 
            current / "react-audit" / "local-business-audit",
            Path("/workspaces/react-audit/local-business-audit"),
            Path.home() / "local-business-audit"
        ]
        
        for path in possible_paths:
            if path.exists() and (path / "backend").exists():
                return path
                
        return current
        
    def print_header(self, title):
        """Print a section header"""
        print(f"\n{self.colors.CYAN}{self.colors.BOLD}{'='*60}{self.colors.END}")
        print(f"{self.colors.CYAN}{self.colors.BOLD}🔍 {title}{self.colors.END}")
        print(f"{self.colors.CYAN}{self.colors.BOLD}{'='*60}{self.colors.END}")
        
    def print_success(self, message):
        """Print success message"""
        print(f"{self.colors.GREEN}✅ {message}{self.colors.END}")
        
    def print_error(self, message):
        """Print error message"""
        print(f"{self.colors.RED}❌ {message}{self.colors.END}")
        
    def print_warning(self, message):
        """Print warning message"""
        print(f"{self.colors.YELLOW}⚠️  {message}{self.colors.END}")
        
    def print_info(self, message):
        """Print info message"""
        print(f"{self.colors.BLUE}ℹ️  {message}{self.colors.END}")
        
    def print_title(self):
        """Print application title"""
        print(f"\n{self.colors.PURPLE}{self.colors.BOLD}🔧 AUDIT SYSTEM TROUBLESHOOTER{self.colors.END}")
        print(f"{self.colors.PURPLE}Terminal Version for GitHub Codespaces{self.colors.END}")
        print(f"{self.colors.WHITE}📍 Project Path: {self.project_path}{self.colors.END}")
        print(f"{self.colors.WHITE}🕐 Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}{self.colors.END}")
        
    def show_menu(self):
        """Show interactive menu"""
        print(f"\n{self.colors.BOLD}Choose an option:{self.colors.END}")
        print(f"{self.colors.GREEN}1. 🚀 Run Full Diagnostic{self.colors.END}")
        print(f"{self.colors.BLUE}2. ⚡ Quick API Test{self.colors.END}")
        print(f"{self.colors.YELLOW}3. 📁 Change Project Path{self.colors.END}")
        print(f"{self.colors.RED}4. 🚪 Exit{self.colors.END}")
        
        try:
            choice = input(f"\n{self.colors.BOLD}Enter your choice (1-4): {self.colors.END}")
            return choice.strip()
        except KeyboardInterrupt:
            print(f"\n{self.colors.YELLOW}Goodbye!{self.colors.END}")
            sys.exit(0)
            
    def change_project_path(self):
        """Allow user to change project path"""
        print(f"\n{self.colors.BOLD}Current path: {self.project_path}{self.colors.END}")
        new_path = input(f"{self.colors.BOLD}Enter new project path (or press Enter to keep current): {self.colors.END}")
        
        if new_path.strip():
            path = Path(new_path.strip())
            if path.exists():
                self.project_path = path
                self.print_success(f"Project path updated to: {self.project_path}")
            else:
                self.print_error("Path does not exist!")
                
    def check_project_structure(self):
        """Check if project structure is correct"""
        self.print_header("PROJECT STRUCTURE CHECK")
        
        required_paths = [
            "backend",
            "frontend", 
            "backend/services",
            "backend/package.json"
        ]
        
        all_good = True
        for path in required_paths:
            full_path = self.project_path / path
            if full_path.exists():
                self.print_success(f"Found: {path}")
            else:
                self.print_error(f"Missing: {path}")
                all_good = False
                
        if all_good:
            self.print_success("Project structure looks good!")
        else:
            self.print_warning("Project structure issues detected")
            
        return all_good
        
    def check_backend_health(self):
        """Check if backend is running and healthy"""
        self.print_header("BACKEND HEALTH CHECK")
        
        try:
            print("🔄 Checking backend health...")
            response = requests.get("http://localhost:3001/api/health", timeout=5)
            if response.status_code == 200:
                self.print_success("Backend is running and responding")
                self.print_info(f"Health response: {response.text}")
                return True
            else:
                self.print_error(f"Backend responded with status {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.print_error("Backend is not running or not accessible on port 3001")
            self.print_info("💡 Start backend with: cd backend && npm run dev")
            return False
            
        except requests.exceptions.Timeout:
            self.print_error("Backend request timed out")
            return False
            
        except Exception as e:
            self.print_error(f"Backend health check failed: {str(e)}")
            return False
            
    def test_api_with_mock_data(self):
        """Test API with LM Finishing mock data"""
        self.print_header("API RESPONSE TEST")
        
        mock_data = {
            "businessName": "LM Finishing and Construction",
            "businessType": "Carpenter", 
            "address": "1760 E Fall St",
            "city": "Eagle Mountain",
            "state": "Utah",
            "zipCode": "84005",
            "phone": "13855008437",
            "website": "https://lmfinishing.com/",
            "serviceAreas": "Eagle Mountain, Utah County, Salt Lake County",
            "primaryGoal": "Get More Leads",
            "challenges": ["Not Getting Enough Leads", "Website Isnt Bringing In Leads"],
            "currentMarketing": ["Word of Mouth", "Direct Mail", "SEO Optimization"],
            "budget": "Under $500",
            "competitors": "Local handyman services, general contractors in Utah County",
            "contactInfo": {
                "firstName": "Ross",
                "lastName": "Logan", 
                "email": "rosswlogan@gmail.com"
            },
            "businessContext": {
                "employeeCount": "2-5",
                "businessAge": "1-3 years",
                "uniqueSellingPoint": "Quality finishing work",
                "targetCustomer": "Homeowners in Utah County",
                "desiredLeads": "11-20"
            },
            "isMockData": True,
            "mockDataSource": "LM Finishing ActivePieces Submission"
        }
        
        try:
            print("🚀 Sending audit request with LM Finishing data...")
            print("⏱️  This may take 10-30 seconds...")
            
            response = requests.post(
                "http://localhost:3001/api/audit",
                json=mock_data,
                timeout=60  # Longer timeout for audit
            )
            
            if response.status_code == 200:
                self.print_success("API responded successfully!")
                
                try:
                    data = response.json()
                    self.analyze_api_response(data)
                    return True
                except json.JSONDecodeError:
                    self.print_error("API returned invalid JSON")
                    print(f"Raw response: {response.text[:500]}...")
                    return False
                    
            elif response.status_code == 429:
                self.print_warning("Rate limited - audit already exists for this business")
                try:
                    data = response.json()
                    if 'duplicateInfo' in data:
                        self.print_info(f"Duplicate reason: {data['duplicateInfo'].get('reason', 'Unknown')}")
                except:
                    pass
                return False
                    
            else:
                self.print_error(f"API returned status {response.status_code}")
                print(f"Response: {response.text[:500]}...")
                return False
                
        except requests.exceptions.ConnectionError:
            self.print_error("Could not connect to API - is backend running?")
            return False
            
        except requests.exceptions.Timeout:
            self.print_error("API request timed out (>60 seconds)")
            return False
            
        except Exception as e:
            self.print_error(f"API test failed: {str(e)}")
            return False
            
    def analyze_api_response(self, data):
        """Analyze the API response data"""
        print(f"\n{self.colors.PURPLE}{self.colors.BOLD}📊 ANALYZING API RESPONSE{self.colors.END}")
        print(f"{self.colors.PURPLE}{'-'*40}{self.colors.END}")
        
        # Check if it's an error response
        if 'error' in data:
            self.print_error(f"API returned error: {data.get('error')}")
            if 'message' in data:
                self.print_error(f"Error message: {data.get('message')}")
            return
            
        # Count total fields
        total_fields = len(data.keys())
        self.print_info(f"Total fields returned: {total_fields}")
        
        # Save response for inspection
        response_file = "/tmp/audit_response.json"
        try:
            with open(response_file, 'w') as f:
                json.dump(data, f, indent=2)
            self.print_info(f"Full response saved to: {response_file}")
        except:
            pass
        
        # Check critical fields
        critical_fields = [
            'businessName', 'visibilityScore', 'currentRank', 'reviewCount',
            'rating', 'photoCount', 'websiteScore', 'actionItems',
            'keywordPerformance', 'pagespeedAnalysis', 'businessImpact',
            'socialMediaAnalysis', 'citationAnalysis', 'competitiveGaps',
            'industryBenchmarks', 'progressMetrics', 'highlights'
        ]
        
        present_fields = []
        missing_fields = []
        undefined_fields = []
        
        print(f"\n{self.colors.BOLD}🔍 Critical Field Check:{self.colors.END}")
        for field in critical_fields:
            if field in data:
                value = data[field]
                if value is None or value == "undefined" or (isinstance(value, str) and value.strip() == ""):
                    undefined_fields.append(field)
                    self.print_warning(f"{field}: present but null/undefined")
                else:
                    present_fields.append(field)
                    self.print_success(f"{field}: ✓")
            else:
                missing_fields.append(field)
                self.print_error(f"{field}: missing")
                
        # Calculate completion rate
        completion_rate = len(present_fields) * 100 // len(critical_fields)
        
        print(f"\n{self.colors.BOLD}📈 COMPLETION ANALYSIS:{self.colors.END}")
        print(f"   Present: {len(present_fields)} fields")
        print(f"   Missing: {len(missing_fields)} fields")
        print(f"   Undefined: {len(undefined_fields)} fields")
        print(f"   Completion rate: {completion_rate}%")
        
        if completion_rate < 30:
            self.print_error("🚨 CRITICAL: Major data pipeline failure")
            self.diagnosis = "critical_failure"
        elif completion_rate < 70:
            self.print_warning("⚠️  MODERATE: Partial data pipeline issues")
            self.diagnosis = "partial_failure"
        else:
            self.print_success("✅ GOOD: Data pipeline mostly working")
            self.diagnosis = "mostly_working"
            
        # Show sample values
        print(f"\n{self.colors.BOLD}📋 Sample Data:{self.colors.END}")
        if 'businessName' in data:
            print(f"Business Name: {data['businessName']}")
        if 'visibilityScore' in data:
            print(f"Visibility Score: {data['visibilityScore']}")
        if 'actionItems' in data and isinstance(data['actionItems'], dict):
            critical_count = len(data['actionItems'].get('critical', []))
            moderate_count = len(data['actionItems'].get('moderate', []))
            print(f"Action Items: {critical_count} critical, {moderate_count} moderate")
            
    def analyze_service_files(self):
        """Analyze individual service files"""
        self.print_header("SERVICE FILES ANALYSIS")
        
        services_dir = self.project_path / "backend" / "services"
        if not services_dir.exists():
            self.print_error("Services directory not found!")
            return
            
        services = [
            "auditProcessor.js", "competitorService.js", "keywordService.js",
            "pagespeedService.js", "citationService.js", "reviewService.js", 
            "schemaService.js", "websiteService.js"
        ]
        
        self.service_issues = []
        
        for service in services:
            service_path = services_dir / service
            if service_path.exists():
                try:
                    with open(service_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = len(content.splitlines())
                        
                    if lines < 20:
                        self.print_error(f"{service}: {lines} lines - TOO SHORT, likely placeholder")
                        self.service_issues.append(f"{service}: too_short")
                    elif lines < 100:
                        self.print_warning(f"{service}: {lines} lines - Basic implementation")
                        self.service_issues.append(f"{service}: basic")
                    else:
                        self.print_success(f"{service}: {lines} lines - Comprehensive")
                        
                except Exception as e:
                    self.print_error(f"{service}: Error reading file - {str(e)}")
                    self.service_issues.append(f"{service}: read_error")
            else:
                self.print_error(f"{service}: MISSING FILE")
                self.service_issues.append(f"{service}: missing")
                
    def analyze_audit_processor(self):
        """Deep analysis of auditProcessor.js"""
        self.print_header("AUDIT PROCESSOR DEEP ANALYSIS")
        
        processor_path = self.project_path / "backend" / "services" / "auditProcessor.js"
        if not processor_path.exists():
            self.print_error("auditProcessor.js not found!")
            return
            
        try:
            with open(processor_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = len(content.splitlines())
                
            self.print_info(f"auditProcessor.js: {lines} lines")
            
            # Check for key patterns
            patterns = [
                ("keywordPerformance", "keyword performance structure"),
                ("pagespeedAnalysis", "pagespeed analysis structure"), 
                ("businessImpact", "business impact structure"),
                ("socialMediaAnalysis", "social media analysis structure"),
                ("processAuditLikeActivePieces", "ActivePieces-style processing"),
                ("competitorService", "competitor service import"),
                ("keywordService", "keyword service import"),
                ("pagespeedService", "pagespeed service import")
            ]
            
            print(f"\n{self.colors.BOLD}🔍 Checking key patterns:{self.colors.END}")
            missing_patterns = []
            for pattern, description in patterns:
                if pattern in content:
                    self.print_success(f"Has {description}")
                else:
                    self.print_error(f"Missing {description}")
                    missing_patterns.append(pattern)
                    
            if lines < 200:
                self.print_error(f"🚨 CRITICAL: auditProcessor.js too short ({lines} lines)")
                print("   Expected: 500+ lines for comprehensive processing")
                print("   Current: Basic processor that doesn't aggregate service data")
                self.service_issues.append("auditProcessor: too_short_critical")
            
            if missing_patterns:
                self.print_warning(f"Missing {len(missing_patterns)} key patterns")
                
        except Exception as e:
            self.print_error(f"Error analyzing auditProcessor.js: {str(e)}")
            
    def generate_recommendations(self):
        """Generate specific recommendations based on findings"""
        self.print_header("RECOMMENDATIONS & FIXES")
        
        if self.diagnosis == "critical_failure":
            print(f"{self.colors.RED}{self.colors.BOLD}🚨 CRITICAL ISSUE: Data Pipeline Failure{self.colors.END}")
            print("")
            print("ROOT CAUSE: auditProcessor.js not aggregating service data properly")
            print("")
            print(f"{self.colors.BOLD}🔧 IMMEDIATE FIXES NEEDED:{self.colors.END}")
            print("1. Replace auditProcessor.js with comprehensive version")
            print("2. Ensure all services export proper methods")  
            print("3. Check for import/export mismatches")
            print("")
            print(f"{self.colors.BOLD}📋 STEP-BY-STEP FIX:{self.colors.END}")
            print("1. Backup: cp services/auditProcessor.js services/auditProcessor.js.backup")
            print("2. Replace with comprehensive processor (from our conversation)")
            print("3. Restart backend: npm run dev")
            print("4. Re-test with this tool")
            
        elif self.diagnosis == "partial_failure":
            print(f"{self.colors.YELLOW}{self.colors.BOLD}⚠️  MODERATE ISSUE: Partial Data Pipeline{self.colors.END}")
            print("")
            print("Some services working, but missing key data structures")
            print("")
            print(f"{self.colors.BOLD}🔧 LIKELY FIXES:{self.colors.END}")
            print("1. Update auditProcessor.js to return comprehensive data")
            print("2. Check individual service implementations") 
            print("3. Verify service method names match processor expectations")
            
        else:
            print(f"{self.colors.GREEN}{self.colors.BOLD}✅ GOOD: Pipeline Mostly Working{self.colors.END}")
            print("")
            print(f"{self.colors.BOLD}🔧 MINOR IMPROVEMENTS:{self.colors.END}")
            print("1. Check for undefined values in response")
            print("2. Add better error handling")
            print("3. Enhance data validation")
            
        print("")
        print(f"{self.colors.BOLD}📊 SERVICE ISSUES FOUND:{self.colors.END}")
        if self.service_issues:
            for issue in self.service_issues:
                print(f"  • {issue}")
        else:
            print("  No major service issues detected")
            
        print("")
        print(f"{self.colors.BOLD}🔍 NEXT STEPS:{self.colors.END}")
        print("1. Run analyzer: npm run analyze-tool (in backend directory)")
        print("2. Check backend console logs for detailed errors")
        print("3. Test individual services")
        print("4. Compare with expected ActivePieces structure")
        
    def run_full_diagnostic(self):
        """Run comprehensive diagnostic"""
        print(f"\n{self.colors.CYAN}{self.colors.BOLD}🚀 Running Full Diagnostic...{self.colors.END}")
        
        # Step 1: Check project structure
        if not self.check_project_structure():
            self.print_error("Cannot continue - project structure issues")
            return
            
        # Step 2: Check backend health
        if not self.check_backend_health():
            self.print_warning("Backend not running - some tests will be skipped")
            backend_running = False
        else:
            backend_running = True
            
        # Step 3: Test API if backend is running
        if backend_running:
            self.test_api_with_mock_data()
        
        # Step 4: Analyze service files
        self.analyze_service_files()
        
        # Step 5: Check auditProcessor specifically
        self.analyze_audit_processor()
        
        # Step 6: Generate recommendations
        self.generate_recommendations()
        
        print(f"\n{self.colors.GREEN}{self.colors.BOLD}✅ Full diagnostic complete!{self.colors.END}")
        input(f"\n{self.colors.BOLD}Press Enter to return to menu...{self.colors.END}")
        
    def quick_api_test(self):
        """Quick API test only"""
        print(f"\n{self.colors.CYAN}{self.colors.BOLD}⚡ Running Quick API Test...{self.colors.END}")
        
        if not self.check_backend_health():
            return
            
        if self.test_api_with_mock_data():
            self.print_success("Quick test complete!")
        else:
            self.print_error("Quick test failed!")
            
        input(f"\n{self.colors.BOLD}Press Enter to return to menu...{self.colors.END}")
        
    def run(self):
        """Main application loop"""
        self.print_title()
        
        while True:
            self.show_menu()
            choice = self.show_menu()
            
            if choice == '1':
                self.run_full_diagnostic()
            elif choice == '2':
                self.quick_api_test()
            elif choice == '3':
                self.change_project_path()
            elif choice == '4':
                print(f"\n{self.colors.GREEN}👋 Goodbye!{self.colors.END}")
                break
            else:
                self.print_error("Invalid choice! Please enter 1-4.")

if __name__ == "__main__":
    try:
        app = AuditTroubleshooter()
        app.run()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 Goodbye!{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}❌ Error: {e}{Colors.END}")
        import traceback
        traceback.print_exc()